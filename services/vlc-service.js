var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	spawn = Common.spawn,
	utils = Common.utils;

var vlc_path = config.vlc.path;
log.debug("dirname:"+__dirname);
var thumbnail_root = config.node_static.root+config.thumbnail.root_dir;

exports.generateThumbnail = function(id,videourl,time,callback)
{
	var t = (time-time%1000) / 1000;
	var thumbnail_folder = thumbnail_root+'/'+id;
	var thumbnail_file = 'tn_'+t+'s.png'; 
	var full_path = __dirname+"/../"+thumbnail_folder+"/"+thumbnail_file;
	//We need to make the dir first before save the file
	utils.createFullPath(full_path, function(err){
		if(err != null)
		{
			log.error(err);
			//TODO:throws exception
			return callback(err,null);
		}
		
		var options = [
			   		    videourl,
					    '-I rc',
					    '--video-filter=scene',
					    '--scene-replace',
					    '--scene-height='+config.thumbnail.height,
					    '--scene-width='+config.thumbnail.width,
					    '--vout=dummy',
					    '--start-time='+t, //variable of start and end time
					    '--stop-time='+(t+1),
					    '--scene-ratio='+config.vlc.scene_ratio,
					    '--scene-format=png',
					    '--scene-prefix=tn_'+t+"s", //variable of name
					    '--scene-path='+thumbnail_folder,
					    'vlc://quit'
				];
		log.debug(options);
		var vlc = spawn(vlc_path, options);
		
		vlc.on('exit', function() {
		     log.info('vlc exit');
		});
		
		return callback(null,thumbnail_file);
	});
	
	
	
	//vlc.stdout.on('data', function (data) {
		  //console.log('stdout: ' + data);
	//	  log.info(data);
	//});	
	
	
}
