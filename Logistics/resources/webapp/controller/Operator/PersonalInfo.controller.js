sap.ui.define([
	"CaseStudy/Logistics/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageToast'
], function (BaseController, MessageToast,JSONModel) {
	"use strict";

	return BaseController.extend("CaseStudy.Logistics.controller.Operator.PersonalInfo", {
	
	onInit: function() {
	
			//set pattern matched
			this.getRouter().getRoute("operator_personalinfo").attachPatternMatched(this._onObjectMatched, this);
			
	},
	//Event handler to naviagate back
		onNavBack: function() {
			history.go(-1);
		},
	
	getOdataPromise:function(oModel){
      	var oDeferred = new jQuery.Deferred();
      	
      	oModel.read("/personaldetails?$filter= User_Id eq '" + localStorage.getItem("userId")+"'",{
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
			//create ODATA service to retrieve LEAVES of manager logged in
			var personalInfoModel = new sap.ui.model.odata.ODataModel("/personaldetails.xsodata", true);
			
			var myPromise=this.getOdataPromise(personalInfoModel);
				
				$.when(myPromise).done(
      			function(oData){
      				MessageToast.show("Data "+ oData);
      				var oDataModel = new JSONModel(oData[0]);
      				this.getView().setModel(oDataModel,"Personalinfo");
      			}.bind(this));
				
		}
	});
});