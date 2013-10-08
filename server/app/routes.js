var schema   = require('./schema'),
	Chose    = schema.Chose,
	format   = require('util').format,
	fs       = require('fs'),
	crypto   = require('crypto'),
	fs       = require('fs'),
	path     = require('path'),
	minify   = require('./image-minify.js'),
	nodemailer = require("nodemailer");


var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "cecinestpasavendre@gmail.com",
        pass: "Levlippcestsuper"
    }
});

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
				var mailOptions = {
				    from: "cecinestpasavendre ✔ <cecinestpasavendre@vlipp.fr>", // sender address
				    to: "oger.alexandre@gmail.com", // list of receivers
				    subject: "Nouveau contenu à valider", // Subject line
				    text: "Un nouvel objet à valider a été ajouté !", // plaintext body
				    html: "<b>Hello, un nouvel objet a été ajouté ! cliquer ici pour le valider : <a href=\"http://localhost:9999/valid/"+imageName+"\">cliquer</a></b>" // html body
				}
				// send mail with defined transport object
				smtpTransport.sendMail(mailOptions, function(error, response){
				    if(error){
				        console.log(error);
				    }else{
				        console.log("Message sent: " + response.message);
				    }

				    // if you don't want to use this transport object anymore, uncomment following line
				    //smtpTransport.close(); // shut down the connection pool, no more messages
				});
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
	req.assert('email', 'required').notEmpty().isEmail().len(5,40);
	req.assert('title', 'required').notEmpty().len(1,30);
	req.assert('content', 'required').notEmpty().len(10,300);
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
	var imageName = req.params.imageName;
	console.log(imageName);

	var query = { image: imageName };
	
	console.log('query : '+query);

	Chose.findOneAndUpdate(query, { valid: true }, function(err){
		if(err){
			res.send('L\'Objet n\'a pas été validé !', 403);
		} else {
			console.log("chose validated !!");
	  		res.send('Objet validé !', 200);
		}
	});

	// Chose.findOne({ image: imageName }, function (err, doc) {
	//   if (err) {
	//   	res.send('L\'Objet n\'a pas été validé !', 403);
	//   }else{
	//   doc.valid = true;
	//   doc.save(function(err){
	//   	if(err) {
	//   		res.send('L\'Objet n\'a pas été validé !', 403);
	//   	}
	//   	console.log("chose validated !!");
	//   	res.send('Objet validé !', 200);
	//   });
	  
	//   }
	// });
	
}

module.exports.validationChose = validationChose;
module.exports.findAllChoses = findAllChoses;
module.exports.insertChose = insertChose;