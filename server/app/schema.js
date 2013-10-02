var mongoose = require("mongoose");

var connect = function(url) {
	mongoose.connect(url);
	var db = mongoose.connection;
	db.on('error', function(err){
		console.log('error conenction mongodb');
	});
	db.once('open', function callback () {
	  // yay!
	  console.log('sucess connect mongodb');
	});
};


// Schema
var Chose = mongoose.model('Chose',{
	author: String,
	email: String,
	date: Date,
	title: String,
	content: String,
	image: String,
	valid: Boolean
});

module.exports.Chose = Chose;
module.exports.connect = connect;