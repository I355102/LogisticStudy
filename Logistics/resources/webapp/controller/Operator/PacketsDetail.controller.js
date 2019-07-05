/*global location */
sap.ui.define([
		"CaseStudy/Logistics/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"CaseStudy/Logistics/model/formatter",
		"sap/ui/core/Fragment",
		"sap/m/MessageToast"
	], function (BaseController, JSONModel, formatter, Fragment, MessageToast) {
		"use strict";

		return BaseController.extend("CaseStudy.Logistics.controller.Operator.PacketsDetail", {

			formatter: formatter,


			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				var oViewModel = new JSONModel({
					busy : false,
					delay : 0,
					lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
				});

				this.getRouter().getRoute("operator_packets_detail").attachPatternMatched(this._onObjectMatched, this);

				this.setModel(oViewModel, "detailView");

				//this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Event handler when the share by E-Mail button has been clicked
			 * @public
			 */
			onSendEmailPress : function () {
				var oViewModel = this.getModel("detailView");

				sap.m.URLHelper.triggerEmail(
					null,
					oViewModel.getProperty("/shareSendEmailSubject"),
					oViewModel.getProperty("/shareSendEmailMessage")
				);
			},


			/**
			 * Updates the item count within the line item table's header
			 * @param {object} oEvent an event containing the total number of items in the list
			 * @private
			 */
			onListUpdateFinished : function (oEvent) {
				var sTitle,
					iTotalItems = oEvent.getParameter("total"),
					oViewModel = this.getModel("detailView");

				// only update the counter if the length is final
				if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
					if (iTotalItems) {
						sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
					} else {
						//Display 'Line Items' instead of 'Line items (0)'
						sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
					}
					oViewModel.setProperty("/lineItemListTitle", sTitle);
				}
			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
		
		getOdataPromise:function(oModel, sObjectId){
      	var oDeferred = new jQuery.Deferred();
      	
      	oModel.read("/dagentlist?$filter= F_Region_Id eq '" + sObjectId+"'",{
      		success:function(data,response){
	    		oDeferred.resolve(data.results);
      		},
      		error: function(error){
      			oDeferred.reject(error);
      		}
      	});
      	return oDeferred.promise();
      },
      	getItemdataPromise:function(oModel, sObjectId){
      	var oDeferred = new jQuery.Deferred();
      	
      	oModel.read("/packetorder?$filter= Packet_id eq '" + sObjectId+"'",{
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
				var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
				var oModel = new sap.ui.model.odata.ODataModel("/dagentlist.xsodata", true);
				var lineItemsModel = new sap.ui.model.odata.ODataModel("/packetorder.xsodata", true);
				var RegionId = oEvent.getParameter("arguments").R_Id;
				var PacketId = oEvent.getParameter("arguments").Packet_id;
				this.byId("Packet_Id").setText(PacketId);
				localStorage.setItem("PacketId", PacketId);
				localStorage.setItem("RegionId", RegionId);
			
				
				var myPromise=this.getOdataPromise(oModel, RegionId);
				$.when(myPromise).done(
      			function(oData){
      				if(oData.length !== 0){
      					this.byId("assign_button").setText("Assign");
      					var oDataModel = new JSONModel({"agents":oData});
      					this.getView().setModel(oDataModel,"agents");
      				}else{
      					this.byId("assign_button").setText("Redistribute");
      				}
      				oGlobalBusyDialog.close();
      				
      			}.bind(this));
      			
      			var itemPromise=this.getItemdataPromise(lineItemsModel, PacketId);
				$.when(itemPromise).done(
      			function(oData){
      				var oDataModel = new JSONModel({"orders":oData});
      				this.getView().setModel(oDataModel,"orders");
      			}.bind(this));
      			
			},
			onAssignAgent:function(DeliveryId,agentName){
			var payload = {};
			var oThis = this;
			payload.packet_id = localStorage.getItem("PacketId");
			payload.delivery_id = DeliveryId;   
			
			var postData = JSON.stringify(payload);
			console.log(postData);
			//send data to node.js server
			$.ajax({
           type: "POST",
           url: "/assignPacket.xsjs",
           contentType: "application/json",
           data: postData,
           dataType: "json",
           crossDomain: true,
		  success: function(data) {
		  			console.log("updated");
                  MessageToast.show("Packet assigned to " + agentName );
                  oThis.onCloseDetailPress();
               },
               error: function(data) {
                  var message = JSON.stringify(data);
                  console.log("some error");
                  alert(message);
               }
            });	
			},
			
			onAssignPress:function(oEvent){
			var oList = this.byId("agent_list");
			var BtnText = this.byId("assign_button").getText();
			if(BtnText === "Assign"){
				var oItem = oList.getSelectedItem();
				var DeliveryId = oItem.getBindingContext("agents").getProperty("F_Delivery_Id");
				var agentName = oItem.getBindingContext("agents").getProperty("name");
				this.onAssignAgent(DeliveryId, agentName);
			}else{
				oList.removeAllItems();
				this.onRedistributeOrders(localStorage.getItem("PacketId"),"20180918",localStorage.getItem("RegionId"));
			}
			
	

		},

			_bindView : function (sObjectPath) {
				// Set busy indicator during view binding
				var oViewModel = this.getModel("detailView");

				// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
				oViewModel.setProperty("/busy", false);

				this.getView().bindElement({
					path : sObjectPath,
					events: {
						change : this._onBindingChange.bind(this),
						dataRequested : function () {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oElementBinding = oView.getElementBinding();

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("detailObjectNotFound");
					// if object could not be found, the selection in the master list
					// does not make sense anymore.
					this.getOwnerComponent().oListSelector.clearMasterListSelection();
					return;
				}

				var sPath = oElementBinding.getPath(),
					oResourceBundle = this.getResourceBundle(),
					oObject = oView.getModel().getObject(sPath),
					sObjectId = oObject.Id,
					sObjectName = oObject.Name,
					oViewModel = this.getModel("detailView");

				this.getOwnerComponent().oListSelector.selectAListItem(sPath);

				oViewModel.setProperty("/shareSendEmailSubject",
					oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
					oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},

			_onMetadataLoaded : function () {
				// Store original busy indicator delay for the detail view
				var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
					oViewModel = this.getModel("detailView"),
					oLineItemTable = this.byId("lineItemsList"),
					iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

				// Make sure busy indicator is displayed immediately when
				// detail view is displayed for the first time
				oViewModel.setProperty("/delay", 0);
				oViewModel.setProperty("/lineItemTableDelay", 0);

				oLineItemTable.attachEventOnce("updateFinished", function() {
					// Restore original busy indicator delay for line item table
					oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
				});

				// Binding the view will set it to not busy - so the view is always busy if it is not bound
				oViewModel.setProperty("/busy", true);
				// Restore original busy indicator delay for the detail view
				oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
			},

			/**
			 * Set the full screen mode to false and navigate to master page
			 */
			onCloseDetailPress: function () {
				//this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
				// No item should be selected on master after detail page is closed
				this.getModel("appView").setProperty("/layout", "OneColumn");
				this.getRouter().navTo("operator_packets_master",{
					R_Id : localStorage.getItem("RegionId")
				}, true);
			},

			/**
			 * Toggle between full and non full screen mode.
			 */
			toggleFullScreen: function () {
				var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
				this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
				if (!bFullScreen) {
					// store current layout and go full screen
					this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
					this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
				} else {
					// reset to previous layout
					this.getModel("appView").setProperty("/layout",  this.getModel("appView").getProperty("/previousLayout"));
				}
			},

			/**
			 * Opens the Action Sheet popover
			 * @param {sap.ui.base.Event} oEvent the press event of the share button
			 */
			onSharePress : function (oEvent) {
				var oButton = oEvent.getSource();

				// create action sheet only once
				if (!this._actionSheet) {
					this._actionSheet = sap.ui.xmlfragment(
						"sap.ui.demo.masterdetail.view.ActionSheet",
						this
					);
					this.getView().addDependent(this._actionSheet);
					// forward compact/cozy style into dialog
					jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this._actionSheet);
				}
				this._actionSheet.openBy(oButton);
			},
			
			handleResponsivePopoverPress: function (oEvent) {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("CaseStudy.Operator.Fragment.popover", this);
				//this._oPopover.bindElement("/ProductCollection/0");
				this.getView().addDependent(this._oPopover);
			}

			this._oPopover.openBy(oEvent.getSource());
		},
					handleCloseButton :function(){
						//MessageToast.show("You cancelled the request");
						this._oPopover.close();
					},
					handleAssignButton :function(){
						//MessageToast.show("Request Sent");
						this._oPopover.close();
					},
		
			onRedistributeOrders : function(packet_id, date_delivery, region_id){
			var payload = {packet_id:packet_id, date_delivery:date_delivery, region_id:region_id};
			var oThis = this;
			var postData = JSON.stringify(payload);
			console.log(postData);
			//send data to node.js server
			$.ajax({
           type: "POST",
           url: "/redistributeorders.xsjs",
           contentType: "application/json",
           data: postData,
           dataType: "json",
           crossDomain: true,
		  success: function(data) {
                  console.log("updated");
                  MessageToast.show("Orders are redistributed among agents" );
                  oThis.onCloseDetailPress();
               },
               error: function(data) {
                  var message = JSON.stringify(data);
                  console.log("some error");
                  alert(message);
               }
            });
					        
			}
	

		});

	}
);