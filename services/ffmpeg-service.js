var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify;

var ffmpeg = require('fluent-ffmpeg');
var Metalib = require('fluent-ffmpeg').Metadata;

//the root directory of thumbnail on the disk 
var thumbnail_root = config.node_static.root+config.thumbnail.root_dir;
log.debug(thumbnail_root);
//the size of the thumbnail
var thumbnail_size = config.thumbnail.width+"x"+config.thumbnail.height;

exports.generateThumbnail = generateThumbnail;
exports.getMetadata = getMetadata;
exports.getDuration = getDuration;
exports.isVideo = isVideo;

/* generate thumbnail pictures using ffmpeg
 * params: id, videourl, time (in milliseconds) 
 * return: the file name for thumbnail picture
 * 
 * According to the processor.js in ffmpeg, the generated thumbnail file will be at:
 * var target = Meta.escapedPath(folder + '/tn_' + offset + 's.jpg');
 * 
 * There is no callback function in this method, as the waiting for thumbnail generation may take a long time
 */
function generateThumbnail(id,videourl,time,callback){
	//convert time to seconds
	
	//TODO:Get the duration and set it a random position within the duration
	getMetadata(videourl,function(err,metadata){
		if(err != null)
			return callback(err,null);
		
		var isVideo = isVideoJSON(metadata);
		
		if(isVideo === false)
		{
			var err = new restify.InvalidArgumentError("The requesting resource is not a video!"); //TODO: CustomiseException
			return callback(err,null);
		}
		
		var duration = getDurationJSON(metadata);
		
		if(time === -1)
		{
			time = utils.getRandomNoBetween(0,duration,undefined);
		}
		else if(time > duration) //there are blank images in between frames
		{
			time = duration*0.9;
		}
		var t = (time-time%1000) / 1000;
		var thumbnail_folder = thumbnail_root+'/'+id; // no '/' here!
		var thumbnail_file = 'tn_'+t+'s.jpg'; 
		var proc = new ffmpeg({ source: videourl})
			.withSize(thumbnail_size)
			.takeScreenshots({
		      count: 1,
		      timemarks: [ t ]
		    }, thumbnail_folder, function(err) {
		    	
		    	log.info('screenshots were saved as '+ thumbnail_file );
		    	if(err != null)
		    	{
		    		return callback(err,null);
		    	}
		});
		
		return callback(null,thumbnail_file);
	});
};

/*
 * Get the metadata of a multimedia resource, not only for video
 * params: videourl, callback(the callback function)
 */
function getMetadata(videourl, callback)
{
	var metaObj = new Metalib(videourl);
	metaObj.get(function(metadata,err) {
		log.debug(require('util').inspect(metadata, false, null));
		//TODO: how can I make sure ffmpeg can get the metadata?
		if((metadata.video.resolution.w === 0 && metadata.video.resolution.h === 0) || metadata.video.container == "mp3")
			metadata.isVideo = false;
		else
			metadata.isVideo = true;
		callback(null,metadata);
	});
}

/*
 * Get the duration of a multimedia resource. 
 * Using fluent-ffmpeg, this information can be obtained using 'durationsec'.
 * The returned duration is in milliseconds
 */
function getDuration(videourl,callback)
{
	getMetadata(videourl,function(err,metadata){
		if(err != null)
			return callback(err,null);
		
		if(metadata.durationsec === undefined)
			return callback(new restify.InvalidArgumentError("Cannot get the duration of the resource"),null); //TODO: CustomiseException
		
		var duration = parseInt(metadata.durationsec);
		log.debug("duration:"+duration);
		return callback(err,{duration:duration*1000});
	})
}
/*
 * Not event-based function for getDuration
 */
function getDurationJSON(metadata)
{
	return parseInt(metadata.durationsec)*1000;
}

/*
 * Judge if the requested resource is a video
 * params:videourl
 */
function isVideo(videourl, callback)
{
	getMetadata(videourl,function(err,metadata){
		if(err != null)
			return callback(err,null);
		
		if(metadata.isVideo === true)
			return callback(null,true);
		else
			return callback(null,false);
	});
}

/*
 * Not event-based function for isVideo
 */
function isVideoJSON(metadata)
{
	return metadata.isVideo;
}
