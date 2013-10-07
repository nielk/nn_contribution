var pngquantPath = require('pngquant-bin').path,
	jpegtranPath = require('jpegtran-bin').path,
	gifsiclePath = require('gifsicle').path,
	execFile     = require('child_process').execFile,
	path         = require('path');

/**
 * Minify an image, it accepts png, jpg and gif.
 * @param {String} imagePath - path of the image
 * @param {function()} callback - the arg of the callback is an Error object
 */
var minify = function(imagePath, callback){

	var ext = path.extname(imagePath).toLowerCase();

	

	// if (ext === '.png') {
	// 	execFile(pngquantPath, ['--force', '--ext', '.png', imagePath], function(err) {
	// 		if (callback && typeof(callback) === 'function') {
	// 			callback(err);
	// 		}
	// 	});
	// } else if (ext === '.jpg' || ext === '.jpeg') {
	// 	execFile(jpegtranPath, ['-outfile', 'min'+imagePath, imagePath], function(err) {
	// 		if (callback && typeof(callback) === 'function') {
	// 			callback(err);
	// 		}
	// 	});
	// } else if (ext === '.gif') {
	// 	execFile(gifsiclePath, ['-o', imagePath, imagePath], function(err) {
	// 		if (callback && typeof(callback) === 'function') {
	// 			callback(err);
	// 		}
	// 	});
	// } else {
	// 	if (callback && typeof(callback) === 'function') {
	// 			callback(new Error('Image format not supported (accepted formats: png, jpg and gif)'));
	// 	}
	// }
};

module.exports = minify;