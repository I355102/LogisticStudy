function reqLeave(leave) {
	var conn = $.hdb.getConnection();
	var output = JSON.stringify(leave);
	var fncreateLeave = conn.loadProcedure("mock.mockdb::RequestLeave");
	console.log("Procedure Loaded");
	var result = fncreateLeave({LEAVE_REASON: leave.reason, START_DATE: leave.startdate, END_DATE: leave.enddate,F_DELIVERY_ID: leave.delivery_id});
	console.log("This is result"+result); 
	conn.commit();
	conn.close();
	console.log(result);

	return {body : output, status: $.net.http.CREATED};
}

var body = $.request.body.asString();

var payload = JSON.parse(body);
// validate the inputs here!
var output = reqLeave(payload);
$.response.contentType = "application/json";
$.response.setBody(output.body);
$.response.status = output.status;

