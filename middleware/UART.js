

var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

var HTTPsocket = require('./HTTPsockets.js');
var db = require('./database.js');

var _baudrate = 115200;
var separator = "\n";

var _sp;

exports.init = function(){
	var sp = new SerialPort('COM8', {
  		baudrate: _baudrate,
  		parser: serialport.parsers.readline(separator),
  		buffersize : 512
	},true); // this is the openImmediately flag [default is true]

	_sp = sp;

 	console.log("Serial port started (" + _baudrate + ")...");

 	sp.on('data',function(data){
 		
 		var data = ""+data;
 		console.log("UART: " + data);

 		var string = data.split(']');
 		if(string[0] == '[Table'){
 			console.log("Odgovor je [Table]");

 			var table = {};
 			var params = (string[1]+']'+string[2]).split(','); // (string[1] + string[2] jer u lokaciji ima znak ] 

 			var param = params[0].split(':');
 			table['Number'] = parseInt(param[1],16);
 			param = params[1].split(':');
 			table['Adress'] = param[1].replace(' ', '');
            param = params[2].split(':');
 			table['Type'] = parseInt(param[1]);
 			param = params[3].split(':');
 			table['Identifier'] = param[1].replace(' ','').split("'").join('');  // >-- maknuti ' ' ako je ikako moguce
 			// Lokacija: x,y,z
 			param = params[4].split(':');
 			var lokacija = param[1].split('-');
 			table['LocationX'] = parseInt(lokacija[0].replace('[',''));
 			table['LocationY'] = parseInt(lokacija[1]);
 			table['LocationZ'] = parseInt(lokacija[2].replace('] mm',''));
 			//-------------------------------
 			param = params[5].split(':');
 			table['Interval'] = parseInt(param[1].replace('sec',''));
 			param = params[6].split(':');
 			table['LastResponse'] = parseInt(param[1].replace('sec',''));
 			param = params[8].split(':');  // Fali 7 jer se u odgovoru na 8. mjestu nalazi , ,
 			table['TxPower'] =parseInt(param[1]);
 			param = params[9].split(':');
 			table['PendingRequests'] = param[1];

 			table['TxPower'] = 10;

 			// Dodaj senzor u tablicu i obavjesti kontrolni panel
      db.AddSensor(table, function(){
        db.GetSensorTable(function(sensorTableData){
            HTTPsocket.send('sensorTableData', { 'data' : sensorTableData});
        });  
      });
    } else if(string[0] == '[Status'){
  			console.log("Odgovor je [Status]");
        var status = {};
        var params = string[1].split(',');
          
        var param = params[0].split(' ');
        status['RxFIFO'] = param[3];
        param = params[1].split(' ');
        status['TxFIFO'] = param[3];

        param = params[2].split(':');
        status['RetransmittedPackets'] = param[1];
        param = params[3].split(':');
        status['LostPackets'] = param[1];
        param = params[4].split(':');
        status['OperatingFrequency'] = param[1];
        param = params[5].split(':');
        status['TransferSpeed'] = param[1];
        param = params[6].split(':');
        status['OutputPower'] = param[1];
        param = params[7].split(':');
        status['RWT'] =  param[1];
        param = params[8].split(':');
        status['MRC'] =  param[1];
        param = params[9].split(':');
        status['AdressWidth'] =  param[1];
        param = params[10].split(':');
        status['ConfiguredAs'] =  param[1];
        param = params[11].split(':');
        status['HubStatus'] =  param[1];
        param = params[12].split(':');
        status['CRCProtection'] =  param[1];
        param = params[13].split(':');
        status['CEPinState'] =  param[1];
        param = params[14].split(':');
        status['ReceiveAdress'] =  param[1];
        param = params[15].split(':');
        status['TransmitAdress'] =  param[1];
        console.log(JSON.stringify(status));
        
        // Dodaj ştatus u tablicu i obavjesti kontrolni panel
  			db.AddnRFHubStatus(status,function(){
          db.GetnRFHubStatus(function(hubStatusData){
            HTTPsocket.send('nRFHubStatusData', {'data' : hubStatusData});
          });
        });
  	} else if(string[0] == '[Measurement'){
        console.log("Odgovor je [Measurement]");
        
        // Objekt tipa
        //    sensorData.Adress
        //    sensorData.Battery
        //    sensorData.Data{data1,data2,data3,data4,data5,free}


        var sensorData = {};
        var params = string[1].split(' ');

        sensorData['Adress'] = params[2];

        var podaci = params[4].split(',');

        for(var i=0; i<podaci.length;i++){
          if(podaci[i].length == 1)
            podaci[i] = "0" + podaci[i]; 
        }
        /*
        var podatak;
        var podatak = "0x" + podaci[4]+podaci[5]+podaci[6]+podaci[7];
        console.log("Data1HEX:" + podatak);
        podatak = parseInt(podatak,16);
        console.log("Data1DEC:" + podatak + "\n");

        podatak = "0x" + podaci[8]+podaci[9]+podaci[10]+podaci[11];
        console.log("Data2HEX:" + podatak);
        podatak = parseInt(podatak,16);
        console.log("Data2DEC:" + podatak+ "\n");

        podatak = "0x" + podaci[12]+podaci[13]+podaci[14]+podaci[15];
        console.log("Data3HEX:" + podatak);
        podatak = parseInt(podatak,16);
        console.log("Data3DEC:" + podatak+ "\n");

        podatak = "0x" + podaci[16]+podaci[17]+podaci[18]+podaci[19];
        console.log("Data4HEX:" + podatak);
        podatak = parseInt(podatak,16);
        console.log("Data4DEC:" + podatak+ "\n");

        podatak = "0x" + podaci[20]+podaci[21]+podaci[22]+podaci[23];
        console.log("Data5HEX:" + podatak);
        podatak = parseInt(podatak,16);
        console.log("Data5DEC:" + podatak+ "\n");
        */

        var Data = {};
       
        sensorData['Battery'] = parseInt(podaci[0]+podaci[1]+podaci[2]+podaci[3],16);  
        Data['data1'] = parseInt(podaci[4]+podaci[5]+podaci[6]+podaci[7],16);
        Data['data2']  = parseInt(podaci[8]+podaci[9]+podaci[10]+podaci[11],16);
        Data['data3'] = parseInt(podaci[12]+podaci[13]+podaci[14]+podaci[15],16);
        Data['data4'] = parseInt(podaci[16]+podaci[17]+podaci[18]+podaci[19],16);
        Data['data5'] = parseInt(podaci[20]+podaci[21]+podaci[22]+podaci[23],16);
        Data['free'] = parseInt(podaci[24]+podaci[25]+podaci[26]+podaci[27],16);

        sensorData.Data = Data;

        HTTPsocket.send('HubMeasurment',data);

        db.AddSensorData(sensorData,null);
    } else if(string[0] == '[Return'){
      console.log("Odgovor je [Return]");

      HTTPsocket.send('HubReturn',data);

    } else if(string[0] == '[Event'){
      console.log("Odgovor je [Event]");

      HTTPsocket.send('HubEvent',data);

    }

 		
  	
  });


};

exports.send = function(data){
	console.log("saljem serija: " + data);
	if(!_sp)
		console.log("sp == NULL");

	if(_sp){
		_sp.write(data,function(err,results){
			if(err)
				console.log("err " + err);
      		else
      			console.log("results " + results);
		});
	}

};