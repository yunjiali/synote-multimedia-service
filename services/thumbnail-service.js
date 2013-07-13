var Common = require('../lib/common.js');
var log = Common.log,
	config = Common.config,
	utils = Common.utils,
	restify = Common.restify;
	
exports.getThumbnailCount = getThumbnailCount;

/**
 * Get how many thumbnail pictures should be generated
 */
function getThumbnailCount(duration)
{
	var intervals=config.thumbnail.invervals;
	var inverval = 1;
	var count = 0;
	for(var i=0;i<intervals.length;i++)
	{
		if(duration < intervals[i].duration)
		{
			interval = intervals[i].interval;
			break;
		}	
	}
	
	count = Math.floor(duration/interval);
	
	if(count>config.thumbnail.max)
		count = config.thumbnail.max
		
	return count;
}