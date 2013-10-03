var express          = require('express'),
	app              = express(),
	routes           = require('./routes'),
	schema           = require('./schema'),
	path             = require('path');
	expressValidator = require('express-validator');

// prod urls and port with dev fallback
var MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/dev';
var PORT = process.env.PORT || 9999;

// middleware
app.use(express.bodyParser());
app.use(expressValidator());

// static directory for uploaded images
app.use('/uploads', express.static(__dirname + '/uploads'));

// connection to mongodb
schema.connect(MONGO_URL);

// routes
app.get('/', routes.findAllChoses); // index
app.get('/create', routes.add); // display formulaire to upload image
app.post('/create', routes.insertChose); // get the images

// start the server
app.listen(PORT);

