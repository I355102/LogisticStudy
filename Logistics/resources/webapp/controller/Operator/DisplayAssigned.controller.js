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

	return BaseController.extend("CaseStudy.Logistics.controller.Operator.DisplayAssigned", {

		formatter: formatter,

		onInit: function() {
			
			//set pattern matched
			this.getRouter().getRoute("operator_display").attachPatternMatched(this._onObjectMatched, this);

			//var	oViewModel = this._createViewModel();
			//this.setModel(oViewModel, "masterView");

			//	this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
			//	this.getRouter().attachBypassed(this.onBypassed, this);
			//bar chart
				
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		
 getOdataPromise:function(oModel)
		 {
	      	var oDeferred = new jQuery.Deferred();
	      	
	      	oModel.read("/assigned?$filter= Packet_Status eq 'A'",{
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
			var oModel = new sap.ui.model.odata.ODataModel("/assigned.xsodata", true);
			
			var AssignmyPromise=this.getOdataPromise(oModel);
				
			$.when(AssignmyPromise).done(
      			function(oData){
      				var oDataModel = new JSONModel({"assign":oData});
      				this.getView().setModel(oDataModel,"assignedModel");
      				oGlobalBusyDialog.close();
      			}.bind(this));
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