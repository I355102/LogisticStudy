var global_lat;
var global_long;

sap.ui.define([
		"CaseStudy/Logistics/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"CaseStudy/Logistics/model/gmap",
		"sap/m/MessageToast"
	], function (BaseController, JSONModel, formatter, MessageToast) {
		"use strict";

		return BaseController.extend("CaseStudy.Logistics.controller.DeliveryAgent.OrdersDetail", {

			formatter: formatter,

			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				//jQuery.sap.require("CaseStudy/Logistics/model/gmap"); 
				var oViewModel = new JSONModel({
					busy : false,
					delay : 0,
					lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
				});

				this.getRouter().getRoute("deliveryagent_orders_detail").attachPatternMatched(this._onObjectMatched, this);

				this.setModel(oViewModel, "detailView");

			//	this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
				
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Event handler when the share by E-Mail button has been clicked
			 * @public
			 */
			onSendEmailPress : function () {
				var oViewModel = this.getModel("detailView");

				sap.m.URLHelper.triggerEmail(
					null,
					oViewModel.getProperty("/shareSendEmailSubject"),
					oViewModel.getProperty("/shareSendEmailMessage")
				);
			},
			
			onStatusChange : function()
			{
				var oid = this.byId("o_id").getText();
				var ostatus = "D";
				// this.byId("Status").style.backgroundColor('Blue');
				// this.byId("Status").enabled(true);
				var payload = {order_id: oid, order_status: ostatus};
				var postData = JSON.stringify(payload);
			    var oThis=this;
				console.log(postData);
				//send data to node.js server
				$.ajax({
               type: "POST",
               url: "/OrderStatus.xsjs",
               contentType: "application/json",
               data: postData,
               dataType: "json",
               crossDomain: true,
               success: function(data) {
                  //onRouteifSuccess();
                  MessageToast.show("Order Delivered Successfully");
               },
               error: function(data) {
                  var message = JSON.stringify(data);
                  MessageToast.show(message);
               }
            });
			},

			/**
			 * Event handler when the share in JAM button has been clicked
			 * @public
			 */
			onShareInJamPress : function () {
				var oViewModel = this.getModel("detailView"),
					oShareDialog = sap.ui.getCore().createComponent({
						name : "sap.collaboration.components.fiori.sharing.dialog",
						settings : {
							object :{
								id : location.href,
								share : oViewModel.getProperty("/shareOnJamTitle")
							}
						}
					});

				oShareDialog.open();
			},



			handleSendButton : function(){
				MessageToast.show("Send response");
			},
			/**
			 * Updates the item count within the line item table's header
			 * @param {object} oEvent an event containing the total number of items in the list
			 * @private
			 */
			onListUpdateFinished : function (oEvent) {
				var sTitle,
					iTotalItems = oEvent.getParameter("total"),
					oViewModel = this.getModel("detailView");

				// only update the counter if the length is final
				if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
					if (iTotalItems) {
						sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
					} else {
						//Display 'Line Items' instead of 'Line items (0)'
						sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
					}
					oViewModel.setProperty("/lineItemListTitle", sTitle);
				}
			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			 getOdataPromise:function(oModel, sObjectId){
      	var oDeferred = new jQuery.Deferred();
      	
      	oModel.read("/orders?$filter= Order_Id eq '" +sObjectId+"'",{
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
				var oModel = new sap.ui.model.odata.ODataModel("/orders.xsodata", true);
				var sObjectId =  oEvent.getParameter("arguments").Order_Id;
				
				var myPromise=this.getOdataPromise(oModel, sObjectId);
				
				$.when(myPromise).done(
      			function(oData){
      				var oDataModel = new JSONModel(oData[0]);
      				this.getView().setModel(oDataModel,"dataModel");
      				oGlobalBusyDialog.close();
      			}.bind(this));
      			
			},

			/**
			 * Binds the view to the object path. Makes sure that detail view displays
			 * a busy indicator while data for the corresponding element binding is loaded.
			 * @function
			 * @param {string} sObjectPath path to the object to be bound to the view.
			 * @private
			 */
			_bindView : function (sObjectPath) {
				// Set busy indicator during view binding
				var oViewModel = this.getModel("detailView");

				// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
				oViewModel.setProperty("/busy", false);

				this.getView().bindElement({
					path : sObjectPath,
					events: {
						change : this._onBindingChange.bind(this),
						dataRequested : function () {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oElementBinding = oView.getElementBinding();

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("detailObjectNotFound");
					// if object could not be found, the selection in the master list
					// does not make sense anymore.
					this.getOwnerComponent().oListSelector.clearMasterListSelection();
					return;
				}

				var sPath = oElementBinding.getPath(),
					oResourceBundle = this.getResourceBundle(),
					oObject = oView.getModel().getObject(sPath),
					sObjectId = oObject.Id,
					sObjectName = oObject.Name,
					oViewModel = this.getModel("detailView");

				this.getOwnerComponent().oListSelector.selectAListItem(sPath);

				oViewModel.setProperty("/saveAsTileTitle",oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
				oViewModel.setProperty("/shareOnJamTitle", sObjectName);
				oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},

			_onMetadataLoaded : function () {
				// Store original busy indicator delay for the detail view
				var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
					oViewModel = this.getModel("detailView"),
					oLineItemTable = this.byId("lineItemsList"),
					iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

				// Make sure busy indicator is displayed immediately when
				// detail view is displayed for the first time
				oViewModel.setProperty("/delay", 0);
				oViewModel.setProperty("/lineItemTableDelay", 0);

				oLineItemTable.attachEventOnce("updateFinished", function() {
					// Restore original busy indicator delay for line item table
					oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
				});

				// Binding the view will set it to not busy - so the view is always busy if it is not bound
				oViewModel.setProperty("/busy", true);
				// Restore original busy indicator delay for the detail view
				oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
			},

			/**
			 * Set the full screen mode to false and navigate to master page
			 */
			onCloseDetailPress: function () {
				this.getModel("appView").setProperty("/layout", "OneColumn");
				// No item should be selected on master after detail page is closed
				//this.getOwnerComponent().oListSelector.clearMasterListSelection();
				this.getRouter().navTo("deliveryagent_orders_master");
			},

			/**
			 * Toggle between full and non full screen mode.
			 */
			toggleFullScreen: function () {
				var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
				this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
				if (!bFullScreen) {
					// store current layout and go full screen
					this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
					this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
				} else {
					// reset to previous layout
					this.getModel("appView").setProperty("/layout",  this.getModel("appView").getProperty("/previousLayout"));
				}
			},

			/**
			 * Opens the Action Sheet popover
			 * @param {sap.ui.base.Event} oEvent the press event of the share button
			 */

			 
			onSharePress : function (oEvent) {
				var oButton = oEvent.getSource();

				// create action sheet only once
				if (!this._actionSheet) {
					this._actionSheet = sap.ui.xmlfragment(
						"sap.ui.demo.masterdetail.view.ActionSheet",
						this
					);
					this.getView().addDependent(this._actionSheet);
					// forward compact/cozy style into dialog
					jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this._actionSheet);
				}
				this._actionSheet.openBy(oButton);
			},
			
			initMap: function() {
              var lat_val;
              var long_val;
              var toggle_navigation = true;
              //var global_lat= new google.maps.LatLng(0.0,0.0)

            //  $.getJSON(
            //             'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyDVtkIu6BGj_vPtr27Kx-4RuxC0Nkxev6A',
            //             function (data) {
                                         this.getLocation();
                                         
            //                           console.log(data);
            //                           lat_val = data.results[0].geometry.location.lat;
            //                           long_val = data.results[0].geometry.location.lng;

            //                           console.log(parseFloat(lat_val), parseFloat(long_val));
											console.log("Document Loaded");
                                           var directionsRenderer = new google.maps.DirectionsRenderer({
                                                          map: map
                                           });
                                           directionsRenderer.suppressMarkers = true;
                                           directionsRenderer.setMap(null);

                                           var directionsService = new google.maps.DirectionsService;
											
   // your code here

                                           var map = new google.maps.Map(document.getElementById('__component0---deliveryagent_orders_detail--map_canvas'), {
                                                          zoom: 12,
                                                          center: {
                                                                        lat: -34.397,
                                                                        lng: 150.644
                                                          } //Initial Location on Map
                                           });

                                           //var marker = new google.maps.Marker({
                                                          //position: {
                                                                        // lat: -34.397,
                                                                        // lng: 150.644
                                                          //},
                                                          //map: map,
                                                          //title: 'Hello World!'
                                           //});

                                           directionsRenderer.setMap(map);
                                           directionsRenderer.setPanel(null);
                                       //directionsRenderer.setPanel(document.getElementById('__component0---app--left-div'));

                                          //var control = document.getElementById('application-Test-url-component---detail--text-inner');
                                           //control.style.display = 'inline';

                                         //map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);

                                           //document.getElementById('__component0---app--origin').addEventListener('change', function() {
                                           //           distanceCalculator(directionsService, directionsRenderer);
                                           //}, false);

                                           //document.getElementById('__component0---app--destination').addEventListener('click', function()
											var othis = this;	
                                           document.getElementById('__component0---deliveryagent_orders_detail--Navigate').addEventListener('click', function () {
                                           		console.log("inside button");
                                           		if(localStorage.getItem("toggle_but")==0)
                                           		{
                                           			toggle_navigation= true;
                                           			localStorage.setItem("toggle_but",1);
                                           		}
                                           		if(toggle_navigation)
                                           		{
                                         
                                        	  		document.getElementById('__component0---deliveryagent_orders_detail--map_canvas').style.height = "300px";
                                           			document.getElementById('__component0---deliveryagent_orders_detail--map_canvas').style.visibility = "visible";
                                            		othis.distanceCalculator(directionsService, directionsRenderer);
                                            		toggle_navigation = false;
                                            		document.getElementById('__component0---deliveryagent_orders_detail--Navigate-content').innerHTML = "<bdi>Hide Map</bdi>";
                                           		}
                                           		else
                                           		{
                                           			toggle_navigation = true;
                                           			document.getElementById('__component0---deliveryagent_orders_detail--map_canvas').style.height = "0px";
                                           			document.getElementById('__component0---deliveryagent_orders_detail--Navigate-content').innerHTML = "<bdi>Navigate</bdi>";
                                           		}
                                           		
                    
                                           }, false);
                        //});
              //while(lat_val);
              console.log(parseFloat(lat_val), parseFloat(long_val));

},

/***************To Calculate and Display the Route*************/
distanceCalculator:function(directionsService, directionsRenderer) {
			  
              //console.log(global_lat);
           	document.getElementById('__component0---deliveryagent_orders_detail--map_canvas').style.height = "300px";
              var origin = new google.maps.LatLng(parseFloat(global_lat),parseFloat(global_long));
              console.log(global_lat,global_long);
              //  var coord = getLocation();
              //  console.log(coord);
              //           var origin = new google.maps.LatLng(coord.lat,coord.long);
        	//var destination = this.byId("__component0---deliveryagent_orders_detail--addressfield").value;
              var destination = document.getElementById('__component0---deliveryagent_orders_detail--addressfield').innerHTML;
              
              console.log(destination);
              var req = {
                             origin: origin,
                             destination: destination,
                             travelMode: 'DRIVING'
              };
              directionsService.route(req, function (response, status) {
                             if (status === 'OK') {
                                           directionsRenderer.setDirections(response);
                                           directionsRenderer.setPanel(null);
                                           console.log("Able to render");

                             }
                             else{
                             	console.log(status);
                             }
              });
},
getLocation: function() {
              if (navigator.geolocation) {
                             navigator.geolocation.getCurrentPosition(this.showPosition);
              }

},

showPosition: function(position) {
              var lat = parseFloat(position.coords.latitude);
              var long = parseFloat(position.coords.longitude);
              global_lat = lat;
              global_long = long;
              console.log("Location called");

},

onAfterRendering: function(){
	 this.initMap();
	document.getElementById('__component0---deliveryagent_orders_detail--map_canvas').style.height="0px";
}


		});

	}
);