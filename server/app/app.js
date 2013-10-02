var express = require('express'),
	app = express(),
	routes = require('./routes'),
	schema = require('./schema'),
	path = require('path');
	expressValidator = require('express-validator');

// Middleware
app.use(express.bodyParser());
app.use(expressValidator());

// static directory for images uploaded
app.use('/uploads', express.static(__dirname + '/uploads'));

// connection to mongodb
schema.connect('mongodb://localhost/dev');

// Routes
app.get('/', routes.findAllChoses); // index
app.get('/create', routes.add); // Display formulaire to upload image
app.post('/create', routes.insertChose); // get the images

// localhost:9999
app.listen(9999);

