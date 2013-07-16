/**
 * Download various files
 */
 
var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify;

var youtubedl=require('youtube-dl');
	
exports.downloadYouTubeVideo = downloadYouTubeVideo;

/**
 * Download YouTube video quality 17
 * callback(err, downloaded_full_filename)
 */
function downloadYouTubeVideo(videourl, callback)
{
	var path = config.download.root;
	var max_quality = config.download.youtube.max_quality;
	var dl = youtubedl.download(videourl, path, ['--max-quality='+max_quality,'--auto-number']);
	
	// will be called during download progress of a video
	dl.on('progress', function(data) {
	  	process.stdout.write(data.eta + ' ' + data.percent + '% at ' + data.speed + '\r');
	});
	
	// catches any errors
	dl.on('error', function(err) {
	  	callback(err,null);
	});
	
	// called when youtube-dl finishes
	dl.on('end', function(data) {
	  	log.debug('\nDownload YouTube video '+data.filename+' finished!');
	  	callback(null, path+"/"+data.filename);
	});
}

/**
 * Download Dailymotion video
 * callback(err, downloaded_full_filename)
 */
function downloadDailymotionVideo(videourl, callback)
{
	var path = config.download.root;
	var dl = youtubedl.download(videourl,path, ['--auto-number']);
	
	// will be called during download progress of a video
	dl.on('progress', function(data) {
	  	process.stdout.write(data.eta + ' ' + data.percent + '% at ' + data.speed + '\r');
	});
	
	// catches any errors
	dl.on('error', function(err) {
	  	callback(err,null);
	});
	
	// called when youtube-dl finishes
	dl.on('end', function(data) {
	  	log.debug('\nDownload Dailymotion Video'+data.filename+' finished!');
	  	callback(null, path+"/"+data.filename);
	});
}
