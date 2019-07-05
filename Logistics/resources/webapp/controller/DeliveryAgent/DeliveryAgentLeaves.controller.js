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
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/m/TextArea",
	'sap/m/MessageToast'
], function(BaseController,JSONModel, Filter,Messagetoast, Sorter, FilterOperator, GroupHeaderListItem, Device, formatter, Button, Dialog,Label,MessageToast,Text,TextArea) {
	"use strict";

	return BaseController.extend("CaseStudy.Logistics.controller.DeliveryAgent.DeliveryAgentLeaves", {

		formatter: formatter,

		onInit: function() {
			
			//set pattern matched
			this.getRouter().getRoute("deliveryagent_leaves").attachPatternMatched(this._onObjectMatched, this);

			//var	oViewModel = this._createViewModel();
			//this.setModel(oViewModel, "masterView");

			//	this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
			//	this.getRouter().attachBypassed(this.onBypassed, this);
			//bar chart
				
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		
		getOdataPromise:function(oModel){
      	var oDeferred = new jQuery.Deferred();
      	
      	oModel.read("/leaves?$filter= F_Delivery_Id eq '" + localStorage.getItem("userId")+"'",{
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
			//create ODATA service to retrieve LEAVES of manager logged in
			var oModel = new sap.ui.model.odata.ODataModel("/leaves.xsodata", true);
			
			var myPromise=this.getOdataPromise(oModel);
				
				$.when(myPromise).done(
      			function(oData){
      				var oDataModel = new JSONModel({leaves:oData});
      				this.getView().setModel(oDataModel,"leaves");
      				oGlobalBusyDialog.close();
      			}.bind(this));
				
			
				
		},
		onNewLeavePress: function(oEvent){
			if (!this.leavePopover) {
				this.leavePopover = sap.ui.xmlfragment(this.getView().getId(),"CaseStudy.Logistics.Fragment.DeliveryAgent.Popover", this);
				//this._oPopover.bindElement("/ProductCollection/0");
				this.getView().addDependent(this._oPopover);
			}

			this.leavePopover.openBy(oEvent.getSource());
		},
		handleCloseButton :function(){
			this.leavePopover.close();
		},
		
		RefreshList: function(){
			this._onObjectMatched();
		},
		

		
		handleSendButton :function(){
				var start_date = this.byId("DRS1").getDateValue();
				var end_date = this.byId("DRS1").getSecondDateValue();
				var reason = this.byId("Leave_reason").getValue();
				var delivery_id = localStorage.getItem("userId");
				
				//ij
				var d = new Date(start_date),
	        	month = '' + (d.getMonth() + 1),
	        	day = '' + d.getDate(),
	        	year = d.getFullYear();
			
			    if (month.length < 2)
			    { 
			    	month = '0' + month;
			    }
			    if (day.length < 2)
			    {
			    	day = '0' + day;
			    }
				start_date= [year, month, day].join('');
				//ji
				var d = new Date(end_date),
	        	month = '' + (d.getMonth() + 1),
	        	day = '' + d.getDate(),
	        	year = d.getFullYear();
			
			    if (month.length < 2)
			    { 
			    	month = '0' + month;
			    }
			    if (day.length < 2)
			    {
			    	day = '0' + day;
			    }
				end_date= [year, month, day].join('');
					
				var payload = {startdate:start_date, enddate:end_date, reason: reason, delivery_id: delivery_id};
				var postData = JSON.stringify(payload);
			    var oThis=this;
				console.log(postData);
				//send data to node.js server
				$.ajax({
               type: "POST",
               url: "/reqleaves.xsjs",
               contentType: "application/json",
               data: postData,
               dataType: "json",
               crossDomain: true,
               success: function(data) {
                  //onRouteifSuccess();
                  //Refresh list
					oThis.RefreshList();
                  console.log("success");
               },
               error: function(data) {
                  var message = JSON.stringify(data);
                  MessageToast.show("Leave not created. Please try again.");
               }
            });
			this.leavePopover.close();
			
		},


		//Event handler to naviagate back
		onNavBack: function() {
			history.go(-1);
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		_createViewModel: function() {
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

		_onMasterMatched: function() {
			//Set the layout property of the FCL control to 'OneColumn'
			this.getModel("appView").setProperty("/layout", "OneColumn");
		}

	});

});