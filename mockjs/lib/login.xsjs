function authenticateUser(user) {
	console.log("This is user"+user);
var conn = $.hdb.getConnection();
var output = JSON.stringify(user);
var fnauthUser = conn.loadProcedure("mock.mockdb::AuthenticateUser");
console.log("Procedure Loaded");
var result = fnauthUser({I_ID: user.username, I_PWD: user.password});
console.log("This is result"+result); 
conn.commit();
conn.close();
console.log(result);
if (result && result.ERROR_FLAG == 'No error') {
	console.log("Successful");
	return {body : result, status: $.net.http.CREATED};
      
} else {
	console.log("Not working");
	console.log(result.ERROR_FLAG);
      return {body : result, status: $.net.http.BAD_REQUEST};
}
}
var body = $.request.body.asString();
console.log("This is body"+body);
var payload = JSON.parse(body);
// validate the inputs here!
var output = authenticateUser(payload);
$.response.contentType = "application/json";
$.response.setBody(output.body);
$.response.status = output.status;

