function redistributeOrders(packet) {
	var conn = $.hdb.getConnection();
	var output = JSON.stringify(packet);
	var fnredistributeOrders = conn.loadProcedure("mock.mockdb::Redistribute");
	console.log("Procedure Loaded");
	var result = fnredistributeOrders({P_ID: packet.packet_id, DATE_DELIVERY: packet.date_delivery, REGION_ID : packet.region_id});
	console.log("This is result of redistributeOrders "+result); 
	conn.commit();
	conn.close();
	console.log(result);

	return {body : output, status: $.net.http.CREATED};
}

var body = $.request.body.asString();

var payload = JSON.parse(body);
// validate the inputs here!
var output = redistributeOrders(payload);
$.response.contentType = "application/json";
$.response.setBody(output.body);
$.response.status = output.status;

