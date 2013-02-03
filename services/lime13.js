var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify;
	
var fs = require('fs');
var lazy=require("lazy");
require('date-utils');

var csvSeparator = "^^^^^^^^"

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
	
	var laziness = new lazy(fs.createReadStream("tests/dailymotion/filenames.txt"),opts);
	if(laziness !== undefined)
	{
		callback(null);
		//log.debug("lazy callback");
		var csv = fs.createWriteStream('tests/dailymotion/metadata.csv', {'flags': 'a'});
		var contentHeader = "id^^^^^^^^title^^^^^^^^description^^^^^^^^tags^^^^^^^^tagsNo^^^^^^^^channel^^^^^^^^category^^^^^^^^"+
						"duration^^^^^^^^language^^^^^^^^creationDate^^^^^^^^"+
	             		"creationYear^^^^^^^^creationMonth^^^^^^^^creationDay^^^^^^^^publicationDate^^^^^^^^publicationYear^^^^^^^^publicationMonth^^^^^^^^publicationDay^^^^^^^^"+
	              		"views^^^^^^^^comments^^^^^^^^favorites^^^^^^^^ratings\r\n";
	    csv.write(contentHeader);
	    //var filenamecsv="metadata.csv";
	        
		laziness.lines
	     	.forEach(
	    		function(line) { 
	          		//log.debug(line.toString());
	              	//call dailymotion
	              	dailymotionService.getMetadata("http://www.dailymotion.com/video/"+line, function(err,formalObj){
	              		 
						if(err == null)
						{
							var filename = line+"_metadata.json";
							fs.writeFile("tests/dailymotion/"+filename, JSON.stringify(formalObj,null,4), function(err) {
							   if(err) {
							        console.log(err);
							    } else {
							        console.log("The file "+filename+" was saved!");
							    }
							});
							
							var content="";
							//write csv file
							content+='"'+formalObj.id+'"'+csvSeparator;
							content+='"'+formalObj.metadata.title+'"'+csvSeparator;
							content+='"'+formalObj.metadata.description+'"'+csvSeparator;
							content+='"'+formalObj.metadata.tags+'"'+csvSeparator;
							content+='"'+formalObj.metadata.tags.length+'"'+csvSeparator;
							content+='"'+formalObj.metadata.channel+'"'+csvSeparator;
							content+='"'+formalObj.metadata.category+'"'+csvSeparator;
							content+='"'+formalObj.metadata.duration+'"'+csvSeparator;
							content+='"'+formalObj.metadata.language+'"'+csvSeparator;
							content+='"'+formalObj.metadata.creationDate+'"'+csvSeparator;
							var cDate = new Date(formalObj.metadata.creationDate);
							content+='"'+cDate.getFullYear()+'"'+csvSeparator;
							content+='"'+cDate.getMonthAbbr()+'"'+csvSeparator;
							content+='"'+cDate.getDate()+'"'+csvSeparator;
							content+='"'+formalObj.metadata.publicationDate+'"'+csvSeparator;
							var pDate = new Date(formalObj.metadata.publicationDate);
							content+='"'+pDate.getFullYear()+'"'+csvSeparator;
							content+='"'+pDate.getMonthAbbr()+'"'+csvSeparator;
							content+='"'+pDate.getDate()+'"'+csvSeparator;
							content+='"'+formalObj.statistics.views+'"'+csvSeparator;
							content+='"'+formalObj.statistics.comments+'"'+csvSeparator;
							content+='"'+formalObj.statistics.favorites+'"'+csvSeparator;
							content+='"'+formalObj.statistics.ratings+'"'+csvSeparator;
							content+="\r\n";
							
							csv.write(content);
							log.debug("metadata for "+line+" was saved!");
						}
						else
						{
							var ferr = fs.createWriteStream('tests/dailymotion/error_metadata.log', {'flags': 'a'});
							ferr.write(line + ":"+err + "\r\n");
						}
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