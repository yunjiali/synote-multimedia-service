var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify;
	
var fs = require('fs');
var lazy=require("lazy");
var async=require("async");
require('date-utils');

var csvSeparator = "\t"

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
		var contentHeader = "id"+csvSeparator+"title"+csvSeparator+"description"+csvSeparator+"tags"+csvSeparator+"tagsNo"+csvSeparator+"channel"+csvSeparator+"category"+csvSeparator+""+
						"duration"+csvSeparator+"language"+csvSeparator+"creationDate"+csvSeparator+""+
	             		"creationYear"+csvSeparator+"creationMonth"+csvSeparator+"creationDay"+csvSeparator+"publicationDate"+csvSeparator+"publicationYear"+csvSeparator+"publicationMonth"+csvSeparator+"publicationDay"+csvSeparator+""+
	              		"views"+csvSeparator+"comments"+csvSeparator+"favorites"+csvSeparator+"ratings\r\n";
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

/*
 * Generate media fragment statistical data from json files
 */
exports.mfStat = function(callback){
	var dir = "tests/dailymotion/nerdjson/";
	var csv = fs.createWriteStream('tests/lime13/mf.csv', {'flags': 'a'});
	var contentHeader = "videoid"+csvSeparator+"idEntity"+csvSeparator+"label"+csvSeparator+"startChar"+csvSeparator+"endChar"+csvSeparator+
			"extractorType"+csvSeparator+"nerdType"+csvSeparator+"uri"+csvSeparator+"confidence"+csvSeparator+
			"relevance"+csvSeparator+"extractor"+csvSeparator+"startNPT"+csvSeparator+"endNPT\r\n";
	csv.write(contentHeader);
	var len=0;
	var q = async.queue(function (task, callback) {
    	var text = fs.readFileSync(dir+task.filename,'utf-8');
	    log.debug(task.filename);
    	//if (err) 
			//log.debug(err);
    	eval("var result = "+text); //sometimes there the json includes some special characters that will lead to error
    	if(result !== undefined)
    	{
    		len += result.length;
    		for(var i=0;i<result.length;i++)
    		{
    			var content = "";
    			content+=task.filename.replace(".json","")+csvSeparator; //write the video id
    			content+=result[i].idEntity !== undefined?result[i].idEntity:"null";
    			content+=csvSeparator;
    			content+=result[i].label!== undefined?result[i].label.replace(/(\r\n|\n|\r)/gm," "):"null";
    			content+=csvSeparator;
    			content+=result[i].startChar!== undefined?result[i].startChar:"null";
    			content+=csvSeparator;
    			content+=result[i].endChar!== undefined?result[i].endChar:"null";
    			content+=csvSeparator;
    			content+=result[i].extractorType!== undefined?result[i].extractorType:"null";
    			content+=csvSeparator;
    			content+=result[i].nerdType!== undefined?result[i].nerdType:"null";
    			content+=csvSeparator;
    			content+=result[i].uri!== undefined?result[i].uri:"null";
    			content+=csvSeparator;
    			content+=result[i].confidence!== undefined?result[i].confidence:"null";
    			content+=csvSeparator;
    			content+=result[i].relevance!== undefined?result[i].relevance :"null";
    			content+=csvSeparator;
    			content+=result[i].extractor!== undefined?result[i].extractor:"null";
    			content+=csvSeparator;
    			content+=result[i].startNPT!== undefined?result[i].startNPT :"null";
    			content+=csvSeparator;
    			content+=result[i].endNPT!== undefined?result[i].endNPT:"null";
    			content+="\r\n";
    			csv.write(content);
    		}
    	}
    	log.debug("len:"+len);
	   	callback();
	}, 1); 
	
	fs.readdir(dir,function(err,files){
    	if (err) 
    		return callback(err);
    	callback(null);
    	for(var j=0;j<files.length;j++)
    	{
    		//console.log(files[j]);
    		q.push({filename:files[j]},function(err){
    			//log.debug("Reading file "+files[j]);
    			if(err!= null)
    			{
    				log.debug("ERROR!"+err);
    			}
    		});
    	}
	});
	return;
}