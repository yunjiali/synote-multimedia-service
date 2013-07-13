module.exports= {	
	server:{
		name:"synote-multimedia-service",
		http: {
			protocol:"http",
	    	hostname:"localhost",
	    	IP:'127.0.0.1',
	    	port:8888
	    },
	    log:{
	    	level:"debug",
	    	type:"stream"
	    },
	    node_static:{
	    	root:"./static",
	    	cache:600
	    },
	    thumbnail:{
	    	root_dir:"/thumbnail",
	    	height:90,
	    	width:120,
	    	invervals:[ //duration: the length of the video, interval: the time interval to take a thumbnail
	    		{
	    			duration: 60,
	    			interval: 1
	    		},
	    		{
	    			duration: 240,
	    			interval: 2
	    		},
	    		{
	    			duration: 1200,
	    			interval: 4
	    		},
	    		{
	    			duration: 3600,
	    			interval: 30
	    		}
	    	],
	    	max: 300 //maxium number of thumbnails
	    },
	    db:{
	    	
	    },
	    api:{ //which apis are enabled
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
	    vlc:{
	    	path:'/Applications/VLC.app/Contents/MacOS/VLC', //don't forget to change it if it's in Linux
	    	scene_ratio:999999 //we just want one picture, so we set it high
	    },
	    multimedia:
	    {
	    	hostname:true, //if false, we will use IP instead of hostname as the url of the multimedia 
	    	port: true, //include port number in the multimedia url. If it is deployed in production environment, it could be served directly from 80 port
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