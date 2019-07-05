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
], function(BaseController, JSONModel, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, formatter,MessageToast) {
	"use strict";

	return BaseController.extend("CaseStudy.Logistics.controller.Operator.PacketsMaster", {

		formatter: formatter,

		onInit: function() {
			
			//set pattern matched
			this.getRouter().getRoute("operator_packets_master").attachPatternMatched(this._onObjectMatched, this);

			//var	oViewModel = this._createViewModel();
			//this.setModel(oViewModel, "masterView");

			//	this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
			//	this.getRouter().attachBypassed(this.onBypassed, this);
			
				
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		
		getOdataPromise:function(oModel, sObjectId){
      	var oDeferred = new jQuery.Deferred();
      	
      oModel.read("/packetorder?$filter= F_Region_id eq '" + sObjectId+"' and Packet_Status eq 'P'",{
      		success:function(data,response){
	    		oDeferred.resolve(data.results);
      		},
      		error: function(error){
      			oDeferred.reject(error);
      		}
      	});
      	return oDeferred.promise();
      },
      onShowDetail:function(oEvent){
      	this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getRouter().navTo("operator_packets_detail", {
				R_Id : localStorage.getItem("Region_Id"),
				Packet_id : oEvent.getSource().getBindingContext("packets").getProperty("Packet_id")},
				true);
      },
      
      groupByPackets: function(data){
      	var unique = {};
		 var i;
		 for(i=0; i<data.length; i++){
		 	var item = data[i];
		 	var packet_id = item.Packet_id;
		 	if(!unique[packet_id]){
		 		unique[packet_id] = true;
		 	}
		 }
		  var dataArr =  Object.keys(unique);
		  var JsonData = new Array();
		  for(i=0; i<dataArr.length; i++){
		  	JsonData.push({"Packet_id":dataArr[i]});
		  }
		  return JsonData;
	},
		
		_onObjectMatched : function (oEvent) {
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			//create ODATA service to retrieve LEAVES of manager logged in
			var oModel = new sap.ui.model.odata.ODataModel("/packetorder.xsodata", true);
			var Region_Id =  oEvent.getParameter("arguments").R_Id;
			localStorage.setItem("Region_Id", Region_Id);
			
			var myPromise=this.getOdataPromise(oModel, Region_Id);
				
				$.when(myPromise).done(
      			function(oData){
      				var packetsData = this.groupByPackets(oData);
      				var oDataModel = new JSONModel({packets:packetsData});
      				this.getView().setModel(oDataModel,"packets");
      				oGlobalBusyDialog.close();
      			}.bind(this));
				
			
				
		},
		onRegionPress: function(oEvent){
			var RegionId = oEvent.getSource().getBindingContext("regions").getProperty("R_Id");
			this.getRouter().navTo("operator_packets_master", {
					R_Id : RegionId
				}, true);
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