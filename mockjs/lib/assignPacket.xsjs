function assignPacket(user) 
{
	var conn = $.hdb.getConnection();
	var output = JSON.stringify(user);
	var fnAssign = conn.loadProcedure("mock.mockdb::AssignPacket");
	
	
	var result = fnAssign({PACKET_ID: user.packet_id, F_DELIVERY_ID: user.delivery_id});
	conn.commit();
	conn.close();
	
	if (result) 
	{
		console.log("Successful");
		return {body : output, status: $.net.http.CREATED};
	} 
	else 
	{
	console.log("Not working");
    return {body : result, status: $.net.http.BAD_REQUEST};
	}
}


var body = $.request.body.asString();
console.log("This is body"+body);
var payload = JSON.parse(body);
// validate the inputs here!
var output = assignPacket(payload);
$.response.contentType = "application/json";
$.response.setBody(output.body);
$.response.status = output.status;

