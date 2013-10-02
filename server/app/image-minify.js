var pngquantPath = require("pngquant-bin").path,
jpegtranPath = require("jpegtran-bin").path,
gifsiclePath = require("gifsicle").path,
execFile = require("child_process").execFile,
spawn = require("child_process").spawn,
path = require("path");

var minify = function(imagePath, callback){

	var ext = path.extname(imagePath).toLowerCase();

	if( ext === ".png" ) {
		execFile(pngquantPath, ["--force", "--ext", ".png", imagePath], function() {
			callback(imagePath);
		});
	} else if( ext === ".jpg" || ext === ".jpeg") {
		execFile(jpegtranPath, ["-outfile", imagePath, imagePath], function(){
			callback(imagePath);
		});
	} else if( ext === ".gif") {
		execFile(gifsiclePath, ["-o", imagePath, imagePath], function(){
			callback(imagePath);
		});
	} else {
		res.send("Image format not supported (format accepted : png, jpg, and gif)", 400);
	}
};

module.exports.minify = minify;