sap.ui.define([
	"CaseStudy/Logistics/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("CaseStudy.Logistics.controller.LaunchPage", {
		
		DeliveryAgentpress:function(oEvent){
			this.getRouter().navTo("deliveryagent");
		},
		
		Managerpress:function(oEvent){
			this.getRouter().navTo("manager");
		},
		
		Operatorpress:function(oEvent){
			this.getRouter().navTo("operator");
		}

	});
});