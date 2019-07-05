sap.ui.define([
		"CaseStudy/Logistics/controller/BaseController",
		"sap/ui/model/json/JSONModel"
	], function (BaseController, JSONModel) {
		"use strict";

		return BaseController.extend("CaseStudy.Logistics.controller.App", {

			onInit : function () {
				var oViewModel,
					fnSetAppNotBusy,
					iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

				oViewModel = new JSONModel({
					busy : false,
					delay : 0,
					layout : "OneColumn",
					previousLayout : "",
					actionButtonsInfo : {
						midColumn : {
							fullScreen : false
						}
					}
				});
				this.setModel(oViewModel, "appView");

				
			}

		});
	}
);