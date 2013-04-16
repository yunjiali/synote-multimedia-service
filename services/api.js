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
	node_static = Common.node_static,
	utils = Common.utils;
	
var http = require('http');

var ffmpegService = require('../services/ffmpeg-service.js');
var youtubeService = require('../services/youtube-service.js');
var dailymotionService = require ('../services/dailymotion-service.js');
var subtitleService = require('../services/subtitle-service.js');

/* params:
 * server: the restify serve instance
 * */
exports.init = function()
{
	server.use(restify.queryParser());
	if(config.api.generateThumbnail == true)
		server.get('/api/generateThumbnail', generateThumbnail);
	if(config.api.getMetadata == true)
		server.get('/api/getMetadata',getMetadata);
	if(config.api.getDuration == true)
		server.get('/api/getDuration',getDuration);
	if(config.api.isVideo == true)
		server.get('/api/isVideo',isVideo);
	if(config.api.getSubtitleList == true)
		server.get('/api/getSubtitleList',getSubtitleList);
	if(config.api.getSubtitleSRT == true)
		server.get('/api/getSubtitleSRT',getSubtitleSRT);
	//server.head('/api/:name', respond);
}
/*
 * Generate thumbnail picture for a video
 * params: id, videourl, start, end
 * 
 */
function generateThumbnail(req, res, next) {
	log.debug(req.query.id);
	log.debug(req.query.videourl);
	var id = req.params.id;
	var videourlEncoded = req.query.videourl;
	
	if(id === undefined || videourlEncoded === undefined)
	{
		return next(new restify.MissingParameterError("videourl is missing!"));
	}
	
	var videourl = decodeURIComponent(videourlEncoded);
	if(utils.isValidURL(videourl))
	{
		return next(new restify.InvalidArgumentError("videourl parameter is not a valid url!"));
	}
	
	//get the thumbnail picture position
	var time;
	
	if(req.query.start === undefined && req.query.end === undefined)
	{
		time = -1;
		//TODO: if it's youtube video, directly read the thumbnail using youtube-dl
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
		youtubeService.generateThumbnail(id,videourl,time,function(err,thumbnail_file){
			
			if(err != null)
				return next(err);
			else if(time === -1) //a picture from youtube
				return res.send({thumbnail_url:thumbnail_file});
			else
				return res.send({thumbnail_url:server.url+config.thumbnail.root_dir+"/"+id+"/"+thumbnail_file});		
		});
		
	}
	else if(utils.isDailyMotionURL(videourl,true))
	{
		dailymotionService.generateThumbnail(id,videourl,time,function(err,thumbnail_file){
			
			if(err != null)
				return next(err);
			else if(time === -1) //a picture from youtube
				return res.send({thumbnail_url:thumbnail_file});
			else
				return res.send({thumbnail_url:server.url+config.thumbnail.root_dir+"/"+id+"/"+thumbnail_file});		
		});
	}
	else
	{
		ffmpegService.generateThumbnail(id,videourl,time,function(err,thumbnail_file){
			if(err != null)
				return next(err);
			else	
				return res.send({thumbnail_url:server.url+config.thumbnail.root_dir+"/"+id+"/"+thumbnail_file});		
		});
		
		
	}
}

/*
 * Get the metadata of the video or audio resource. The metadata we can get depends on the resource of the multimedia.
 * For online multimedia files, we use ffmpeg, and for Youtube Videos, we use the youtube api
 * params: videourl
 * example metadata json:
 * {
	 "id": string,
	 "metadata": {
	   "title": string,
	   "description": string,
	   "tags": [
	     string
	   ],
	   "category": {
	        label:string,
	        uri:string
	   } (for both yt and dm)
	   "duration": string in seconds,
	   "language": string, (only dm)
	   "creationDate": datetime,
	   "publicationDate": datetime,
	 },
	 "statistics": {
	   "views": unsigned long,
	   "comments": unsigned long
	   "favorites": unsigned long,
	   "ratings": unsigned long,
	 }
   }
 *
 */
function getMetadata(req,res,next)
{
	var videourlEncoded = req.query.videourl;
	
	if(videourlEncoded === undefined)
	{
		return next(new restify.MissingParameterError("videourl is missing!"));
	}
	
	var videourl = decodeURIComponent(videourlEncoded);
	
	if(utils.isValidURL(videourl))
	{
		return next(new restify.InvalidArgumentError("videourl parameter is not a valid url!"));
	}
	
	if(utils.isYouTubeURL(videourl, true))
	{
		youtubeService.getMetadata(videourl,function(err,metadata){
			if(err != null)
				return next(err);
			return res.send(metadata);
		});
	}
	else if(utils.isDailyMotionURL(videourl, true))
	{
		dailymotionService.getMetadata(videourl,function(err,metadata){
			if(err != null)
				return next(err);
			return res.send(metadata);
		});
	}
	else
	{
		ffmpegService.getMetadata(videourl,function(err,metadata){
			if(err != null)
				return next(err);
			return res.send(metadata);
		});
	}
}

/*
 * Get the duration of the audio or video resources given the videourl
 * params: videourl
 */
function getDuration(req,res,next)
{
	var videourlEncoded = req.query.videourl;
	
	if(videourlEncoded === undefined)
	{
		return next(new restify.MissingParameterError("id or videourl is missing!"));
	}
	
	var videourl = decodeURIComponent(videourlEncoded);
	
	if(utils.isValidURL(videourl))
	{
		return next(new restify.InvalidArgumentError("videourl parameter is not a valid url!"));
	}
	
	if(utils.isYouTubeURL(videourl, true))
	{
		youtubeService.getDuration(videourl,function(err,duration){
			if(err != null)
				return next(err);
			return res.send(duration);
		});
	}
	if(utils.isDailyMotionURL(videourl, true))
	{
		dailymotionService.getDuration(videourl,function(err,duration){
			if(err != null)
				return next(err);
			return res.send(duration);
		});
	}
	else
	{
		ffmpegService.getDuration(videourl,function(err,duration){
			if(err != null)
			{
				return next(err);
			}
			return res.send(duration);
		});
	}
}

function isVideo(req,res,next)
{
	var videourlEncoded = req.query.videourl;
	
	if(videourlEncoded === undefined)
	{
		return next(new restify.MissingParameterError("id or videourl is missing!"));
	}
	
	var videourl = decodeURIComponent(videourlEncoded);
	
	if(utils.isValidURL(videourl))
	{
		return next(new restify.InvalidArgumentError("videourl parameter is not a valid url!"));
	}
	
	if(utils.isYouTubeURL(videourl, true) || utils.isDailyMotionURL(videourl,true))
	{
		return res.send({isVideo:true});
	}
	else
	{
		ffmpegService.isVideo(videourl,function(err,isVideo){
			if(err!=null)
				return next(err);
			return res.send({isVideo:isVideo});
		});
	}
}

function getSubtitleList(req,res,next)
{
	var videourlEncoded = req.query.videourl;
	
	if(videourlEncoded === undefined)
	{
		return next(new restify.MissingParameterError("videourl is missing!"));
	}
	
	var videourl = decodeURIComponent(videourlEncoded);
	
	if(utils.isValidURL(videourl))
	{
		return next(new restify.InvalidArgumentError("videourl parameter is not a valid url!"));
	}
	
	if(utils.isYouTubeURL(videourl, true))
	{
		youtubeService.getSubtitleList(videourl,function(err,metadata){
			if(err != null)
				return next(err);
			return res.send(metadata);
		});
	}
	else if(utils.isDailyMotionURL(videourl, true))
	{
		dailymotionService.getSubtitleList(videourl,function(err,metadata){
			if(err != null)
				return next(err);
			return res.send(metadata);
		});
	}
	else
	{
		ffmpegService.getSubtitleList(videourl,function(err,metadata){
			if(err != null)
				return next(err);
			return res.send(metadata);
		});
	}
}

/*
 * subtitleurl: the url of the subtitle
 * fmt: the data structure of the return json, default is "json"
 * 
 */

function getSubtitleSRT(req,res,next)
{
	var subtitleurlEncoded = req.query.subtitleurl;
	
	log.debug("getSubtitleSRT");
	if(subtitleurlEncoded === undefined)
	{
		return next(new restify.MissingParameterError("subtitleurl is missing!"));
	}
	
	var subtitleurl = decodeURIComponent(subtitleurlEncoded);
	
	if(utils.isValidURL(subtitleurl))
	{
		return next(new restify.InvalidArgumentError("subtitleurl parameter is not a valid url!"));
	}

	var fmt = req.query.fmt;
	if(fmt === undefined)
		fmt = "json"
	
	subtitleService.getSubtitleSRT(subtitleurl,fmt, function(err,data){
		if(err != null)
			return next(err);
		return res.send(data);
	});
}

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
