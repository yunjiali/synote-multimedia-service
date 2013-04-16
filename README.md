synote-multimedia-service
==========================
This programme will provide the following services for Synote. But it could also been used by other applications through the apis provided
by this service

Generate thumbnail pictures for video resources. All the resources will be accessible through URL on the server.

* RESTful APIs to generate thumbnail pictures from online multimedia resources, including video resources from Youtube
* Host the thumbnail pictures
* RESTful APIs get the metadata of the audio or video resources 
* RESTful APIs get the duration of the audio or video resources
* RESTful APIs to get if a resource is video or audio     

Up coming features:

* Get caption from youtube
* Get technology description of the multimedia resources, such as framerate, bitrate, etc.
* Automatic returning the title and description for YouTube video
* And other secret functions :=)

Server Setup
----------
See https://github.com/yunjiali/synote-multimedia-service/wiki/Server-setup

Other applications used in this service
----------
* ffmpeg
* vlc, VideoLAN
* node-fluent-ffmpeg https://github.com/schaermu/node-fluent-ffmpeg

Versioning
----------

Synote is maintained under the Semantic Versioning, so the version will be numbered in following format:

`<major>.<minor>.<patch>`

For more information on SemVer, please visit http://semver.org/.


Authors
-------

**Yunjia Li (Leading Developer)**

+ http://www.ecs.soton.ac.uk/people/yl2
+ http://afterglowlee.blogspot.com

**Dr Mike Wald (Pinciple Investigator)**

+ http://www.ecs.soton.ac.uk/people/mw

**E.A. Draffan (Project Manager)**

+ http://www.ecs.soton.ac.uk/people/ead

Copyright
---------------------
This application is protected under Modified BSD License     

Copyright 2012 University of Southampton.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    Neither the name of the University of Southampton nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

