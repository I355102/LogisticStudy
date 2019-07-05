sap.ui.define([
	"CaseStudy/Logistics/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageToast'
], function (BaseController, JSONModel,MessageToast) {
	"use strict";

	return BaseController.extend("CaseStudy.Logistics.controller.Manager.Reports", {
	
	onInit: function() {
	
			//set pattern matched
			this.getRouter().getRoute("manager_reports").attachPatternMatched(this._onObjectMatched, this);
			
	},
	
	getOdataPromise:function(oModel){
      	var oDeferred = new jQuery.Deferred();
      	
      	oModel.read("/reports",{
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
			var reportsModel = new sap.ui.model.odata.ODataModel("/reports.xsodata", true);
			
			var myPromise=this.getOdataPromise(reportsModel);
				
				$.when(myPromise).done(
      			function(oData){
      				var oDataModel = new JSONModel({reports:oData});
      				this.getView().setModel(oDataModel,"reports");
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
				sortBy: "Region_name",
				groupBy: "None"
			});
		},

		_onMasterMatched: function() {
			//Set the layout property of the FCL control to 'OneColumn'
			this.getModel("appView").setProperty("/layout", "OneColumn");
		}

	});
});