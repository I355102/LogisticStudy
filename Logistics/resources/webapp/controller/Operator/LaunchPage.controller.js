sap.ui.define([
	"CaseStudy/Logistics/controller/BaseController",'sap/m/MessageToast'
], function (BaseController,MessageToast) {
	"use strict";

	return BaseController.extend("CaseStudy.Logistics.controller.Operator.LaunchPage", {
		
		onPersonalInfoPress:function(oEvent){
			this.getRouter().navTo("operator_personalinfo");
		},
		
		onMapPress:function(oEvent){
			this.getRouter().navTo("operator_regions");
		
		},
		onDisplayAssigned:function(oEvent){
			this.getRouter().navTo("operator_display");
		},
		
      		//Event handler to naviagate back
		onNavBack: function() {
			this.getRouter().navTo("login");
		}
		

	});
});