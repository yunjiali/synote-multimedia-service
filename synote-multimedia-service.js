/*load modules*/
var Common = require('./lib/common.js');
var log = Common.log,
	restify = Common.restify,
	config = Common.config,
	server = Common.server,
	node_static = Common.node_static;
	
var _ = require('underscore');
var fs = require('fs');
//var thumbnail_root = config.node_static.root+;

var vidstreamer = require('vid-streamer');

/* Init services
 * We use nameService for the instance of each service 
 */
log.info("Init services");
//var ffmpegService = require('./services/ffmpeg-service.js'),
//	vlcService = require('./services/vlc-service.js'),
//	thumbnailService = require('./services/thumbnail-service.js'),
var	api = require('./services/api.js');

/*start the restify server and node-static*/
log.info("Start server...");

var file = new(node_static.Server)(config.node_static.root, {
	cache: Common.config.node_static.cache,
});

/*start apis*/
log.info("Init apis...");
api.init();

/*enable video streaming server*/
if(config.vidstreamer.enabled === true)
	server.get(/^\/multimedia\/.*/,vidstreamer.settings(config.vidstreamer.settings));
else
	server.get(/^\/multimedia\/.*/,function(req,res,next){
		return res.send(403, "Permission Denied");
	});

/*serve static files, we need to put it as the last one*/
server.get(/^\/thumbnail.*/, function(req, res, next) {
	//file.serve(req, res, next);
	var id = req.params.id;
	if(id === undefined)
	{
		file.serve(req,res,function(err,result){
			if(err != null) //file doesn't exists, so we choose one instead
			{	
				return file.serveFile("default.jpg",200,{},req,res);
			}
		});
	}
	else //want a specific file
	{
		var start = parseInt(req.query.start);
		var end= parseInt(req.query.end);
		
		if(isNaN(start) || isNaN(end)) //parameter error, serve the default file
		{
			return file.serveFile("default.jpg",200,{},req,res);
		}
		
		var time;
		
		if((start === undefined && end === undefined))
			time = _.random(0,100);
		else if(start === undefined)
			time = end/1000;
		else if(end === undefined)
			time = start/1000;
		else
			time = (end+start)/2000;
		
		var thumbnail_root = config.node_static.root+config.thumbnail.root_dir;
		var thumbnail_folder = thumbnail_root+'/'+id;
		
		if(!fs.existsSync(thumbnail_folder))
			return file.serveFile("default.jpg",200,{},req,res);
			
		var indexfilePath = thumbnail_folder+"/index.json";
				
		if(!fs.existsSync(indexfilePath)) //index file doesn't exist
		{
			return file.serveFile("default.jpg",200,{},req,res);
		}
		
		var timesArray = JSON.parse(fs.readFileSync(indexfilePath));
		var filename = _.find(timesArray, function(num){return num>=time;});
		if(filename === undefined)
		{
			filename = _.find(timeArray, function(num){return num<time;});
		}
		
		if(filename === undefined)
		{
			return file.serveFile("default.jpg",200,{},req,res);
		}
		else
		{
			return file.serveFile(config.thumbnail.root_dir+"/"+id+"/"+filename+".jpg",200,{},req,res);
		}	
	}
});

server.get(/^\/js\/.*/, function(req, res, next) {
	//file.serve(req, res, next);
	file.serve(req,res,function(err,result){
		if(err != null)
		{
			return file.serveFile("error.html",err.status,{},req,res);
		}
	});
});

server.get(/^\/css\/.*/, function(req, res, next) {
	//file.serve(req, res, next);
	file.serve(req,res,function(err,result){
		if(err != null)
		{
			return file.serveFile("error.html",err.status,{},req,res);
		}
	});
});

server.get(/^\/.*/, function(req, res, next) {
	file.serve(req, res, next);
});

server.listen(config.http.port, config.http.hostname, function() {
	log.info('%s listening at %s', server.name, server.url);
});

exports.listen = function () {
  	server.listen.apply(server, arguments);
};

exports.close = function (callback) {
  	server.close(callback);
};


