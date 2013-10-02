execFile = require('child_process').execFile,
pngquantPath = require('pngquant-bin').path,
jpegtranPath = require('jpegtran-bin').path,
gifsiclePath = require('gifsicle').path,
spawn = require('child_process').spawn,
path = require('path');

var minify = function(imagePath){
	var ext = path.extname(imagePath).toLowerCase();

	if( ext === '.png') {
		execFile(pngquantPath, [imagePath], function (error, stdout, stderr) {
		    console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		        console.log('exec error: ' + error);
		    } else { 
			    console.log('png : Image minified');
			    removeImage(imagePath);
		    }
		});
	} else if( ext === '.jpg' || ext === '.jpeg') {
		execFile(jpegtranPath, ["-outfile", imagePath, imagePath], function(){
			console.log('jpg : Image minified');
		});
	} else if( ext === '.gif') {
		execFile(gifsiclePath, ['-o', imagePath, imagePath], function(){
			console.log('gif : Image minified');
		});
	} else {
		res.send("Image format not supported (we accept png, jpg, and gif)", 400);
	}
};

var removeImage = function(imagePath){
	// remove original image
	    var ls = spawn("rm", ["-r",imagePath]);
	    ls.stdout.on("data", function(data){
	    	console.log("stdout: " + data);
	    });
	    ls.stderr.on("data", function(data){
	    	console.log("stderr: " + data);
	    });
	    ls.on("close", function(code){
	    	console.log("child process exited width code " + code);
	    });
}


module.exports.minify = minify;