//production config for lslvm-yl2.ecs.soton.ac.uk
module.exports= {	
	server:{
		name:"synote-multimedia-service",
		http: {
			protocol:"http",
	    	hostname:"lslvm-yl2.ecs.soton.ac.uk",
	    	port:8000
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
	    	width:120
	    },
	    db:{
	    	
	    },
	    api:{
	    	generateThumbnail:true,
			getMetadata:true,
			getDuration:true,
	        isVideo':true,
			getSubtitleList:true,
			lime13: false,
			metadataShort: false
	    },
	    ffmpeg:{
	    
	    },
	    vlc:{
	    	path:'C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe', //don't forget to change it if it's in Linux
	    	scene_ratio:999999 //we just want one picture, so we set it high
	    },
	    youtube:{
	    	key:"AI39si6aIZMvZqgWXPIrbQ9E42ZgDmT04yF2ByDqzn8jJmHbf5eEKBJfz0HhrZBE5kTb5Yha_5X0_pBtOqCcuBuDMHI9jPcEqg"
	    }
	}
}