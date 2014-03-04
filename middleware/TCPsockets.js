
var net = require('net');
var carrier = require('carrier');


var HTTPsocket = require('./HTTPsockets.js');
var db = require('./database.js');

var PORT = 6969;
var HOST = '127.0.0.1';

var server;
var _socket;

exports.init = function(){
	server = net.createServer().listen(PORT,HOST);
	
	console.log('TCP server started on ' + HOST + ':' + PORT );

	server.on('connection',function(sock){
		var my_carrier = carrier.carry(sock);
		_socket = sock;
		console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
		
		my_carrier.on('line',function(data){
			
			console.log('DATA ' + sock.remoteAddress + ': ' + data);
					
			

			HTTPsocket.send('TCPevent',data);
			sock.write('Naredba "' + data +'" primljena\n');
		});


		
		sock.on('close',function(data){
			console.log('CLOSED: ' + sock.remoteAddress + ':' + sock.remotePort);
		});
	});
};

exports.send = function(data){
	if(_socket)
		_socket.write(data);
}





 
 


