module.exports= {	
	server:{
		name:"synote-multimedia-service",
		http: {
			protocol:"http",
	    	hostname:"localhost",
	    	port:8888
	    },
	    log:{
	    	level:"debug",
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
	    	
	    },
	    ffmpeg:{
	    
	    },
	    vlc:{
	    
	    }
	}
}