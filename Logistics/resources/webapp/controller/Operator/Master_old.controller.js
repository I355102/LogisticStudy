/*global history */
sap.ui.define([
		"CaseStudy/Logistics/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/Sorter",
		"sap/ui/model/FilterOperator",
		"sap/m/GroupHeaderListItem",
		"sap/ui/Device",
		"CaseStudy/Logistics/model/formatter",
		'sap/m/MessageToast'
	], function (BaseController, JSONModel,MessageToast, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, formatter) {
		"use strict";

		return BaseController.extend("CaseStudy.Logistics.controller.Operator.Master", {

			formatter: formatter,

			onInit : function () {
				// Control state model
			
				var oList = this.byId("list"),
					oViewModel = this._createViewModel(),

					iOriginalBusyDelay = oList.getBusyIndicatorDelay();

				this._oGroupFunctions = {
					Price : function(oContext) {
						var iGrouper = oContext.getProperty('Price'),
							key, text;
						if (iGrouper <= 20) {
							key = "LE20";
							text = this.getResourceBundle().getText("masterGroup1Header1");
						} else {
							key = "GT20";
							text = this.getResourceBundle().getText("masterGroup1Header2");
						}
						return {
							key: key,
							text: text
						};
					}.bind(this)
				};

				this._oList = oList;
				// keeps the filter and search state
				this._oListFilterState = {
					aFilter : [],
					aSearch : []
				};

				this.setModel(oViewModel, "masterView");
				// Make sure, busy indication is showing immediately so there is no
				// break after the busy indication for loading the view's meta data is
				// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
				oList.attachEventOnce("updateFinished", function(){
					// Restore original busy indicator delay for the list
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				});

				this.getView().addEventDelegate({
					onBeforeFirstShow: function () {
						this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
					}.bind(this)
				});

				this.getRouter().getRoute("operator_packets_master").attachPatternMatched(this._onObjectMatched, this);
				
			//	this.setModel(oViewModel, "detailView");

			//	this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
				this.getRouter().attachBypassed(this.onBypassed, this);
			
			},
			
	/*	 getOdataPromise:function(oModel, sObjectId)
		 {
	      	var oDeferred = new jQuery.Deferred();
	      	
	      	oModel.read("/packetorder?$filter= F_Region_id eq '" + sObjectId+"' and Packet_Status eq 'A'",{
	      		success:function(data,response){
		    		oDeferred.resolve(data.results);
		    		
	      		},
	      		error: function(error){
	      			oDeferred.reject(error);
	      		}
      	});
      	return oDeferred.promise();
      },	*/	
    		//not assigned
    		getNotAssignOdataPromise:function(oModel, sObjectId)
		 {
	      	var oDeferred = new jQuery.Deferred();
	      	
	      	oModel.read("/packetorder?$filter= F_Region_id eq '" + sObjectId+"' and Packet_Status eq 'D'",{
	      		success:function(data,response){
		    		oDeferred.resolve(data.results);
		    
	      		},
	      		error: function(error){
	      			oDeferred.reject(error);
	      		}
      	});
      	return oDeferred.promise();
      }, 
			_onObjectMatched : function (oEvent) {
				var oModel = new sap.ui.model.odata.ODataModel("/packetorder.xsodata", true);
				var sObjectId =  oEvent.getParameter("arguments").R_Id;
				
			//	var AssignmyPromise=this.getOdataPromise(oModel, sObjectId);
				var NotAssignmyPromise=this.getNotAssignOdataPromise(oModel, sObjectId);
				
		/*		$.when(AssignmyPromise).done(
      			function(oData){
      				var oDataModel = new JSONModel({"packets":oData});
      				this.getView().setModel(oDataModel,"assignedModel");
      			}.bind(this)); */
      			
      			$.when(NotAssignmyPromise).done(
      			function(oData){
      				var oDataModel = new JSONModel({"packets":oData});
      				this.getView().setModel(oDataModel,"NotassignedModel");
      			}.bind(this)); 
      			
			},

			onUpdateFinished : function (oEvent) {
				// update the master list object counter after new data is loaded
				this._updateListItemCount(oEvent.getParameter("total"));
			},

			/**
			 * Event handler for the master search field. Applies current
			 * filter value and triggers a new search. If the search field's
			 * 'refresh' button has been pressed, no new search is triggered
			 * and the list binding is refresh instead.
			 * @param {sap.ui.base.Event} oEvent the search event
			 * @public
			 */
			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
					return;
				}

				var sQuery = oEvent.getParameter("query");

				if (sQuery) {
					this._oListFilterState.aSearch = [new Filter("Name", FilterOperator.Contains, sQuery)];
				} else {
					this._oListFilterState.aSearch = [];
				}
				this._applyFilterSearch();

			},

			/**
			 * Event handler for refresh event. Keeps filter, sort
			 * and group settings and refreshes the list binding.
			 * @public
			 */
			onRefresh : function () {
				this._oList.getBinding("items").refresh();
			},

			/**
			 * Event handler for the filter, sort and group buttons to open the ViewSettingsDialog.
			 * @param {sap.ui.base.Event} oEvent the button press event
			 * @public
			 */
			onOpenViewSettings : function (oEvent) {
				if (!this._oViewSettingsDialog) {
					this._oViewSettingsDialog = sap.ui.xmlfragment("CaseStudy.Operator.view.ViewSettingsDialog", this);
					this.getView().addDependent(this._oViewSettingsDialog);
					// forward compact/cozy style into Dialog
					this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				}
				var sDialogTab = "sort";
				if (oEvent.getSource() instanceof sap.m.Button) {
					var sButtonId = oEvent.getSource().sId;
					if (sButtonId.match("filter")) {
						sDialogTab = "filter";
					} else if (sButtonId.match("group")) {
						sDialogTab = "group";
					}
				}
				this._oViewSettingsDialog.open(sDialogTab);
			},

			onConfirmViewSettingsDialog : function (oEvent) {
				var aFilterItems = oEvent.getParameters().filterItems,
					aFilters = [],
					aCaptions = [];

				// update filter state:
				// combine the filter array and the filter string
				aFilterItems.forEach(function (oItem) {
					switch (oItem.getKey()) {
						case "Filter1" :
							aFilters.push(new Filter("Price", FilterOperator.LE, 100));
							break;
						case "Filter2" :
							aFilters.push(new Filter("Price", FilterOperator.GT, 100));
							break;
						default :
							break;
					}
					aCaptions.push(oItem.getText());
				});

				this._oListFilterState.aFilter = aFilters;
				this._updateFilterBar(aCaptions.join(", "));
				this._applyFilterSearch();
				this._applySortGroup(oEvent);
			},

			/**
			 * Apply the chosen sorter and grouper to the master list
			 * @param {sap.ui.base.Event} oEvent the confirm event
			 * @private
			 */
			_applySortGroup: function (oEvent) {
				var mParams = oEvent.getParameters(),
					sPath,
					bDescending,
					aSorters = [];
				// apply sorter to binding
				// (grouping comes before sorting)
				if (mParams.groupItem) {
					sPath = mParams.groupItem.getKey();
					bDescending = mParams.groupDescending;
					var vGroup = this._oGroupFunctions[sPath];
					aSorters.push(new Sorter(sPath, bDescending, vGroup));
				}
				sPath = mParams.sortItem.getKey();
				bDescending = mParams.sortDescending;
				aSorters.push(new Sorter(sPath, bDescending));
				this._oList.getBinding("items").sort(aSorters);
			},

			/**
			 * Event handler for the list selection event
			 * @param {sap.ui.base.Event} oEvent the list selectionChange event
			 * @public
			 */
			onSelectionChange : function (oEvent) {
				var oList = oEvent.getSource(),
					bSelected = oEvent.getParameter("selected");

				// skip navigation when deselecting an item in multi selection mode
				if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
					// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
					this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
				}
			},
			
			onSelectionChangeAssign : function (oEvent) {
				var oList = oEvent.getSource(),
					bSelected = oEvent.getParameter("selected");

				// skip navigation when deselecting an item in multi selection mode
				if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
					// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
					this._showDetailAssign(oEvent.getParameter("listItem") || oEvent.getSource());
				}
			},

			/**
			 * Event handler for the bypassed event, which is fired when no routing pattern matched.
			 * If there was an object selected in the master list, that selection is removed.
			 * @public
			 */
			onBypassed : function () {
				this._oList.removeSelections(true);
			},

			/**
			 * Used to create GroupHeaders with non-capitalized caption.
			 * These headers are inserted into the master list to
			 * group the master list's items.
			 * @param {Object} oGroup group whose text is to be displayed
			 * @public
			 * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
			 */
			createGroupHeader : function (oGroup) {
				return new GroupHeaderListItem({
					title : oGroup.text,
					upperCase : false
				});
			},
			GoBack:function(){
				var bReplace = true;
				this.getRouter().navTo("operator", {}, bReplace);
			},

			_createViewModel : function() {
				return new JSONModel({
					isFilterBarVisible: false,
					filterBarLabel: "",
					delay: 0,
					title: this.getResourceBundle().getText("masterTitleCount", [0]),
					noDataText: this.getResourceBundle().getText("masterListNoDataText"),
					sortBy: "Name",
					groupBy: "None"
				});
			},

			_onMasterMatched :  function() {
				//Set the layout property of the FCL control to 'OneColumn'
				this.getModel("appView").setProperty("/layout", "OneColumn");
			},

			/**
			 * Shows the selected item on the detail page
			 * On phones a additional history entry is created
			 * @param {sap.m.ObjectListItem} oItem selected Item
			 * @private
			 */
			_showDetail : function (oItem) {
				var bReplace = !Device.system.phone;
				this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
				this.getRouter().navTo("operatorobject", {
					Packet_id : oItem.getBindingContext("NotassignedModel").getProperty("Packet_id")
				}, bReplace);
			},
	/*		_showDetailAssign : function (oItem) {
				var bReplace = !Device.system.phone;
				this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
				this.getRouter().navTo("operatorobjectAssign", {
					Packet_id : oItem.getBindingContext("assignedModel").getProperty("Packet_id")
				}, bReplace);
			}, */

			/**
			 * Sets the item count on the master list header
			 * @param {integer} iTotalItems the total number of items in the list
			 * @private
			 */
			_updateListItemCount : function (iTotalItems) {
				var sTitle;
				// only update the counter if the length is final
				if (this._oList.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
					this.getModel("masterView").setProperty("/title", sTitle);
				}
			},

			/**
			 * Internal helper method to apply both filter and search state together on the list binding
			 * @private
			 */
			_applyFilterSearch : function () {
				var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
					oViewModel = this.getModel("masterView");
				this._oList.getBinding("items").filter(aFilters, "Application");
				// changes the noDataText of the list in case there are no filter results
				if (aFilters.length !== 0) {
					oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
				} else if (this._oListFilterState.aSearch.length > 0) {
					// only reset the no data text to default when no new search was triggered
					oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
				}
			},

			/**
			 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
			 * @param {string} sFilterBarText the selected filter value
			 * @private
			 */
			_updateFilterBar : function (sFilterBarText) {
				var oViewModel = this.getModel("masterView");
				oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
				oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
			}

		});

	}
);