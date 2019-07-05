function changeStatus(user) 
{
	console.log("This is user"+user);
	var conn = $.hdb.getConnection();
	var output = JSON.stringify(user);
	var fnchst = conn.loadProcedure("mock.mockdb::DeliverStatus");
	
	
	var result = fnchst({ORDER_ID: user.order_id, ORDER_STATUS: user.order_status});
	console.log("This is result"+result); 
	conn.commit();
	conn.close();
	console.log(result);
	
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
var output = changeStatus(payload);
$.response.contentType = "application/json";
$.response.setBody(output.body);
$.response.status = output.status;

