/*load modules*/
var Common = require('./lib/common.js');
var log = Common.log,
	restify = Common.restify,
	config = Common.config,
	server = Common.server,
	node_static = Common.node_static;

//var thumbnail_root = config.node_static.root+;

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

/*serve static files, we need to put it as the last one*/
server.get(/^\/thumbnail\/.*/, function(req, res, next) {
	//file.serve(req, res, next);
	file.serve(req,res,function(err,result){
		if(err != null)
		{
			return file.serveFile("default.jpg",err.status,{},req,res);
		}
	});
});

server.get(/^\/.*/, function(req, res, next) {
	file.serve(req, res, next);
});

server.listen(config.http.port, config.http.hostname, function() {
	log.info('%s listening at %s', server.name, server.url);
});


