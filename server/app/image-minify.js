var pngquantPath = require('pngquant-bin').path,
	jpegtranPath = require('jpegtran-bin').path,
	gifsiclePath = require('gifsicle').path,
	execFile     = require('child_process').execFile,
	spawn        = require('child_process').spawn,
	path         = require('path');


var minify = function(imagePath, callback){

	var ext = path.extname(imagePath).toLowerCase();

	if ( ext === '.png' ) {
		execFile(pngquantPath, ['--force', '--ext', '.png', imagePath], function(err) {
			if ( callback && typeof(callback) === 'function' ) {
				callback(err);
			}
		});
	} else if ( ext === '.jpg' || ext === '.jpeg' ) {
		execFile(jpegtranPath, ['-outfile', imagePath, imagePath], function(err) {
			if ( callback && typeof(callback) === 'function' ) {
				callback(err);
			}
		});
	} else if ( ext === '.gif' ) {
		execFile(gifsiclePath, ['-o', imagePath, imagePath], function(err) {
			if ( callback && typeof(callback) === 'function' ) {
				callback(err);
			}
		});
	} else {
		if ( callback && typeof(callback) === 'function' ) {
				callback(new Error('Image format not supported (accepted formats: png, jpgn and gif)'));
		}
	}
};

module.exports.minify = minify;