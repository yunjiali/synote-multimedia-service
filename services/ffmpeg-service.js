var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify;

var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
var Metalib = require('fluent-ffmpeg').Metadata;

var thumbnailService = require('../services/thumbnail-service.js');
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
 * params: id, videourl, time (in milliseconds), the videourl sometimes can be a filepath
 * return: the file name for thumbnail picture
 * 
 */
function generateThumbnail(id,videourl,start,end,callback){
	//convert time to seconds
	
	//TODO:Get the duration and set it a random position within the duration
	getMetadata(videourl, function(err,metadata){
		if(err != null)
			return callback(err);
		
		var isVideo = metadata.metadata.isVideo;
		
		if(isVideo === false)
		{
			var err = new restify.InvalidArgumentError("The requesting resource is not a video!"); //TODO: CustomiseException
			return callback(err);
		}
		
		var duration = metadata.metadata.duration;
		var count = thumbnailService.getThumbnailCount(duration);
		
		var thumbnail_folder = thumbnail_root+'/'+id; // no '/' here!
		
		if(fs.existsSync(thumbnail_folder))
		{
			var files = fs.readdirSync(thumbnail_folder);
			if(files.length>=count) //folder exists already and has enough pictures
			{
				log.debug("Thumbnails have been generated before.");
				return callback(null);
			}
		}
		
		var proc = new ffmpeg({ source: videourl})
			.withSize(thumbnail_size)
			.takeScreenshots({
		      count: count,
		      filename: '%s'
		    }, thumbnail_folder, function(err,filenames) {
		    	if(fs.existsSync(videourl))
		    	{
		    		fs.unlinkSync(videourl);
		    	}
		    	
		    	if(err != null)
		    	{
		    		log.error(err);
					//Do nothing		    		
		    	}
		    	
		    	//create index file
		    	var timesArray = [];
		    	for(var i=0;i<filenames.length;i++)
		    	{
		    		timesArray.push(parseFloat(filenames[i].replace(".jpg","")));
		    	}
		    	
		    	fs.writeFileSync(thumbnail_folder+"/index.json", "["+timesArray+"]");
		    	log.debug("Save "+count+" thumbnails.");
		    	return;		    	
		});
		
		return callback(null);
	});
};

/*
 * Get the metadata of a multimedia resource, not only for video
 * params: videourl, callback(the callback function)
 */
function getMetadata(videourl, callback)
{
	var metaObj = new Metalib(videourl);
	metaObj.get(function(metadata_old,err) {
		log.debug(require('util').inspect(metadata_old, false, null));
		//TODO: how can I make sure ffmpeg can get the metadata?
		if((metadata_old.video.resolution.w === 0 && metadata_old.video.resolution.h === 0) || metadata_old.video.container == "mp3")
			metadata_old.isVideo = false;
		else
			metadata_old.isVideo = true;
		
		//transform to new metadata standard
		var newObj = {};
		newObj.id = null;
		newObj.metadata = {};
		newObj.metadata.title = metadata_old.title;
		newObj.metadata.description = "";
		newObj.metadata.duration = metadata_old.durationsec;
		newObj.metadata.language = null;
		newObj.metadata.creationDate = metadata_old.title.date ;
		newObj.metadata.publicationDate = metadata_old.title.date;
		newObj.metadata.isVideo = metadata_old.isVideo;
		newObj.metadata.thumbnail = null ;
		newObj.metadata.category = {};
		newObj.metadata.category.id = null;
		newObj.metadata.category.label = null;
		newObj.metadata.category.uri=null;
		newObj.statistics = {};
		newObj.statistics.views = null;
		newObj.statistics.comments = null;
		newObj.statistics.favorites = null;
		newObj.statistics.ratings = null;
		
		callback(null,newObj);
	});
}

/*
 * Get the duration of a multimedia resource. 
 * Using fluent-ffmpeg, this information can be obtained using 'durationsec'.
 * The returned duration is in milliseconds
 */
function getDuration(videourl,callback)
{
	getMetadata(videourl,function(err,formalObj){
		if(err != null)
			return callback(err,null);
		if(formalObj.metadata.duration === undefined)
			return callback(new restify.RestError("Cannot get the duration of the resource"),null);
		var duration = parseInt(formalObj.metadata.duration);
		return callback(err,{duration:duration*1000});
	})
}

/*
 * Judge if the requested resource is a video
 * params:videourl
 */
function isVideo(videourl, callback)
{
	var metaObj = new Metalib(videourl);
	metaObj.get(function(err,metadata){
		if(err != null)
			return callback(err,null);
		
		if(metadata.isVideo === true)
			return callback(null,true);
		else
			return callback(null,false);
	});
}

/*
 * Get available subtitle list from the multimedia file
 * callback(err,subtitleList)
 */
exports.getSubtitleList = function(videourl,callback){
 	//temperorily return empty list
 	var sl = {};
 	sl.list = [];
 	callback(null,sl);
}
