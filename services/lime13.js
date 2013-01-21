var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify;
	
var fs = require('fs');
var lazy=require("lazy");
require('date-utils');

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
		var contentHeader = "id,title,tagsNo,channel,category,duration,language,creationDate,"+
	             		"creationYear, creationMonth,creationDay,publicationDate, publicationYear, publicationMonth, publicationDay,"+
	              		"views,comments,favorites,ratings\r\n";
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
							content+=formalObj.id+",";
							content+=formalObj.metadata.title.replace(/,/g,"")+",";
							//content+=formalObj.metadata.description+",";
							//content+=formalObj.metadata.tags+",";
							content+=formalObj.metadata.tags.length+",";
							content+=formalObj.metadata.channel+",";
							content+=formalObj.metadata.category+",";
							content+=formalObj.metadata.duration+",";
							content+=formalObj.metadata.language+",";
							content+=formalObj.metadata.creationDate+",";
							var cDate = new Date(formalObj.metadata.creationDate);
							content+=cDate.getFullYear()+",";
							content+=cDate.getMonthAbbr()+",";
							content+=cDate.getDate()+",";
							content+=formalObj.metadata.publicationDate+",";
							var pDate = new Date(formalObj.metadata.publicationDate);
							content+=pDate.getFullYear()+",";
							content+=pDate.getMonthAbbr()+",";
							content+=pDate.getDate()+",";
							content+=formalObj.statistics.views+",";
							content+=formalObj.statistics.comments+",";
							content+=formalObj.statistics.favorites+",";
							content+=formalObj.statistics.ratings+",";
							content+="\r\n";
							
							csv.write(content);
							log.debug("metadata for "+line+" was saved!");
						}
						else
						{
							var ferr = fs.createWriteStream('tests/dailymotion/error.log', {'flags': 'a'});
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