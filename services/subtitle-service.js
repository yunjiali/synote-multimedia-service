var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify;
	
var http = require('http');
var https = require('https');
var srt = require("../lib/srt.js");
/*
	download the subtitle from subtitle url and convert it according to fmt
	subtitleurl: required, the url of the subtitle in srt format
	fmt: the destination/return format in json as the conversion result
			default is "json" (the default json format); "synote" (the synote format of json)
	callback: function(err,data), err is the error message, 'data' is the return data 
*/
exports.getSubtitleSRT = function(subtitleurl, fmt, callback)
{	
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
			
			var data = srt.fromString("en",result);
			if(fmt == "synote") //change to synote json format
			{
				var uuid = require("node-uuid");
				var synoteData = [];
				for(var i=0;i<data.length;i++)
				{
					var sObj = {};
					sObj.cueSetting="";
					sObj.thumbnail=null;
					sObj.index = data[i].number;
					sObj.id = uuid.v4(); //randomly generate uuid
					sObj.cueText = data[i].languages.en;
					sObj.start=data[i].startTime;
					sObj.end=data[i].endTime;
					synoteData.push(sObj);
				}
				
				return callback(null,synoteData);
			}
			else
				return callback(null,data);
	  	});
	});
	/*
	 * Example of original json format:
	 	[
	 		{
	 			"number":1,
	 			"startTime":26494,
	 			"endTime":29394,
	 			"languages":
	 				{
	 					"en":"Well, nobody can work correctly."
	 				}
	 		},
	 		{
	 			"number":2,
	 			"startTime":29460,
	 			"endTime":30360,
	 			"languages":{"en":"Are you OK?"}
	 		}
	 	]
	 */
	 
	/*
	 * Example of Synote json format:
	 	[
	 		{
	 			"class":"org.synote.player.client.WebVTTCueData",
	 			"cueSettings":"",
	 			"cueText":"Bon, personne ne peut faire son travail correctement.",
	 			"end":29394,
	 			"id":"ceeca127-f0f9-497b-b34b-339e22045ee0",
	 			"index":1,
	 			"start":26494,
	 			"thumbnail":null
	 		},
	 		{
	 			"class":"org.synote.player.client.WebVTTCueData",
	 			"cueSettings":"",
	 			"cueText":"‚a va?",
	 			"end":30360,
	 			"id":"c6081450-ffe1-4784-9c97-a6108f007e4b",
	 			"index":2,
	 			"start":29460,
	 			"thumbnail":null
	 		}
	 	]
	 */
}