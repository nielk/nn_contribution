var pngquantPath = require('pngquant-bin').path,
	jpegtranPath = require('jpegtran-bin').path,
	gifsiclePath = require('gifsicle').path,
	imageMagick = require('imagemagick'),
	execFile     = require('child_process').execFile,
	path         = require('path');

/**
 * Minify an image, it accepts png, jpg and gif.
 * @param {String} imagePath - path of the image
 * @param {function()} callback - the arg of the callback is an Error object
 */
var minify = function(imagePath, callback){

	var ext = path.extname(imagePath).toLowerCase();

	// resize image
	imageMagick.convert([imagePath, '-resize', '500x420', imagePath], function(err, stdout){
		if(err) throw err;
		console.log('stdout: ', stdout);

		if (ext === '.png') {
		execFile(pngquantPath, ['--force', '--ext', '.png', imagePath], function(err) {
			if (callback && typeof(callback) === 'function') {
				callback(err);
			}
		});
		} else if (ext === '.jpg' || ext === '.jpeg') {
			execFile(jpegtranPath, ['-outfile', imagePath, imagePath], function(err) {
				if (callback && typeof(callback) === 'function') {
					callback(err);
				}
			});
		} else if (ext === '.gif') {
			execFile(gifsiclePath, ['-o', imagePath, imagePath], function(err) {
				if (callback && typeof(callback) === 'function') {
					callback(err);
				}
			});
		} else {
			if (callback && typeof(callback) === 'function') {
					callback(new Error('Image format not supported (accepted formats: png, jpg and gif)'));
			}
		}
		
	});

	
};

module.exports = minify;