var fs = require('fs');
var should = require('should');
var Common = require('../lib/common.js');
var log = Common.log,
	restify = Common.restify,
	config = Common.config,
	server = Common.server,
	node_static = Common.node_static,
	utils = Common.utils;
	
var	api = require('../services/api.js'); 
var keys = require('../lib/keys.js').keys;
var ytKey = keys.youtube;
var hosturl = config.http.protocol+"://"+config.http.hostname+":"+config.http.port;
var client = restify.createJsonClient({
    version: '*',
    url: hosturl
});

before(function(done) {
	console.log("start server...");
    api.init();
    done();
});

if(config.api.generateThumbnail == true)
{
	//Do nothing
}

if(config.api.getMetadata == true)
{
	describe('getMetadata',function(){
		it("should get YouTube video metadata",function(done){
			var videourl =encodeURIComponent("http://www.youtube.com/watch?v=WkQjYHx3NY8");
            client.get('/api/getMetadata',{videourl:videourl}, function(err, req, res, data) {
                if (err) {
                    should.not.exist(err);
                }
                else {
                    should.exist(data.id);
                    done();
                }
            });
		});
	});
}

