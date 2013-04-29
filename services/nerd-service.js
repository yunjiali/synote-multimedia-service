var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify;

var nerd = require('nerd4node');
var async = require('async');
var fs = require('fs');
var crypto = require('crypto');

var keys = require('../lib/keys.js').keys;
var API_KEY = keys.nerd;
var http = require('http');
var https = require('https');
var exec = require('child_process').exec

exports.nerdifySRT = function(subtitleurl, callback)
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
			
			nerd.annotate(
				'http://nerd.eurecom.fr/api/', 
	            API_KEY, 
	            'combined', 
	            'timedtext', 
	            result, 
	            'oen', 
	            50*1000, 
	            function(errnerd, contents){	
	        		return callback(errnerd,result,contents);
	        	}
	        );
	  	});
	});
	
}

/*
 * jdata: json data returned from nerd
 * nm: the root namespace used in RDFizator
 * videourl: the url of the video
 * callback(err, ttl)
 */
exports.generateRDF = function(srtdata, jdata, nm, videourl, callbackmain)
{
	var encrptyStr = srtdata+jdata+nm+videourl;
	var filename = crypto.createHash('md5').update(encrptyStr).digest('hex')
	var fsrt = "./tmp/"+filename+".srt";
	var fjson = "./tmp/"+filename+".json";
	var fttl = "./tmp/"+filename+".ttl";
	if(!fs.existsSync(fttl))
	{
		//if file doesn't exist
		//save tmp files locally
		//use RDFizator to generate ttl
		//read the ttl content and return
		//delete the file
	
		async.waterfall([ 
	        	function(callback){
	        		fs.writeFile(fjson, JSON.stringify(jdata), function (errfs) {
					  	if (errfs) 
					  		return callback(errfs);
						log.debug("write temp file "+fjson+" to tmp folder.");
						return callback(null);	  	
					});
	        	},
	        	function(callback){
	        		fs.writeFile(fsrt, srtdata, function (errsrt) {
					  	if (errsrt) 
					  		return callback(errsrt);
						log.debug("write temp file "+fsrt+" to tmp folder.");
						return callback(null);	  	
					});
	        	},
	        	function(callback){
	        		var child = exec('java -jar ./scripts/RDFizator/RDFizator.jar '+fjson+' -videourl '+videourl+' -nm '+nm,
						function (errRDFizator, stdout, stderr)
						{
						    log.debug('stdout: ' + stdout);
						    log.debug('stderr: ' + stderr);
						    if(errRDFizator !== null){
						      	log.debug('exec error: ' + errRDFizator);
						      	return callback(errRDFizator)
						    }
						    log.debug(fttl+" generated.");
						    return callback(null);
					    }
					);
	        	},
	        	function(callback){
	        		//read ttl file
	        		log.debug("read file "+fttl);
	        		fs.readFile(fttl, 'utf8',function(errttl, ttldata){
	        			if(errttl)
	        			{
							log.debug('read ttl file error:' + errttl);
						    return callback(errttl);
						}
						
						return callback(null, ttldata);	
	        		});
	        	}
		    ], function(err, result){
		    	//remove tmp files
		        callbackmain(err, result);
	    });
	}
	else
	{
		//read ttl file
		log.debug("read existing file "+fttl);
		fs.readFile(fttl, 'utf8',function(errttl, ttldata){
			if(errttl)
			{
				log.debug('read existing ttl file error:' + errttl);
			    return callbackmain(errttl,null);
			}
			
			return callbackmain(null, ttldata);	
		});
	}
}