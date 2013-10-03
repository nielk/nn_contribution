var schema   = require('./schema'),
	Chose    = schema.Chose,
	format   = require('util').format,
	fs       = require('fs'),
	crypto   = require('crypto'),
	fs       = require('fs'),
	path     = require('path'),
	minify   = require('./image-minify.js');

/**
 * Form for uploading Chose
 * @param {Object} req - the recieved request
 * @param {Object} res - the request being sent
 */
var add = function (req,res) {
	res.send(
		'<form method="post" enctype="multipart/form-data">' +
			'<p>Auteur: <input type="text" name="author" /></p>' +
			'<p>Email: <input type="text" name="email" /></p>' +
			'<p>Title: <input type="text" name="title" /></p>' +
			'<p>Content: <input type="text" name="content" /></p>' +
			'<p>Image: <input type="file" name="image" /></p>' +
			'<p><input type="submit" value="Upload" /></p>' +
		'</form>', 200);
};

/**
 * Returns a JSON of all Choses (to display on index.html)
 * @param {Object} req - the recieved request
 * @param {Object} res - the request being sent
 */
var findAllChoses = function (req,res) {

	var query = Chose.find(function(err, choses) {
		if(err !== null) {
			console.log('errror : cannot find Chose');
		} else {
			query.select('author title content image');
			query.exec(function (err,choses) {
				if(err !== null) {
					console.log('err : query failed');
				} else {
					console.log('sucess : query');
					res.status(200).send(choses);
				}
			});
		}
	});
};

/**
 * Insert a new Chose
 * @param {Object} req - the recieved request
 * @param {Object} res - the request being sent
 */
var insertChose = function (req, res) {

	// the image uploaded
	var fileImage = req.files.image;
	// generate a hash for image name
	var hash = crypto.createHash('md5').update(fileImage.path).digest('hex');
	// get the extension of image uploaded
	var ext = path.extname(fileImage.path).toLowerCase();
	// new hashed image name
	var imageName = hash + ext;
	// new path of the uploaded image
	var newPath = __dirname + '/uploads/' + imageName;

	// move the uploaded image from temp to uploads directory
	fs.readFile(fileImage.path, function (err, data) {
	  fs.writeFile(newPath, data, function (err) {
	    if (err !== null) {
	    	throw new Error('Error : fs.writeFile...');
	    } else {
	    	// minify the new image in uploads directory
		    minify(newPath, function (err) {
		    	if(err !== null) {
		    		throw new Error('Error : minification failed...');
		    	}
		    });
	    }
	  });
	});

	// check if inputs from formulaire are safe
	if(validationInputs(req,res) === true) {

		// create our chose with verified inputs
		var newChose = new Chose({
			author: req.body.author,
			email: req.body.email,
			date: new Date(),
			title: req.body.title,
			content: req.body.content,
			image: imageName,
			valid: false
		});

		// save in database the newChose
		newChose.save(function (err) {
			if(err) {
				throw new Error('Error : cannot save object Chose');
			} else {
				res.status(201).send('image uploaded');
				// TODO send email to admin to notify a new article to validate
			}
		});
	}
};

/**
 * Check if inputs from formulaire are safe
 * @param {Object} req - the recieved request
 * @param {Object} res - the request being sent
 */
var validationInputs = function (req,res) {

	// sanitize inputs
	req.sanitize('title').escape();
	req.sanitize('content').escape();

	// verify users inputs
	req.assert('author', 'required').notEmpty().len(1,64).isAlpha();
	req.assert('email', 'required').notEmpty().isEmail().len(5,64);
	req.assert('title', 'required').notEmpty().len(1,45);
	req.assert('content', 'required').notEmpty().len(3,300);
	req.assert('image', 'required'); // TODO : validation image

	// catch validation errors
	var errors = req.validationErrors();
	if(errors) {
		res.send('Errors : ' + errors + '\n chose cannot be validated', 403);
		return false;
	} else {
		return true;
	}
}

/**
 * Validate the chose in order t be published
 * @param {Object} req - the recieved request
 * @param {Object} res - the request being sent
 */
var validationChose = function (req,res) {
	if(req.body.valid === true){
		req.chose.valid = true;
		req.chose.save(function(err, chose){
			if(err){
				console.log('err : chose cannot be saved')
			}else {
				console.log('sucess : chose is saved');
			}
		});
	}
}

module.exports.add = add;
module.exports.findAllChoses = findAllChoses;
module.exports.insertChose = insertChose;