var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify;
	
var fs = require('fs');
var lazy=require("lazy");

var dailymotionService = require('../services/dailymotion-service.js');

/*
  Make API calls and save metadata of the video locally
 */
exports.generateAll = function(callback)
{
	var err = null;
	var opts = { flags: 'r',
	  encoding: null,
	  fd: null,
	  mode: 0666,
	  bufferSize: 64 * 1024
	}
	
	var laziness = new lazy(fs.createReadStream("tests/dailymotion/filenames2.txt"),opts);
	if(laziness !== undefined)
	{
		callback(null);
		//log.debug("lazy callback");
		laziness.lines
	     	.forEach(
	    		function(line) { 
	          		//log.debug(line.toString());
	              	//call dailymotion
	              	dailymotionService.getMetadata("http://www.dailymotion.com/video/"+line, function(err,formalObj){
	              		var filename = line+"_metadata.json";
						fs.writeFile("tests/dailymotion/"+filename, JSON.stringify(formalObj,null,4), function(err) {
						    if(err) {
						        console.log(err);
						    } else {
						        console.log("The file "+filename+" was saved!");
						    }
						}); 
	              	});
	          }
		);
		//log.debug("lazy return");
		return;
	}
	else
	{
		return callback("Cannot find the file");
	}
}