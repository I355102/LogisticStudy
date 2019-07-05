sap.ui.define([
	"CaseStudy/Logistics/controller/BaseController",'sap/m/MessageToast'
], function (BaseController,MessageToast) {
	"use strict";

	return BaseController.extend("CaseStudy.Logistics.controller.Login", {
 
			onInit: function() {
				
				this.getRouter().getRoute("login").attachPatternMatched(this._onObjectMatched, this);

		
			},
			getRouter : function () {
				return this.getOwnerComponent().getRouter();
			},
			//handle Login press function
			onLoginPress: function(){
				var username = this.byId("username").getValue();
				var password = this.byId("password").getValue();
				var payload = {username:username, password:password};
				var postData = JSON.stringify(payload);
			    var oThis=this;
				console.log(postData);
				//send data to node.js server
				$.ajax({
               type: "POST",
               url: "/login.xsjs",
               contentType: "application/json",
               data: postData,
               dataType: "json",
               crossDomain: true,
               success: function(data) {
               	  var role = data.I_ROLE;
               	  console.log(role);
               	  switch(role){
               	  	case "M":oThis.getRouter().navTo("manager", {}, true);
               	  			 break;
               	  	case "O":oThis.getRouter().navTo("operator", {}, true);
               	  			break;
               	  	case "D":oThis.getRouter().navTo("deliveryagent", {}, true);
               	  }
                  
                  //save username in local storage
                  localStorage.setItem("userId", username);
                  MessageToast.show("User " +localStorage.getItem("userId")+ " is authenticated successfully");
               },
               error: function(data) {
                  var message = JSON.stringify(data);
                  MessageToast.show("Incorrect credentials please try again.");
               }
            });
				
			},
			
			_onObjectMatched : function (oEvent) {
				window.sRole =  oEvent.getParameter("arguments").Role;
			}
	

	});

});