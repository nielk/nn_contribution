var express = require("express"),
	app = express(),
	routes = require("./routes"),
	schema = require("./schema"),
	path = require("path");
	expressValidator = require('express-validator');

// Middleware
app.use(express.bodyParser());
app.use(expressValidator());

app.use('/uploads', express.static(__dirname + '/uploads'));

schema.connect("mongodb://localhost/dev");

// Routes
app.get("/", routes.findAllChoses);
app.get("/create", routes.add);
app.post("/create", routes.insertChose);
app.get("/image", function(req,res){
	res.sendfile(path.resolve('app/uploads/picto02.png'));
});



app.listen(9999);

