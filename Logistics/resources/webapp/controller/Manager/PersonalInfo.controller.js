sap.ui.define([
	"CaseStudy/Logistics/controller/BaseController",
	"sap/ui/model/json/JSONModel",'sap/m/MessageToast'
], function (BaseController, JSONModel, MessageToast) {
	"use strict";

	return BaseController.extend("CaseStudy.Logistics.controller.Manager.PersonalInfo", {
	
	onInit: function() {
	
			//set pattern matched
			this.getRouter().getRoute("manager_personalinfo").attachPatternMatched(this._onObjectMatched, this);
			
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
      getAgentOdataPromise:function(oModel){
      	var oDeferred = new jQuery.Deferred();
      	
      	oModel.read("/damanager?$filter= F_Manager_Id eq '" + localStorage.getItem("userId")+"'",{
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
				var oThis =this;
			oGlobalBusyDialog.open();
			//create ODATA service to retrieve info of manager logged in
			var personalInfoModel = new sap.ui.model.odata.ODataModel("/personaldetails.xsodata", true);
			
			var myPromise=this.getOdataPromise(personalInfoModel);
				
				$.when(myPromise).done(
      			function(oData){
      				var oDataModel = new JSONModel(oData[0]);
      				this.getView().setModel(oDataModel,"Personalinfo");
      				console.log(oDataModel);
      				oGlobalBusyDialog.close();
      			}.bind(this));
      			
      		//agent details Code
      		
      		var agentsModel = new sap.ui.model.odata.ODataModel("/damanager.xsodata", true);
   
      		var agentsPromise = this.getAgentOdataPromise(agentsModel);
      		$.when(agentsPromise).done(
      			function(oData){
      				var oDataModel = new JSONModel({"agents":oData});
      				this.getView().setModel(oDataModel,"agentsu");
      			
      				console.log(oDataModel);
      				oGlobalBusyDialog.close();
      			}.bind(this));
				
		}
	});
});