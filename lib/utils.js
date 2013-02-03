/*
 * Providing utility functions
 */

var path = require('path');
var fs = require('fs');
var os = require('os');

exports.stringToSec = function(timeStr)
{
	if (timeStr == null || timeStr.length == 0)
	{
		return 0;
	}

	// implement regexp validation

	var seconds = null;
	var index = timeStr.lastIndexOf(":");
	if (index != -1)
	{
		seconds = timeStr.substring(index + 1);
		timeStr = timeStr.substring(0, index);
	}
	else
	{
		seconds = timeStr;
		timeStr = null;
	}
	
	var minutes = null;
	index = (timeStr != null) ? timeStr.lastIndexOf(":") : -1;
	if (index != -1)
	{
		minutes = timeStr.substring(index + 1);
		timeStr = timeStr.substring(0, index);
	}
	else
	{
		minutes = timeStr;
		timeStr = null;
	}

	var hours = timeStr;

	var time = 0;
	if (seconds != null && seconds.length != 0)
	{
		time += parseInt(seconds,10);
	}

	if (minutes != null && minutes.length != 0)
		time += parseInt(minutes,10) * 60;

	if (hours != null && hours.length != 0)
		time += parseInt(hours,10) * 3600;

	return time;
}
exports.isValidURL = function (str) {
	  /*var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
	    '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]|'+ // domain name
	    '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
	    '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
	    '(\?[;&a-z\d%_.~+=-]*)?'+ // query string
	    '(\#[-a-z\d_]*)?$','i'); // fragment locater
	  if(!pattern.match(str)) {
		  return false;
	  } else {
		  return true;
	  }*/
	
	var pattern = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/;
	if(!str.match(pattern)) {
		  return false;
	  } else {
		  return true;
	  }
	
};

exports.isYouTubeURL = function(url,bool) {
	
    var pattern = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/;
    if (url.match(pattern)) {
        return (bool !== true) ? RegExp.$1 : true;
    } else { return false; }
};

/*
 * Convert Youtube ISO8601 format duration to seconds
 */
exports.convertYouTubeISO8601ToSec = function(ytDurationStr)
{
	//PT2M47S
	//PT25S
	//PT3M
	//PT1H2M13S
	var timeStr = ytDurationStr.replace("PT","").replace("H",":").replace("M",":").replace("S","");
	if(timeStr.match("^:"))
	{
		timeStr ="00"+timeStr;
	}
	
	if(timeStr.match(":^"))
	{
		timeStr =timeStr+"00";
	}
	
	return this.stringToSec(timeStr);
}

exports.getVideoIDFromYoutubeURL = function(url)
{
   	var regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[1].length==11){
        return match[1];
    }else{
        return;
    }
};

/*the section parameter is not useful here I think*/
exports.isDailyMotionURL = function(url,bool) 
{
	var m = url.match(/^.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/);
    if (m !== null) {
        return true;
    }
    else
    {
    	return false;
    }
};

exports.getVideoIDFromDailyMotionURL = function(url)
{
	var m = url.match(/^.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/);
    if (m !== null) {
        if(m[4] !== undefined) {
            return m[4];
        }
        return m[2];
    }
    return;
};

/* Create full path, if the directory does not exists
 * See: https://gist.github.com/864454
 * */
exports.createFullPath = function createFullPath(fullPath, callback) {
	var parts = path.dirname(path.normalize(fullPath)).split("/");
	var working = '';
	if(os.platform() !== 'win32') // for windows platform, we don't need the slash
		working = '/';
	var pathList = [];

	for(var i = 0, max = parts.length; i < max; i++) {
		working = path.join(working, parts[i]);

		pathList.push(working);
	}
	
	console.log("working:"+working);

	var recursePathList = function recursePathList(paths) {
		console.log("path:"+paths);
		if(0 === paths.length) {
			callback(null);
			return ;
		}

		var working = paths.shift();

		try {
			path.exists(working, function(exists) {
				if(!exists) {
					try {
						fs.mkdir(working, 0755, function() {
							console.log("create:"+working);
							recursePathList(paths);
						});
					}
					catch(e) {
						callback(new Error("Failed to create path: " + working + " with " + e.toString()));
					}
				}
				else {
					recursePathList(paths);				
				}
			});
		}
		catch(e) {
			callback(new Error("Invalid path specified: " + working));
		}
	}

	if(0 === pathList.length)
		callback(new Error("Path list was empty"));
	else
		recursePathList(pathList);
};

/*
 * The above JavaScript funciton accepts three parameters.The first and second parameter is mandatory while the third is optional. 
 * The first and second parameter specifies the range between which the random number has to be generated. 
 * The third parameter is optional which specifies number of floating point digits, if not provided, 
 * the above JavaScript function returns integer random number.
 */
exports.getRandomNoBetween = function (minVal,maxVal,floatVal)
{
  var randVal = minVal+(Math.random()*(maxVal-minVal));
  return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
}