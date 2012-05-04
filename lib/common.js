/* including the require of common modules in this file
 * You can always create your own instances of these common variables in each module
 */
var config = require('config').server;
var restify = require('restify');
var Logger  = require('bunyan');
var log_out = process.stdout;
if(config.log.stream !== undefined)
	log_out = config.log.stream;
var log = new Logger({
			name: config.name,
			stream: log_out,
			level:config.log.level});
			//stream:config.log.stream});
var server =  restify.createServer({name:config.name,log:log});
var Common = {
	restify:restify,
	config : config,
	server: server,
	node_static : require('node-static'),
	util : require('util'),
	exec : require('child_process').exec,
	spawn : require('child_process').spawn,
	log	: log
};

module.exports = Common;