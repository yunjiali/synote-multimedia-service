/**
 * multimediaupload service
 */
var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify,
	io = Common.io,
	fs = Common.fs;

var uuid = require('node-uuid');

exports.initSocketIO = function(callback)
{
	io.sockets.on('connection', function (socket) {
		var Files = {};
	  	socket.on('Start', function (data) { //data contains the variables that we passed through in the html file
	  			log.debug(data);
				var Name = data['Name'];
				Files[Name] = {  //Create a new Entry in The Files Variable
					FileSize : data['Size'],
					Data	 : "",
					Downloaded : 0
				}
				var Place = 0;
				try{
					var Stat = fs.statSync('./tmp/' +  Name);
					if(Stat.isFile())
					{
						Files[Name]['Downloaded'] = Stat.size;
						Place = Stat.size / 524288;
					}
				}
		  		catch(er){} //It's a New File
				fs.open("./tmp/" + Name, 'a', 0755, function(err, fd){
					if(err)
					{
						log.error(err);
					}
					else
					{
						Files[Name]['Handler'] = fd; //We store the file handler so we can write to it later
						socket.emit('MoreData', { 'Place' : Place, Percent : 0 });
					}
				});
		});
		
		socket.on('Upload', function (data){
				var Name = data['Name'];
				Files[Name]['Downloaded'] += data['Data'].length;
				Files[Name]['Data'] += data['Data'];
				if(Files[Name]['Downloaded'] == Files[Name]['FileSize']) //If File is Fully Uploaded
				{
					fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
						var inp = fs.createReadStream("./tmp/" + Name);
						var out = fs.createWriteStream("./static/multimedia/" + Name);
						inp.pipe(out,{end:false});
						inp.on("end",function(){
							fs.unlink("./tmp/" + Name, function (err) { //This Deletes The Temporary File
								//exec("ffmpeg -i Video/" + Name  + " -ss 01:30 -r 1 -an -vframes 1 -f mjpeg Video/" + Name  + ".jpg", function(err){
								//	socket.emit('Done', {'Image' : 'Video/' + Name + '.jpg'});
								//});
								socket.emit('Done',{videourl:config.http.protocol+"://"+config.http.hostname+":"+config.http.port+"/multimedia/"+Name});
							});
						});
					});
				}
				else if(Files[Name]['Data'].length > 10485760){ //If the Data Buffer reaches 10MB
					fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
						Files[Name]['Data'] = ""; //Reset The Buffer
						var Place = Files[Name]['Downloaded'] / 524288;
						var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
						socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
					});
				}
				else
				{
					var Place = Files[Name]['Downloaded'] / 524288;
					var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
					socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
				}
		});
	});
};

exports.getUploadHTML = function(nexturl)
{
	log.debug("next:"+nexturl);
	var html = "<!DOCTYPE html>\
	<html> \
		<head> \
			<meta http-equiv='Content-type' content='text/html; charset=utf-8'> \
			<title>Multimedia Uploader</title> \
			<script src='/js/random.token.js'></script> \
			<script src='/socket.io/socket.io.js'></script> \
			<script src='/js/multimedia.upload.client.js'></script> \
			<link rel='stylesheet' type='text/css' href='/css/upload.css' media='screen' /> \
		</head> \
		<body onload='io.connect(\""+config.http.protocol+"://"+config.http.hostname+":"+config.http.port+"\"); setNextURL(\""+nexturl+"\")'> \
			<div id='UploadBox'> \
				<h2>Multimedia Uploader</h2> \
				<span id='UploadArea'> \
					<label for='FileBox'>Choose A File: </label><input type='file' id='FileBox'><br> \
					<label for='NameBox'>Name: </label><input type='text' id='NameBox'><br> \
					<button	type='button' id='UploadButton' class='Button'>Upload</button> \
				</span> \
			</div> \
		</body> \
	</html>";
	
	return html;
}
