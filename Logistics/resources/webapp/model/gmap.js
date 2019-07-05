window.addEventListener('load', function () {
	console.log("Map loaded");
			  var script = document.createElement('script');
              script.type = 'text/javascript';
              script.src =
                             'https://maps.googleapis.com/maps/api/js?key=AIzaSyDVtkIu6BGj_vPtr27Kx-4RuxC0Nkxev6A&avoid=TOLLS&libraries=places';
              document.body.appendChild(script);
              console.log("I AM HERE");
              document.getElementById('__component0---deliveryagent_detail--map_canvas').style.height = "0px";
});
// var global_lat;
// var global_long;

// function getLocation() {
//               if (navigator.geolocation) {
//                              navigator.geolocation.getCurrentPosition(showPosition);
//               }

// }

// function showPosition(position) {
//               var lat = parseFloat(position.coords.latitude);
//               var long = parseFloat(position.coords.longitude);
//               global_lat = lat;
//               global_long = long;
//               console.log("Location called");

// }

// function initMap() {
//               var lat_val;
//               var long_val;
//               //var global_lat= new google.maps.LatLng(0.0,0.0)

//             //  $.getJSON(
//             //             'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyDVtkIu6BGj_vPtr27Kx-4RuxC0Nkxev6A',
//             //             function (data) {
//                                          getLocation();
                                         
//             //                           console.log(data);
//             //                           lat_val = data.results[0].geometry.location.lat;
//             //                           long_val = data.results[0].geometry.location.lng;

//             //                           console.log(parseFloat(lat_val), parseFloat(long_val));
// 											console.log("Document Loaded");
//                                           var directionsRenderer = new google.maps.DirectionsRenderer({
//                                                           map: map
//                                           });
//                                           directionsRenderer.suppressMarkers = true;
//                                           directionsRenderer.setMap(null);

//                                           var directionsService = new google.maps.DirectionsService;
											
//   // your code here

//                                           var map = new google.maps.Map(document.getElementById('__component0---deliveryagent_detail--map_canvas'), {
//                                                           zoom: 12,
//                                                           center: {
//                                                                         lat: -34.397,
//                                                                         lng: 150.644
//                                                           } //Initial Location on Map
//                                           });

//                                           //var marker = new google.maps.Marker({
//                                                           //position: {
//                                                                         // lat: -34.397,
//                                                                         // lng: 150.644
//                                                           //},
//                                                           //map: map,
//                                                           //title: 'Hello World!'
//                                           //});

//                                           directionsRenderer.setMap(map);
//                                           directionsRenderer.setPanel(null);
//                                       //directionsRenderer.setPanel(document.getElementById('__component0---app--left-div'));

//                                           //var control = document.getElementById('application-Test-url-component---detail--text-inner');
//                                           //control.style.display = 'inline';

//                                          //map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);

//                                           //document.getElementById('__component0---app--origin').addEventListener('change', function() {
//                                           //           distanceCalculator(directionsService, directionsRenderer);
//                                           //}, false);

//                                           //document.getElementById('__component0---app--destination').addEventListener('click', function()
											
//                                           document.getElementById('__component0---deliveryagent_detail--Navigate').addEventListener('click', function () {
//                                           	console.log("inside button");
//                                           	document.getElementById('__component0---deliveryagent_detail--map_canvas').style.height = "300px";
//                                           	document.getElementById('__component0---deliveryagent_detail--map_canvas').style.visibility = "visible";
//                                             distanceCalculator(directionsService, directionsRenderer);
//                                           }, false);
//                     //     });
//               //while(lat_val);
//               console.log(parseFloat(lat_val), parseFloat(long_val));

// }

// /***************To Calculate and Display the Route*************/
// function distanceCalculator(directionsService, directionsRenderer) {
			  
//               //console.log(global_lat);
//               var origin = new google.maps.LatLng(parseFloat(global_lat),parseFloat(global_long));
//               console.log(global_lat,global_long);
//               //  var coord = getLocation();
//               //  console.log(coord);
//               //           var origin = new google.maps.LatLng(coord.lat,coord.long);
//         //	var destination = 'Mumbai';
//               var destination = document.getElementById('__component0---deliveryagent_detail--addressfield').value;
//               console.log(destination);
//               var req = {
//                              origin: origin,
//                              destination: destination,
//                              travelMode: 'DRIVING'
//               };
//               directionsService.route(req, function (response, status) {
//                              if (status === 'OK') {
//                                           directionsRenderer.setDirections(response);
//                                           directionsRenderer.setPanel(null);
//                                           console.log("Able to render");

//                              }
//                              else{
//                              	console.log(status);
//                              }
//               });
// }


// //console.log("Latitude: " + position.coords.latitude + 
// //"<br>Longitude: " + position.coords.longitude);
