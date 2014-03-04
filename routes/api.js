
var db = require('../middleware/database.js');
var url = require('url');

// Metode za dohvaćanje podataka sa senzorske mreže


exports.getAllSensors = function(req,res){
	db.GetSensorTable(function(commandData){
		console.log("API:Saljem podatke (Sensors)...");
		res.send(commandData);
	});

}

exports.getLastSensorData = function(req,res){
	db.GetLastSensorData(function(data){
		res.send(data);
	});
}

//1393676291999
//1393676305009
//1393676318020

exports.getSensorDataByAdress = function(req,res){
	var identifier = req.params.identifier;
	var from = req.query.from;
	var to = req.query.to;

	console.log(from + " " + to);
	db.GetSensorDataByAdress(identifier,from,to,function(data){
		res.send(data);
	});
}

exports.getAllSensorsStatuses = function(req,res){
	db.GetAllSensorsStatuses(function(commandData){
		console.log("API:Saljem podatke (Sensors)...");
		res.send(commandData);
	});

}

