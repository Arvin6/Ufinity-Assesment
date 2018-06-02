'use strict';

var express = require('express');
var app = express();

import TeacherRoute from './Routes/teacher'

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use('/api', TeacherRoute);

app.get('/', function(req, res){
    return res.json({message: 'Ufinity API!'});
});


module.exports = app;