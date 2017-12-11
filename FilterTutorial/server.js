var express = require('express');
var app = express();

/* Static folders so there's no CORS Restriction */
app.use(express.static('web'));
app.use(express.static('node_modules/jquery/dist'));
app.use(express.static('node_modules/material-design-lite/dist'));

app.listen(3000, function () {
	console.log('Listening at http://localhost:3000/');
})
