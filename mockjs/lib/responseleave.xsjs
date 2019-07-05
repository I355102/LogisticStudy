function responseLeave(leave) {
	var conn = $.hdb.getConnection();
	var output = JSON.stringify(leave);
	var fnResponseLeave = conn.loadProcedure("mock.mockdb::ResponseLeave");
	console.log("Procedure Loaded");
	var result = fnResponseLeave({LEAVE_ID: leave.leaveId, LEAVE_COMMENT: leave.leaveComment, LEAVE_STATUS: leave.leaveStatus});
	console.log("This is result"+result); 
	conn.commit();
	conn.close();
	console.log(result);

	return {body : output, status: $.net.http.CREATED};
}

var body = $.request.body.asString();

var payload = JSON.parse(body);
// validate the inputs here!
console.log("In responsleave.xsjs : " + body);
var output = responseLeave(payload);
$.response.contentType = "application/json";
$.response.setBody(output.body);
$.response.status = output.status;

