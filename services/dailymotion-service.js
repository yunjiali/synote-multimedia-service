var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify;

var http = require('http');
var https = require('https');

var vlcService = require('../services/vlc-service.js');

exports.getMetadata = getMetadata;

exports.generateThumbnail = function(id,videourl,time,callback){
	if(time===-1)
	{
		getMetadata(videourl,function(err,metadata){
			if(err != null)
				return callback(err,null);
			
			if(metadata.thumbnail_medium_url === undefined)
				return callback(new restify.RestError("Cannot get the default thumbnail picture from DailyMotion."),null);
				
			return callback(err,metadata.thumbnail_medium_url);
		});
	}
	else
	{
		vlcService.generateThumbnail(id,videourl,time,function(err,file){
			return callback(err,file)
		});
	}
};

function getMetadata(videourl, callback)
{
	var videoid = utils.getVideoIDFromDailyMotionURL(videourl);
	
	if(videoid === undefined)
		return next(new restify.InvalidArgumentError("Cannot get the DailyMotion video id from videourl"));
	var options = {
			host:"api.dailymotion.com",
	        path:"/video/"+videoid+"?fields=title%2Cdescription%2Cduration%2Ctags%2Cthumbnail_medium_url"
	}
	
	https.get(options,function(response){
		
		var result = '';
		log.debug("Requesting metadata for DailyMotion video "+videoid+". Response status:"+response.statusCode);
		if(response.statusCode === 400)
		{
			var err = new restify.InternalError("Response code 400: Cannot get metadata from DailyMotion video "+videoid);
			return callback(err,result);
		}
		else if(response.statusCode === 401)
		{
			var err = new restify.InternalError("Response code 401: Authentication failed for DailyMotion video "+videoid);
			return callback(err,result);
		}
		else if(response.statusCode === 403)
		{
			var err = new restify.InternalError("Response code 403: Cannot get metadata from a private DailyMotion video "+videoid);
			return callback(err,result);
		}
		else if(response.statusCode === 404)
		{
			var err = new restify.InternalError("Response code 404: Cannot find DailyMotion video "+videoid);
			return callback(err,result);
		}
		
		response.on('data', function(chunk){
			//console.log(chunk.toString());
			result += chunk;
		});

		response.on('end', function(err){
			//TODO: CustomiseException
			if(err != null)
				return callback(err,result);
			//log.debug(require('util').inspect(result, false, null));
			var obj = JSON.parse(result);
			//log.debug(require('util').inspect(obj, false, null));
			return callback(err,obj);	
	  	});
	});
}

/*
 * Get the duration from youtube api
 */
exports.getDuration = function(videourl, callback){
	getMetadata(videourl,function(err,metadata){
		if(err != null)
			return callback(err,null);
		if(metadata.duration === undefined)
			return callback(new restify.RestError("Cannot get the duration of the resource"),null);
		var duration = parseInt(metadata.duration);
		return callback(err,{duration:duration*1000});
	})
//data.entry[ "media$group" ][ "yt$duration" ].seconds	
	
	
}