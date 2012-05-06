/*
 * Providing utility functions
 */

var path = require('path');
var fs = require('fs');

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

exports.getVideoIDFromYoutubeURL = function(url)
{
   	var regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[1].length==11){
        return match[1];
    }else{
        return;
    }
}

/* Create full path, if the directory does not exists
 * See: https://gist.github.com/864454
 * */
exports.createFullPath = function createFullPath(fullPath, callback) {
	var parts = path.dirname(path.normalize(fullPath)).split("/"),
		working = '/',
		pathList = [];

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