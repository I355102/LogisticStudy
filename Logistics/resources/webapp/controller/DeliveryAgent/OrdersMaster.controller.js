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

	return BaseController.extend("CaseStudy.Logistics.controller.DeliveryAgent.OrdersMaster", {

		formatter: formatter,

		onInit: function() {
			
			//set pattern matched
			this.getRouter().getRoute("deliveryagent_orders_master").attachPatternMatched(this._onObjectMatched, this);

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
      	
      	oModel.read("/agents?$filter= F_Delivery_Id eq '" + localStorage.getItem("userId")+"' and Order_Status eq 'T'" ,{
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
			var ordersModel = new sap.ui.model.odata.ODataModel("/agents.xsodata", true);
			
			var myPromise=this.getOdataPromise(ordersModel);
				
				$.when(myPromise).done(
      			function(oData){
      				var oDataModel = new JSONModel({orders:oData});
      				this.getView().setModel(oDataModel,"orders");
      				oGlobalBusyDialog.close();
      			}.bind(this));
				
			
				
		},
		showDetail: function(orderId){
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getRouter().navTo("deliveryagent_orders_detail", {
				Order_Id : orderId},
				true);
		},
		onOrderItemPress : function(oEvent){
			localStorage.setItem("toggle_but",0);
			if(document.getElementById('__component0---deliveryagent_orders_detail--map_canvas'))
			{
				document.getElementById('__component0---deliveryagent_orders_detail--map_canvas').style.height="0px";
			}
			if(document.getElementById('__component0---deliveryagent_orders_detail--Navigate-content'))
			{
				document.getElementById('__component0---deliveryagent_orders_detail--Navigate-content').innerHTML = "<bdi>Navigate</bdi>";
			}
			var orderId = oEvent.getSource().getBindingContext("orders").getProperty("Order_Id");
			this.showDetail(orderId);
		},


		//Event handler to naviagate back
		onNavBack: function() {
			this.getRouter().navTo("deliveryagent");
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