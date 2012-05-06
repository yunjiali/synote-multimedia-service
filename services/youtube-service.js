var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils;

var http = require('http');

var vlcService = require('../services/vlc-service.js');

exports.generateThumbnail = function(id,videourl,time,callback){
	vlcService.generateThumbnail(id,videourl,time,function(err,file){
		return callback(err,file)
	});
};

exports.getMetadata = function(videourl, callback)
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
		
		response.on('data', function(chunk){
			//console.log(chunk.toString());
			result += chunk;
		});

		response.on('end', function(err){
			//TODO: create your own exception for this occasion
			if(err != null)
				return callback(err,result);
			
			var obj = JSON.parse(result);
			log.debug(require('util').inspect(obj, false, null));
			return callback(err,obj);
	  	});
	});
};
  
exports.getDuration = function(){}