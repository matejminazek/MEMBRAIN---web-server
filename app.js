
/**
 * Module dependencies.
 */


// System includes

var express = require('express');
var routes = require('./routes');
var index = require('./routes/index.js');
var user = require('./routes/user');
var http = require('http');
var path = require('path');


// Middleware includes

var HTTPsocket = require('./middleware/HTTPsockets.js');  
var TCPsocket = require('./middleware/TCPsockets.js');
var UART = require('./middleware/UART.js');
var db = require('./middleware/database.js');  

// Route includes

var api = require('./routes/api.js');
var control = require('./routes/control.js');
var download = require('./routes/download.js');

var dir = __dirname;


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  //app.use(express.errorHandler());
}

// Autentifikacija korisnika
function checkAuth(req,res,next){
	if(!req.session.user_id){
		res.redirect("login");
		res.location("login");
	}else{
		
		next();
	}
};



console.log('Server started');


// Login rute

app.get('/login', user.getLogin);
app.post('/login', user.postLogin);
app.get('/logout', checkAuth, user.logout);


app.get('/', index.index);
app.get('/control', control.getMainPage);
app.get('/control/sensors', control.getSensorsPage);


// api za senzorsku mrežu
app.get('/api/sensors', api.getAllSensors);
app.get('/api/sensors/measurments',api.getLastSensorData);
app.get('/api/sensors/measurments/:identifier',api.getSensorDataByAdress);
app.get('/api/hubstatus', api.getAllSensorsStatuses);





app.get('/download', download.getPage);
app.get('/download/:file',download.getFile(dir));
app.get('/users', user.list);

// Inicijalizacija komponenti

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

db.init();
TCPsocket.init();
//UART.init();
HTTPsocket.initialize(server);



