var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config;

var ffmpeg = require('fluent-ffmpeg');
var ffmpegmeta = require('fluent-ffmpeg').Metadata;

//the root directory of thumbnail on the disk 
var thumbnail_root = config.node_static.root+config.thumbnail.root_dir;
log.debug(thumbnail_root);
//the size of the thumbnail
var thumbnail_size = config.thumbnail.width+"x"+config.thumbnail.height;

/* generate thumbnail pictures using ffmpeg
 * params: id, videourl, time (in milliseconds) 
 * return: the file name for thumbnail picture
 * 
 * According to the processor.js in ffmpeg, the generated thumbnail file will be at:
 * var target = Meta.escapedPath(folder + '/tn_' + offset + 's.jpg');
 * 
 * There is no callback function in this method, as the waiting for thumbnail generation may take a long time
 */
exports.generateThumbnail = function(id,videourl,time){
	//convert time to seconds
	if(time === -1)
	{
		//TODO:Get the duration and set it a random position within the duration
		time =0 ;
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
	    	//if file is generated successfully, save it to database
	    	
	    	log.info('screenshots were saved as '+ thumbnail_file );
	    	if(err != null)
	    	{
	    		console.log(err);
	    	}
	});
	
	return thumbnail_file;
};

/*
 * Get the metadata of a multimedia resource, not only for video
 * params: videourl, callback(the callback function)
 */
exports.getMetadata = function(videourl, callback)
{
	ffmpegmeta.get(videourl, function(metadata) {
		log.debug(require('util').inspect(metadata, false, null));
		//TODO: how can I make sure ffmpeg cannot get the metadata?
		callback(null,metadata);
	});
};
  
exports.getDuration = function(){}

/*There are durationraw attribute in the result json, so we can use it*/
//ffmpegmeta.get('http://synote.org/resource/algore/01/algore.wmv', function(metadata) {
//console.log(require('util').inspect(metadata, false, null));
//});
