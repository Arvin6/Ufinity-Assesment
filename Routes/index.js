import express from 'express';
import teacherRouter from './api/teacher';

var router = express.Router();

router.use('/', teacherRouter);

router.use(function(err, req, res, next){
  if(err.name === 'UfinityError'){
    return res.status(400).json({
      errors: err.message
    });
  }
  return next(err);
});

module.exports = router;