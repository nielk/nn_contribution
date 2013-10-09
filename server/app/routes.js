var schema   = require('./schema'),
	Chose    = schema.Chose,
	format   = require('util').format,
	fs       = require('fs'),
	crypto   = require('crypto'),
	fs       = require('fs'),
	path     = require('path'),
	minify   = require('./image-minify.js'),
	nodemailer = require("nodemailer");

// address mail of moderator
var moderator = "oger.alexandre@gmail.com";

// mail settings
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "cecinestpasavendre@gmail.com",
        pass: "Levlippcestsuper"
    }
});

/**
 * Send an email from moderator
 * @param {String} Msg - HTML content of the mail
 * @param {String} Subject - Subject of the mail
 * @param {String} To - receiver of the mail
 */
var sendEmail = function(Msg, Subject, To) {

	var mailOptions = {
		generateTextFromHTML: true,
		from: "cecinestpasavendre ✔ <cecinestpasavendre@vlipp.fr>", // sender address
		to: To, // list of receivers
		subject: Subject, // Subject line
		html: Msg // html body
	};

	// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(error, response){
		if(error){
			console.log(error);
		}else{
		console.log("Message sent: " + response.message);
		}
	});
};

// this is the key will be sent in email link
// the password allow only receivers of moderation email
// to acces to the validation page
// so nobody can acces to the validation page without
// the password in params url
var password = 'Levlippcestsuper';

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
			// select only validated chose
			query.select('author title content image date').where('valid',true);
			query.exec(function (err,choses) {
				if(err !== null) {
					console.log('err : query failed');
				} else {
					console.log('sucess : query');
					// send the JSON of choses to client
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

				// send an email to the moderator
				var Msg = "<b>Hello, un nouvel objet a été ajouté ! cliquer ici pour le valider : "+
					"<a href=\"http://localhost:9999/valid/"+imageName+"/"+password+"\">cliquer</a></b>",
					Subject = "Nouveau contenu à valider",
					To = moderator;

				sendEmail(Msg, Subject, To);

				// send an email to the contributor
				Msg = "Bonjour ! L'objet que vous venez de poster sur <a href='http://cecinestpasavendre.vlipp.fr'>"+
					"http://cecinestpasavendre.vlipp.fr</a> est en cours de validation. Vous receverez"+
					" un email lorsqu'il sera validé.";
				Subject = "Votre objet est en cours de validation";
				To = req.body.email;

				sendEmail(Msg, Subject, To);
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
	req.sanitize('author').escape();

	// verify users inputs
	req.assert('author', 'required').notEmpty().len(1,64);
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
};

/**
 * Allow you to modify a chose submitted in order to be published
 * @param {Object} req - the recieved request
 * @param {Object} res - the request being sent
 */
var validationChose = function (req,res) {

	// get the password params from url
	var pwd = req.params.pwd;

	// can't acces to the page if password is wrong
	if(pwd === password) {

		// get the imageName var from params url
		var imageName = req.params.imageName;
		console.log(imageName);

		// select the objet who match with the imageName
		var query = { image: imageName };
		
		console.log('query : '+query);

		// send a formulaire with contents of the chose
		Chose.findOne(query, function(err, chose) {
			res.send('<form method="post" action="/UpdateChose/'+imageName+'/'+pwd+'">'+
					'<input type="text" name="author" value="'+chose.author+'">'+
					'<input type="text" name="email" value="'+chose.email+'">'+
					'<input type="text" name="title" value="'+chose.title+'">'+
					'<input type="text" name="content" value="'+chose.content+'">'+
					'Supprimer : <input type="checkbox" name="deleted">'+
					'<img src="../../uploads/'+chose.image+'">'+
					'<input type="submit" value="Valider" onclick="" ></form>',200);
		});

	} else  { // pasword wrong
		res.send('Permission refusé', 403);
	}
};	

/**
 * Update the new validated chose
 * @param {Object} req - the recieved request
 * @param {Object} res - the request being sent
 */
var updateChose = function(req,res) {

	// get the password params from url
	var pwd = req.params.pwd;

	// can't acces to the page if password is wrong
	if(pwd === password) {

		console.log(req);

		// get the imageName var from params url
		var imageName = req.params.imageName;
		console.log(imageName);

		// select the objet who match with the imageName
		var query = { image: imageName };
		
		console.log('query : '+query);

		// find the current chose in db
		Chose.findOne(query, function(err, chose){
			if(err){
				res.send('L\'Objet n\'a pas été validé !', 403);
			} else {
				// if checbox 'supprimer' checked then
				if(req.body.deleted === 'on') { 
						// delete the current chose
						chose.remove(function(err){ 
							if(err) {
								res.send('l\'objet n\'a pas été supprimé ! :( \n'+err,403);
							}
							res.send('l\'objet a bien été supprimé !',200);
						});
				} else {
					
					// update the fields of the chose 
					// with the eventual new contents...
					chose.author = req.body.author;
					chose.email = req.body.email;
					chose.title = req.body.title;
					chose.content = req.body.content;
					chose.image = imageName;
					// set the chose validated
					chose.valid = true;
					
					// save the new updated content of the chose
					chose.save(function(err){

						console.log("chose validated !!");
						res.send('Objet validé !', 200);

						// send email to contributor to notify the new validated content
						var Msg = "Bonjour ! L'objet que vous avez poster sur <a href='http://cecinestpasavendre.vlipp.fr'>"+
							"http://cecinestpasavendre.vlipp.fr</a> a été validé ! Vous pouvez le consulter sur "+
							"cette page : <a href='http://cecinestpasavendre.vlipp.fr/contrib.html'>"+
							"http://cecinestpasavendre.vlipp.fr/contrib.html</a>",
							Subject = "Votre objet a été validé",
							To = req.body.email;

						sendEmail(Msg, Subject, To);

					});
				}
			}
		});
	} else {
		res.send('Permission refusé', 403);
	}
};

module.exports.updateChose = updateChose;
module.exports.validationChose = validationChose;
module.exports.findAllChoses = findAllChoses;
module.exports.insertChose = insertChose;