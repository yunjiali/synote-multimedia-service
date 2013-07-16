var fs = require('fs');
var should = require('should');
var Common = require('../lib/common.js');
var log = Common.log,
	restify = Common.restify,
	config = Common.config,
	node_static = Common.node_static,
	utils = Common.utils;
	
var keys = require('../lib/keys.js').keys;
var ytKey = keys.youtube;

require('../synote-multimedia-service.js');

var http = require('http');
var hosturl = config.http.protocol+"://"+config.http.hostname+":"+config.http.port;
var client = restify.createJsonClient({
    version: '*',
    url: 'http://127.0.0.1:8888/'
});

//before(function(done) {
//	console.log("start server "+hosturl+"...");
 //   done();
//});


if(config.api.generateThumbnail == true)
{
	describe('API generateThumbnail mp4',function(){
		it("Generate thumbnail pictures for a given mp4 file",function(done){
			var videourl = encodeURIComponent("http://synote.org/resource/yunjiali/bigbuck.mp4");
            client.get('/api/generateThumbnail?videourl='+videourl+'&id=1234567890mp4', function(err, req, res, data) {
                if (err) {
                    should.not.exist(err);
                }
                else {
                    res.statusCode.should.equal(200);
                    should.exist(data);
                    done();
                }
            });
		});
	});
	
	describe('API generateThumbnail YouTube',function(){
		it("Generate thumbnail pictures for a YouTube video",function(done){
			var videourl = "http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DWkQjYHx3NY8";
            client.get('/api/generateThumbnail?videourl='+videourl+'&id=098765431youtube', function(err, req, res, data) {
                if (err) {
                    should.not.exist(err);
                }
                else {
                    res.statusCode.should.equal(200);
                    done();
                }
            });
		});
	});
	
	describe('API generateThumbnail Dailymotion',function(){
		it("Generate thumbnail pictures for a Dailymotion video",function(done){
			var videourl = encodeURIComponent("http://www.dailymotion.com/video/x111zzq_snorting-souls-is-hard-to-do-the-gate_fun");
            client.get('/api/generateThumbnail?videourl='+videourl+'&id=098765431dailymotion', function(err, req, res, data) {
                if (err) {
                    should.not.exist(err);
                }
                else {
                    res.statusCode.should.equal(200);
                    done();
                }
            });
		});
	});
}

if(config.api.getMetadata == true)
{
	describe('getMetadata',function(){
		it("should get YouTube video metadata",function(done){
			var videourl =encodeURIComponent("http://www.youtube.com/watch?v=WkQjYHx3NY8");
            client.get('/api/getMetadata?videourl='+videourl,function(err, req, res, data) {
                if (err) {
                    should.not.exist(err);
                }
                else {
                    data.id.should.equal('WkQjYHx3NY8');
                    done();
                }
            });
		});
	});
}

