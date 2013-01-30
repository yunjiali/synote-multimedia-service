var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify;

var http = require('http');
var https = require('https');
var xml2js = require('xml2js');

var vlcService = require('../services/vlc-service.js');
var ytKey = config.youtube.key;

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
	var metadataShort =false;
	
	var videoid = utils.getVideoIDFromYoutubeURL(videourl);
	
	if(videoid === undefined)
		return next(new restify.InvalidArgumentError("Cannot get the YouTube video id from videourl"));
	var options = {
			host:"www.googleapis.com",
	        path:"/youtube/v3/videos?id="+videoid+"&key="+ytKey+"&part=snippet,contentDetails,statistics,recordingDetails"
	}
	
	https.get(options,function(response){
		
		var result = '';
		log.debug("Requesting metadata for Youtube video "+videoid+". Response status:"+response.statusCode);
		if(response.statusCode === 400)
		{
			var err = new restify.InternalError("Response code 400: Cannot get metadata from YouTube video "+videoid);
			return callback(err,result);
		}
		else if(response.statusCode === 401)
		{
			var err = new restify.InternalError("Response code 401: Authentication failed for YouTube video "+videoid);
			return callback(err,result);
		}
		else if(response.statusCode === 403)
		{
			var err = new restify.InternalError("Response code 403: Cannot get metadata from a private YouTube video "+videoid);
			return callback(err,result);
		}
		else if(response.statusCode === 404)
		{
			var err = new restify.InternalError("Response code 404: Cannot find YouTube video "+videoid);
			return callback(err,result);
		}
		else if(response.statusCode === 503)
		{
			var err = new restify.InternalError("Response code 503: Backend error when accessing video "+videoid+". Please try again later.");
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
			var ytObj = JSON.parse(result);
			log.debug(require('util').inspect(ytObj, false, null));
			
			var formalObj = {}; //formalised response obj
			formalObj.id = ytObj.items[0].id;
			formalObj.metadata = {};
			formalObj.metadata.title = ytObj.items[0].snippet.title;
			formalObj.metadata.description = ytObj.items[0].snippet.description;
			formalObj.metadata.tags = ytObj.items[0].snippet.tags;
			formalObj.metadata.channel = ytObj.items[0].snippet.channelId;
			formalObj.metadata.category = ytObj.items[0].snippet.categoryId; //no category for dm
			formalObj.metadata.duration = utils.convertYouTubeISO8601ToSec(ytObj.items[0].contentDetails.duration); //do it later to parse ISO8601 to seconds
			formalObj.metadata.language = null; //not applicable for youtube
			
			var cDate = new Date(ytObj.items[0].snippet.publishedAt);
			if(metadataShort == false)
				formalObj.metadata.creationDateMilliSeconds = cDate.getTime();
			formalObj.metadata.creationDate = ytObj.items[0].snippet.publishedAt;
			
			//there is a known bug that recordingDetails is not available currenlty
			//http://stackoverflow.com/questions/14553776/youtube-api-v3-recordingdetails-object-missing-in-the-response
			var pDate= null;
			if(ytObj.items[0].recordingDetails !== undefined)
			{
				pDate = new Date(ytObj.items[0].recordingDetails.recordingDate);
				formalObj.metadata.publicationDate = ytObj.items[0].recordingDetails.recordingDate;
			}
			else
			{
				pDate = cDate;
				formalObj.metadata.publicationDate =ytObj.items[0].snippet.publishedAt;
			}
			
			if(metadataShort == false)
				formalObj.metadata.publicationDateMilliSeconds = pDate.getTime();
			
				
			if(metadataShort == false)
				formalObj.metadata.isVideo = true;
			if(metadataShort == false)
				formalObj.metadata.thumbnail = ytObj.items[0].snippet.thumbnails.default.url;
			
			formalObj.statistics = {};
			formalObj.statistics.views = ytObj.items[0].statistics.viewsCount;
			formalObj.statistics.comments = ytObj.items[0].statistics.likeCount;
			formalObj.statistics.favorites = ytObj.items[0].statistics.favoriteCount;
			formalObj.statistics.ratings = parseInt(ytObj.items[0].statistics.likeCount)-parseInt(ytObj.items[0].statistics.dislikeCount);
			return callback(err,formalObj);		
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

/*
 * Get available subtitle list from YouTube
 * callback(err,subtitleList)
 */
 exports.getSubtitleList = function(videourl,callback){
 	var parser = new xml2js.Parser();
 	var videoid = utils.getVideoIDFromYoutubeURL(videourl);
	
	if(videoid === undefined)
		return next(new restify.InvalidArgumentError("Cannot get the YouTube video id from videourl"));
	var options = {
			host:"www.youtube.com",
	        path:"/api/timedtext?v="+videoid+"&type=list"
	}
	
	http.get(options,function(response){
		
		var result = '';
		log.debug("Requesting metadata for Youtube video "+videoid+". Response status:"+response.statusCode);
		if(response.statusCode === 400)
		{
			var err = new restify.InternalError("Response code 400: Cannot get metadata from YouTube video "+videoid);
			return callback(err,result);
		}
		else if(response.statusCode === 401)
		{
			var err = new restify.InternalError("Response code 401: Authentication failed for YouTube video "+videoid);
			return callback(err,result);
		}
		else if(response.statusCode === 403)
		{
			var err = new restify.InternalError("Response code 403: Cannot get metadata from a private YouTube video "+videoid);
			return callback(err,result);
		}
		else if(response.statusCode === 404)
		{
			var err = new restify.InternalError("Response code 404: Cannot find YouTube video "+videoid);
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

			parser.parseString(result,function(err,xml){
				//log.debug(xml);
				var sl = {};
				sl.list = new Array();
				var track = xml.transcript_list.track
				var total = track.length;
				sl.total = total;
				for(var i =0;i<total;i++)
				{
					var trackName = track[i].$.name;
					var language = track[i].$.lang_code;
					sl.list[i] = {};
					sl.list[i].language = language;
					sl.list[i].url = "http://www.youtube.com/api/timedtext?v="+videoid+"&fmt=srt&lang="+language+"&name="+trackName;
				}
				log.debug(require('util').inspect(sl, false, null));
				return callback(err,sl);	
			});	
	  	});
	});
 }