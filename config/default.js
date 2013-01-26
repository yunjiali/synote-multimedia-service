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
	    	
	    },
	    ffmpeg:{
	    
	    },
	    vlc:{
	    	path:'/Applications/VLC.app/Contents/MacOS/VLC', //don't forget to change it if it's in Linux
	    	scene_ratio:999999 //we just want one picture, so we set it high
	    },
	    youtube:{
	    	//key:"AI39si6aIZMvZqgWXPIrbQ9E42ZgDmT04yF2ByDqzn8jJmHbf5eEKBJfz0HhrZBE5kTb5Yha_5X0_pBtOqCcuBuDMHI9jPcEqg"
	    	key:"AIzaSyBw5KaKPmZIzqVYB3O0BfwPY3BeCWuX6Dw"
	    }
	}
}