/*
 * Defines all RESTful apis
 * For more information see
 * <a>https://github.com/yunjiali/synote-multimedia-service/wiki/RESTful-APIs</a>
 */
var Common = require('../lib/common.js');
var log = Common.log,
	restify = Common.restify,
	config = Common.config,
	server = Common.server,
	node_static = Common.node_static;

var utils = require("../lib/utils.js");
var ffmpegService = require('../services/ffmpeg-service.js');


/* params:
 * server: the restify serve instance
 * */
exports.init = function()
{
	server.use(restify.queryParser());
	server.get('/api/generateThumbnail', generateThumbnail);
	//server.head('/api/:name', respond);
}
/*
 * Generate thumbnail picture for a video
 * params: id, videourl, start, end
 * 
 */
function generateThumbnail(req, res, next) {
	console.log(req.query.id);
	console.log(req.query.videourl);
	var id = req.params.id;
	var videourlEncoded = req.query.videourl;
	
	if(id === undefined || videourlEncoded === undefined)
	{
		return next(new restify.MissingParameterError("id or videourl is missing!"));
	}
	
	var videourl = decodeURIComponent(videourlEncoded);
	if(utils.isValidURL(videourl))
	{
		return next(new restify.InvalidArgumentError("videourl parameter is not a valid url!"));
	}
	
	//get the thumbnail picture position
	var time;
	//TODO:Get the duration and set it a random position within the duration
	if(req.query.start === undefined && req.query.end === undefined)
	{
		time = 0;
	}
	else
	{
		if(req.query.start === undefined)
		{
			req.query.start = 0;
		}
		else if(req.query.end === undefined)
		{
			req.query.end = req.query.start;
		}
		
		var start = parseTimeToInt(req.query.start);
		if(start instanceof restify.RestError)
		{
			return next(start);
		}
		
		var end = parseTimeToInt(req.query.end);
		if(end instanceof restify.RestError)
		{
			return next(end);
		}
			
		if(start > end)
		{
			end = start;
		}
		time = parseInt((start+end)/2);
	}
	
	//for different youtube video, we need to use vlc 
	if(utils.isYouTubeURL(videourl, true))
	{
		
	}
	else
	{
		var thumbnail_file = ffmpegService.generateThumbnail(id,videourl,time);
		res.send(server.url+config.thumbnail.root_dir+"/"+id+"/"+thumbnail_file);
	}
}

/*
 * generateThumbnail()
 * on receiving the request, return the url of the image immediately, then call ffmpeg or vlc to generate the thumbnail picture.
 * In node-static, if the image is not found,i.e. the image is still in generating or the image doesn't exist at all, we will return a default image.
 * 
 */

/*
 * s: start time
 * e: end time
 * 
 */
function parseTimeToInt(t)
{
	//TODO: check duration and see if end time is bigger than it.
	var time = parseInt(t);
	
	if(isNaN(time))
	{
		return new restify.InvalidArgumentError(t+" is not a valid time format!");
	}
	
	if(time < 0)
	{
		return new restify.InvalidArgumentError("Time must be greater than 0!");
	}
	
	return time;
}
