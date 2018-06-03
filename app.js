'use strict';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import errorhandler from 'errorhandler';

import apiRoute from './Routes'
var app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use('/api', apiRoute);

app.get('/', function(req, res, next){
    return res.json({message: 'Ufinity Assesment API!'});
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });  

// For Prod
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({'errors': {
    message: err.message,
    error: {}
    }});
});

if (process.env.NODE_ENV === 'DEV') {
// For dev
    app.use(morgan('dev'));    
    app.use(errorhandler())
    app.use(function(err, req, res, next) {
        console.log(err.stack);
        res.status(err.status || 500);
        res.json({'errors': {
            message: err.message,
            error: err
        }});
    });
}

module.exports = app;