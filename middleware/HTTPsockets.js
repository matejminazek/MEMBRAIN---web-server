//var bb = require('bonescript');
var io = require('socket.io');


var db = require('./database.js');
var TCPsocket = require('./TCPsockets.js');
var UART = require('./UART.js');


var ledPin1= 'USR1';
var ledPin2= 'USR2';

var io;
var data;
var _socket;

exports.initialize = function(server){
	
	io = io.listen(server);
	io.set('log level', 1); // reduce logging
	io.sockets.on('connection', function(socket){
		_socket = socket;

		// Main control page events

		socket.on('TCPrecieve',function(data){
			console.log("Primljena komanda(TCP)>>>>>>>> " + data);

			var message = data.split(':');
			var outputData = {
				"command" : message[0],
				"param" : message[1] 
			};

			TCPsocket.send(data);
		}); 

                                                     

		// Sensor control page events

		socket.on('controlSensorsPageLoad', function(){
			db.GetSensorTable(function(sensorTableData){
				socket.emit('sensorTableData', { 'data' : sensorTableData });
			});
			db.GetnRFHubStatus(function(nRFHubStatus){
				socket.emit('nRFHubStatusData', { 'data' : nRFHubStatus });
			});
			db.GetSensorData(function(sensorData){
				socket.emit('sensorData', {'data' : sensorData});
			});
		});

		// Hub Status

		socket.on('getnRFHubStatus', function(){
			UART.send('HubGetStatus#');
		});

		// Hub Controls

		socket.on('hubPowerUp', function(){
			UART.send('HubPowerUp#');
		});

		socket.on('hubPowerDown', function(){
			UART.send('HubPowerDown#');
		});

		socket.on('hubReset',function(){
			db.ClearSensorTable(function(){
				UART.send('HubRestart#');
			});
		});

		socket.on('hubFlushRxFIFO',function(){
			db.ClearSensorTable(function(){
				UART.send('HubFlushRxFIFO#');
			});
		});

		socket.on('hubFlushTxFIFO',function(){
			db.ClearSensorTable(function(){
				UART.send('HubFlushTxFIFO#');
			});
		});


		socket.on('hubROutputPower0', function(){
			UART.send('HubSetTxPower 3 #');
		});

		socket.on('hubROutputPower1', function(){
			UART.send('HubSetTxPower 2 #');
		});

		socket.on('hubROutputPower2', function(){
			UART.send('HubSetTxPower 1 #');
		});

		socket.on('hubROutputPower3', function(){
			UART.send('HubSetTxPower 0 #');
		});



		socket.on('getSensorTable', function(){
			db.ClearSensorTable(function(){
				UART.send('NodeReport#');
			});
		});

		// Node configuration
		socket.on('setNodeSettings',function(data){
			var string = "NodePlaceConfigureRequest " + data + "#";
			console.log("PORUKA: " + string);
			UART.send(string);
		});

		socket.on('getNodeSettings',function(data){
			var string = "NodePlaceQueryRequest  " + data + "#";
			console.log("PORUKA: " + string);
			UART.send(string);
		});


		

		socket.on('getSensorData',function(){
			db.GetSensorData(function(sensorData){
				socket.emit('sensorData', {'data' : sensorData});
			});
		});


	});
};

exports.send = function(source,data){
	if(_socket)
		_socket.emit(source, data);
};
