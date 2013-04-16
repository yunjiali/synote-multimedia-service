var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify;

var nerd = require('nerd4node');
var keys = require('../lib/keys.js').keys;
var API_KEY = keys.nerd;
var http = require('http');
var https = require('https');

exports.nerdifySRT = function(subtitleurl, fmt, nm, videourl, callback)
{
	log.debug("apikey:"+API_KEY);
	var protocol = http;
	if(subtitleurl.toLowerCase().indexOf("https") === 0)
	{
		protocol = https;
	}
	
	//Version: the first param should be an "option" in v0.6.16
	protocol.get(subtitleurl,function(response){
		var result = ''; //the srt string
		log.debug("Get srt from "+subtitleurl);
		
		if(response.statusCode === 400)
		{
			var err = new restify.InternalError("Response code 400: Cannot get subtitle from "+subtitleurl);
			return callback(err,result);
		}
		else if(response.statusCode === 401)
		{
			var err = new restify.InternalError("Response code 401: Authentication failed for "+subtitleurl);
			return callback(err,result);
		}
		else if(response.statusCode === 403)
		{
			var err = new restify.InternalError("Response code 403: Cannot get subtitle from a forbidden place "+subtitleurl);
			return callback(err,result);
		}
		else if(response.statusCode === 404)
		{
			var err = new restify.InternalError("Response code 404: Cannot find "+subtitleurl);
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
				
			nerd.annotate(
				'http://nerd.eurecom.fr/api/', 
	            API_KEY, 
	            'combined', 
	            'text', 
	            result, 
	            'oen', 
	            50*1000, 
	            function(err, contents){		            	
	        		return callback(err,contents);
	        	}
	        );
	  	});
	});
	
}