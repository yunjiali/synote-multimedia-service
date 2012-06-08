var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify;

var http = require('http');

var vlcService = require('../services/vlc-service.js');

exports.getMetadata = getMetadata;

exports.generateThumbnail = function(id,videourl,time,callback){
	if(time===-1)
	{
		getMetadata(videourl,function(err,metadata){
			if(err != null)
				return callback(err,null);
			
			if(metadata.entry[ "media$group" ][ "media$thumbnail" ][ 0 ].url === undefined)
				return callback(new restify.RestError("Cannot get the default thumbnail picture from YouTube."),null);
				
			return callback(err,metadata.entry[ "media$group" ][ "media$thumbnail" ][ 0 ].url);
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
	var videoid = utils.getVideoIDFromYoutubeURL(videourl);
	
	if(videoid === undefined)
		return next(new restify.InvalidArgumentError("Cannot get the YouTube video id from videourl"));
	var options = {
			host:"gdata.youtube.com",
	        path:"/feeds/api/videos/"+videoid+"?v=2&alt=json&key="+config.youtube.key
	}
	
	http.get(options,function(response){
		
		var result = '';
		log.debug("Requesting metadata for Youtube video "+videoid+". Response status:"+response.statusCode);
		if(response.statusCode === 400)
		{
			var err = new restify.InternalError("Response code 400: Cannot get metadata from YouTube video "+videoid);
			return callback(err,result);
		}
		else if(response.statusCode === 403)
		{
			var err = new restify.InternalError("Response code 403: Cannot get metadata from a private YouTube video "+videoid);
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
			log.debug(require('util').inspect(result, false, null));
			var obj = JSON.parse(result);
			log.debug(require('util').inspect(obj, false, null));
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
		if(metadata.entry[ "media$group" ][ "yt$duration" ].seconds === undefined)
			return callback(new restify.RestError("Cannot get the duration of the resource"),null);
		var duration = parseInt(metadata.entry[ "media$group" ][ "yt$duration" ].seconds);
		return callback(err,{duration:duration*1000});
	})
//data.entry[ "media$group" ][ "yt$duration" ].seconds	
	
	
}