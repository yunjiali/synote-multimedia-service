//production config for lslvm-yl2.ecs.soton.ac.uk
module.exports= {	
	server:{
		name:"synote-multimedia-service",
		http: {
			protocol:"http",
	    	hostname:"lslvm-yl2.ecs.soton.ac.uk",
	    	IP:'152.78.189.68',
	    	port:80
	    },
	    log:{
	    	level:"debug",
	    	type:"rotating-file",
	    	path:'./logs/bunyan.log',
	    	period:'1d',
	    	count: 256
	    },
	    node_static:{
	    	root:"./static",
	    	cache:600
	    },
	    thumbnail:{
	    	root_dir:"/thumbnail",
	    	height:90,
	    	width:120
	    },
	    db:{
	    	
	    },
	    api:{
	    	generateThumbnail:true,
			getMetadata:true,
			getDuration:true,
	        isVideo:true,
			getSubtitleList:true,
			getSubtitleSRT:true,
			nerdifySRT:true,
			multimediaUpload:true,
			metadataShort: false
	    },
	    ffmpeg:{
	    
	    },
	    multimedia:
	    {
	    	hostname:true, //if false, we will use IP instead of hostname as the url of the multimedia 
	    	port: true, //include port number in the multimedia url. If it is deployed in production environment, it could be served directly from 80 port
	    },
	    vlc:{
	    	path:'C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe', //don't forget to change it if it's in Linux
	    	scene_ratio:999999 //we just want one picture, so we set it high
	    },
	    vidstreamer:{
	    	enabled:true,
	    	settings:{
		    	"mode": "development",
			    "forceDownload": false,
			    "random": false,
			    "rootFolder": "./static/",
			    "rootPath": "",
			    "server": "VidStreamer.js/0.1.4"
			}
	    }
	}
}