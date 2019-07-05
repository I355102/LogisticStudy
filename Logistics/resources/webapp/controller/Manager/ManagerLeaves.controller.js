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
	"sap/m/TextArea"
], function(BaseController, JSONModel, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, formatter, Button, Dialog,Label,MessageToast,Text,TextArea) {
	"use strict";

	return BaseController.extend("CaseStudy.Logistics.controller.Manager.ManagerLeaves", {

		formatter: formatter,

		onInit: function() {
			
			//set pattern matched
			this.getRouter().getRoute("manager_leaves").attachPatternMatched(this._onObjectMatched, this);

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
      	
      	oModel.read("/mleaves?$filter= F_Manager_Id eq '" + localStorage.getItem("userId")+"' and Leave_Status eq 'P'",{
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
			var oModel = new sap.ui.model.odata.ODataModel("/managerleaves.xsodata", true);
			
			var myPromise=this.getOdataPromise(oModel);
				
				$.when(myPromise).done(
      			function(oData){
      				var oDataModel = new JSONModel({leaves:oData});
      				this.getView().setModel(oDataModel,"leaves");
      				oGlobalBusyDialog.close();
      			}.bind(this));
				
			
				
		},
		
		onResponseLeave: function(leaveId, leave_status,leave_comment){
			var payload = {leaveId:leaveId, leaveComment:leave_comment, leaveStatus:leave_status};
			var postData = JSON.stringify(payload);
			var oThis = this;
			console.log(postData);
			//send data to node.js server
			$.ajax({
           type: "POST",
           url: "/responseleave.xsjs",
           contentType: "application/json",
           data: postData,
           dataType: "json",
           crossDomain: true,
		  success: function(data) {
                  console.log("updated");
                  oThis._onObjectMatched();
               },
               error: function(data) {
                  var message = JSON.stringify(data);
                  console.log("some error");
                  MessageToast.show(message);
               }
            });
					        
			},
			extractLeaveId : function(oItem){
				return oItem.getBindingContext("leaves").getProperty("Leave_Id");
			},
		
		onAccept   : function (oEvent) {
				var leaveId = this.extractLeaveId(oEvent.getSource());
				var msg = "Leave Request Approved";
				MessageToast.show(msg);
				this.onResponseLeave(leaveId, "A", "");
		},
		
		onReject : function(oEvent){
			var leaveId = this.extractLeaveId(oEvent.getSource());
			var oThis = this;
			var dialog = new Dialog({
				title: 'Reject',
				type: 'Message',
				content: [
					new Label({ text: "Are you sure you want to reject leave request", labelFor: 'rejectDialogTextarea'}),
					new TextArea('rejectDialogTextarea', {
						width: '100%',
						placeholder: 'Add Reason'
					})
				],
				beginButton: new Button({
					text: 'Reject',
					press: function () {
						var sText = sap.ui.getCore().byId('rejectDialogTextarea').getValue();
						MessageToast.show('Reason is: ' + sText);
						dialog.close();
						oThis.onResponseLeave(leaveId, "R", sText);
					}
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
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