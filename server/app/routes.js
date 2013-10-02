var schema = require("./schema"),
	Chose = schema.Chose,
	format = require('util').format,
	fs = require('fs'),
	crypto = require("crypto"),
	fs = require("fs"),
	path = require("path"),
	imageMin = require("./image-minify.js");


var add = function(req,res){
	res.send('<form method="post" enctype="multipart/form-data">'
	+ '<p>Auteur: <input type="text" name="author" /></p>'
	+ '<p>Email: <input type="text" name="email" /></p>'
    + '<p>Title: <input type="text" name="title" /></p>'
    + '<p>Content: <input type="text" name="content" /></p>'
    + '<p>Image: <input type="file" name="image" /></p>'
    + '<p><input type="submit" value="Upload" /></p>'
    + '</form>', 200);
};

var findAllChoses = function(req,res){

	var query = Chose.find(function(err, choses){
		if(err) {
			console.log("errror : cannot find Chose");
		} else {
			query.select('author title content image');
			query.exec(function(err,choses){
				if(err) {
					console.log("err : query failed");
				} else {
					console.log("sucess : query");
					res.status(200).send(choses);
				}
			});
		}
	});
	
};

var insertChose = function(req, res){
	fileImage = req.files.image;
	console.log(pngquantPath);

	// Creates Hash
	var hash = crypto.createHash("md5")
	.update(fileImage.path)
	.digest("hex");
	console.log(hash);

	var ext = path.extname(fileImage.path).toLowerCase();

	// Moving image into /uploads/
	fs.readFile(fileImage.path, function (err, data) {
	  var newPath = __dirname + "/uploads/" + hash + ext;
	  fs.writeFile(newPath, data, function (err) {
	    console.log("moved file");
	    console.log(newPath);
	    imageMin.minify(newPath);
	  });
	});

	if(validationInputs(req,res) === true) {
		// Creates a new Chose Object
		var newChose = new Chose({
			author: req.body.author,
			email: req.body.email,
			date: new Date(),
			title: req.body.title,
			content: req.body.content,
			image: "./app/uploads/"+hash+"-fs8"+ext,
			valid: false
		});

		// Save the new Chose Object
		newChose.save(function(err) {
			if(err) {
				console.log("erreur : "+err.message);
			} else {
			console.log("sucess");
			res.status(201).send("image uploaded");
			// TODO send email to admin to notify a new article to validate
			}
		});
	}
	
};

var removeImage = function(ext,hash){
	// remove original image
	    var ls = spawn("rm", ["-r","app/uploads/"+hash+ext]);
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

var validationInputs = function(req,res){
	//Sanitize inputs
	req.sanitize('title').escape();
	req.sanitize('content').escape();

	// Verify users inputs
	req.assert("author", "required").notEmpty().len(1,64).isAlpha();
	req.assert("email", "required").notEmpty().isEmail().len(5,64);
	req.assert("title", "required").notEmpty().len(1,45);
	req.assert("content", "required").notEmpty().len(3,300);
	req.assert("image", "required"); // TODO : validation image

	// catch validation errors
	var errors = req.validationErrors();
	if(errors) {
		res.send('Erreurs : ' + errors + "\n chose cannot be validated", 403);
		return false;
	} else {
		return true;
	}
}

// TODO 
var validationChose = function(req,res){
	if(req.body.valid === true){
		req.chose.valid = true;
		req.chose.save(function(err, chose){
			if(err){
				console.log("err : chose cannot be saved")
			}else {
				console.log("sucess : chose is saved");
			}
		})
	}
}

module.exports.add = add;
module.exports.findAllChoses = findAllChoses;
module.exports.insertChose = insertChose;