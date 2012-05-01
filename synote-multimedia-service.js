var http = require('http');

var ffmpeg = require('fluent-ffmpeg');
var ffmpegmeta = require('fluent-ffmpeg').Metadata;
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

console.log("taking pictures ffmpeg");
var proc = new ffmpeg({ source: 'http://synote.org/resource/algore/01/algore.wmv' })
  .withSize('150x100')
  .takeScreenshots({
      count: 1,
      timemarks: [ '20' ]
    }, 'thumbnail', function(err) {
    console.log('screenshots were saved');
  });


var vlcPath = '/Applications/VLC.app/Contents/MacOS/VLC';


console.log("taking pictures vlc");

var vlc = spawn(vlcPath, [
    'http://youtu.be/rsODnEnbtm4',
    '--rate=1',
    '--vout=dummy',
    '--start-time=10',
    '--stop-time=11',
    '--scene-format=png',
    '--scene-ratio=24',
    '--scene-prefix=snap',
    '--scene-path=thumbnail',
    'vlc://quit'
  ]);

vlc.on('exit', function() {
    console.log('vlc exit');
  });

/*There are durationraw attribute in the result json, so we can use it*/
//ffmpegmeta.get('http://synote.org/resource/algore/01/algore.wmv', function(metadata) {
//console.log(require('util').inspect(metadata, false, null));
//});

/*
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
*/