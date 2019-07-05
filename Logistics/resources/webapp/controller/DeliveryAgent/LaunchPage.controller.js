sap.ui.define([
	"CaseStudy/Logistics/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController,JSONModel) {
	"use strict";

	return BaseController.extend("CaseStudy.Logistics.controller.DeliveryAgent.LaunchPage", {
		
		onInit: function() {
			
			//set pattern matched
			this.getRouter().getRoute("deliveryagent").attachPatternMatched(this._onObjectMatched, this);
			
		},
		
		_onObjectMatched : function()
		{
				 var personalInfoModel = new sap.ui.model.odata.ODataModel("/leaves.xsodata", true);
				 var myPromise=this.getOdataPromise(personalInfoModel);
				 
				 $.when(myPromise).done(
      			 function(oData){
      				 //MessageToast.show("Data "+ oData);
      				 var oDataModel = new JSONModel(oData[0]);
      				 
      				 this.getView().setModel(oDataModel,"Personalinfo");
      			 }.bind(this));
			//console.log(this.byId("numcontent1").getValue());
			//this.byId("numcontent1").value=parseInt(5);
			//console.log("value changed"+this.byId("numcontent2").getValue());
		},
		getOdataPromise:function(oModel)
		{
			var oThis = this;
    		var oDeferred = new jQuery.Deferred();
      	
      		oModel.read("/leaves?$filter= F_Delivery_Id eq '" + localStorage.getItem("userId")+"'",{
      		success:function(data,response){
	    		oDeferred.resolve(data.results);
	    		//var count = Number(response.getLength());
	    		console.log(data.results.length);
	    		oThis.byId("numcontent2").setValue(data.results.length);
	    		
      		},
      		error: function(error){
      			oDeferred.reject(error);
      		}
      		
      		});
      	return oDeferred.promise();
      },
		
		onPersonalInfoPress:function(oEvent){
			this.getRouter().navTo("deliveryagent_personalinfo");
		},
		
		onLeavesPress:function(oEvent){
			this.getRouter().navTo("deliveryagent_leaves");
		},
		
		onOrdersPress:function(oEvent){
			this.getRouter().navTo("deliveryagent_orders_master");
		},
		//Event handler to naviagate back
		onNavBack: function() {
			this.getRouter().navTo("login");
		}

	});
});