sap.ui.define([
	"CaseStudy/Logistics/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageToast'
], function (BaseController,JSONModel,MessageToast) {
	"use strict";

	return BaseController.extend("CaseStudy.Logistics.controller.Manager.LaunchPage", {
		
		onInit: function() {
			
			//set pattern matched
			this.getRouter().getRoute("manager").attachPatternMatched(this._onObjectMatched, this);
			
		},
		
		_onObjectMatched : function()
		{
				 var personalInfoModel = new sap.ui.model.odata.ODataModel("/managerleaves.xsodata", true);
				 var myPromise=this.getOdataPromise(personalInfoModel);
				 
				 $.when(myPromise).done(
      			 function(oData){
      				 //MessageToast.show("Data "+ oData);
      				 var oDataModel = new JSONModel(oData[0]);
      				 
      				 this.getView().setModel(oDataModel,"Personalinfo");
      			 }.bind(this));
			//console.log(this.byId("numcontent1").getValue());
			//this.byId("numcontent1").value=parseInt(5);
			console.log("value changed"+this.byId("numcontent1").getValue());
		},
		
		getOdataPromise:function(oModel)
		{
			var oThis = this;
    		var oDeferred = new jQuery.Deferred();
      	
      		oModel.read("/mleaves?$filter= F_Manager_Id eq '" + localStorage.getItem("userId")+"' and Leave_Status eq 'P'",{
      		success:function(data,response){
	    		oDeferred.resolve(data.results);
	    		//var count = Number(response.getLength());
	    		console.log(data.results.length);
	    		oThis.byId("numcontent1").setValue(data.results.length);
	    		
      		},
      		error: function(error){
      			oDeferred.reject(error);
      		}
      		
      		});
      	return oDeferred.promise();
      },
      		//Event handler to naviagate back
		onNavBack: function() {
			this.getRouter().navTo("login");
		},
		
		onPersonalInfoPress:function(oEvent){
			//MessageToast.show(window.sId);
			this.getRouter().navTo("manager_personalinfo");
		},
		
		onLeavesPress:function(oEvent){
			this.getRouter().navTo("manager_leaves");
		},
		
		onReportsPress:function(oEvent){
			this.getRouter().navTo("manager_reports");
		}

	});
});