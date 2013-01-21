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
		getMetadata(videourl,function(err,formalObj){
			if(err != null)
				return callback(err,null);
			
			if(formalObj.metadata.thumbnail_medium_url === undefined)
				return callback(new restify.RestError("Cannot get the default thumbnail picture from DailyMotion."),null);
				
			return callback(err,formalObj.metadata.thumbnail_medium_url);
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
    var metadataShort = true; // return short metadata or long metadata json
	var videoid = utils.getVideoIDFromDailyMotionURL(videourl);
	
	if(videoid === undefined)
		return next(new restify.InvalidArgumentError("Cannot get the DailyMotion video id from videourl"));
	var options = {
			host:"api.dailymotion.com",
	        path:"/video/"+videoid+"?fields=bookmarks_total,channel%2Ccomments_total%2Ccreated_time%2Cdescription%2Cduration%2Cid%2Clanguage%2Cratings_total%2Ctags%2Ctaken_time%2Ctitle%2Cviews_total%2Cthumbnail_medium_url"     
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
			var dmObj = JSON.parse(result); //direct response from dailymotion
			//log.debug(require('util').inspect(obj, false, null));
			var formalObj = {}; //formalised response obj
			formalObj.id = videoid;
			formalObj.metadata = {};
			formalObj.metadata.title = dmObj.title;
			formalObj.metadata.description = dmObj.description;
			formalObj.metadata.tags = dmObj.tags;
			formalObj.metadata.channel = dmObj.channel;
			formalObj.metadata.category = null; //no category for dm
			formalObj.metadata.duration = dmObj.duration;
			formalObj.metadata.language = dmObj.language;
			formalObj.metadata.creationDate = dmObj.created_time;
			formalObj.metadata.publicationDate = dmObj.taken_time;
			if(metadataShort == false)
				formalObj.metadata.isVideo = true;
			if(metadataShort == false)
				formalObj.metadata.thumbnail = dmObj.thumbnail_medium_url;
			formalObj.statistics = {};
			formalObj.statistics.views = dmObj.view_total;
			formalObj.statistics.comments = dmObj.comments_total;
			formalObj.statistics.favorites = dmObj.bookmarks_total;
			formalObj.statistics.ratings = dmObj.ratings_total;
			return callback(err,formalObj);	
	  	});
	});
}

/*
 * Get the duration from youtube api
 */
exports.getDuration = function(videourl, callback){
	getMetadata(videourl,function(err,formalObj){
		if(err != null)
			return callback(err,null);
		if(formalObj.metadata.duration === undefined)
			return callback(new restify.RestError("Cannot get the duration of the resource"),null);
		var duration = parseInt(formalObj.metadata.duration);
		return callback(err,{duration:duration*1000});
	})
//data.entry[ "media$group" ][ "yt$duration" ].seconds	
}


/*
 * Get available subtitle list from dailymotion
 * callback(err,subtitleList)
 */
 exports.getSubtitleList = function(videourl,callback){
 	var videoid = utils.getVideoIDFromDailyMotionURL(videourl);
	
	if(videoid === undefined)
		return next(new restify.InvalidArgumentError("Cannot get the DailyMotion video id from videourl"));
	var options = {
			host:"api.dailymotion.com",
	        path:"/video/"+videoid+"/subtitles?fields=language,url&limit=100"
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
			var sl = {};
			sl.total = obj.total;
			sl.list = obj.list;
			return callback(err,sl);	
	  	});
	});
 }