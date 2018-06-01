'use strict';
var express = require('express');
var app = express();
var bodyparser = require('body-parser');

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

router.get('/', function(req, res){
    res.json({message: 'Helloooo!'});
});

router.post('/register', function(req, res){

});

router.get('/commonstudents', function(req, res){

});

router.get('/retrievefornotifications', function(req, res){

});

router.post('/suspend', function(req, res){

});

app.use('/api', router);

app.listen(port);
console.log("listening on "+port);