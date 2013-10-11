var pngquantPath = require('pngquant-bin').path,
	jpegtranPath = require('jpegtran-bin').path,
	imageMagick  = require('imagemagick'),
	execFile     = require('child_process').execFile,
	path         = require('path'),
	fs           = require('fs');

/**
 * Minify an image, it accepts png, jpg and gif.
 * @param {String} imagePath - path of the image
 * @param {function()} callback - the arg of the callback is an Error object
 */
var minify = function(imagePath, callback){

	// is the image file exists ?
	fs.stat(imagePath, function(err, stat) {
		if(err === null) { // file exists
			// extension image (png, jpg etc...)
			var ext = path.extname(imagePath).toLowerCase();

			switch (ext) {
				case '.png':
					// resize dimension of image
					imageMagick.convert([imagePath, '-resize', '500x420', imagePath], function(err) {
						// optimize image
						execFile(pngquantPath, ['--force', '--ext', '.png', imagePath], function(err) {
							if(err !== null) {
								cb(err);
							} else {
								cb();
							}
						});
					});
					break;

				case '.jpg':
				case '.jpeg':
					// resize dimension of image
					imageMagick.convert([imagePath, '-resize', '500x420', imagePath], function(err) {
						// optimize image
						execFile(jpegtranPath, ['-outfile', imagePath, imagePath], function(err) {
							if(err !== null) {
								cb(err);
							} else {
								cb();
							}
						});
					});
					break;
				// image extension not allowed
				default:
					if(err !== null) {
						cb(err, 'Image format not supported (accepted formats: png, jpg)');
					} else {
						cb(new Error(), 'Image format not supported (accepted formats: png, jpg)');
					}
			}		
		} else if(err.code == 'ENOENT') { // file doesn't exist
			if(err !== null) {
					cb(err, 'Command failed:   error: cannot open lostImage.png for reading\n');
				} else {
					cb();
				}
		} else { // another type of error
			if(err !== null) {
					cb(err);
				} else {
					cb();
				}
		}
	});
	
	// callback
	var cb = function(err, msg){
		if (callback && typeof(callback) === 'function' && err !== null) {
			callback(new Error(msg));
		} else {
			callback();
		}
	};
};

module.exports = minify;