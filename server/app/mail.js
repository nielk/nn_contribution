nodemailer = require("nodemailer");

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
 * @param {Object} req - the recieved request
 * @param {Object} res - the request being sent
 */
var sendMail = function(msg, subject, to, res, req) {

	var mailOptions = {
		generateTextFromHTML: true,
		from: "cecinestpasavendre ✔ <cecinestpasavendre@vlipp.fr>", // sender address
		to: to, // list of receivers
		subject: subject, // Subject line
		html: msg // html body
	};

	// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(error, response){
		if(error){
			// res.send('error : cannot send email :\n'+error , 500);
		}else{
			// res.send('Message sent: \n'+response.message , 200);
		}
	});
};

module.exports = sendMail;