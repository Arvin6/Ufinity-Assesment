import express from 'express';

import Teacher from '../../app/models/teacher';
import Student from '../../app/models/student';
import UfinityError from '../../app/models/Customerror';

var router = express.Router()

const validateMail = function(mailId){
    const emailPattern = /[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/g;
    return emailPattern.test(mailId);
}

router.post('/register',async function(req, res, next){
    let teacherMail = req.body.teacher;
    let studentsMailList = req.body.students;
    try {
        if (!(studentsMailList instanceof Array)) {
            throw new UfinityError('Expected an array of students.')
        }
        if (!validateMail(teacherMail)){
            throw new UfinityError(`Invalid mail format ${teacherMail}`)
        }
        for (const mail of studentsMailList){
            if (!mail || !validateMail(mail)){
                throw new UfinityError(`Invalid mail format ${mail || null}`)
            }
        }
        let teacherInstance = await Teacher.getInstance(teacherMail);
        let existingRegistration = [];
        for (const mail of studentsMailList) {
            let result = await teacherInstance.registerStudent(mail)
            if (result === 0){
                existingRegistration
                    .push( `Student ${mail} is already registered to ${teacherMail}`);
            }
        }
        if (existingRegistration.length > 0){
            return res.status(200).send({'ignored':existingRegistration});
        }
        return res.status(204).send()
    }
    catch(error){
        
        return next(error)
    }
});

router.get('/commonstudents',async function(req, res, next){
    let teachersMailList = req.query.teacher
    try{
        //Sanitize input
        if (!teachersMailList){
            throw new UfinityError('Field teacher cannot be empty.');
        }
        teachersMailList = !(teachersMailList instanceof Array)
                                    ?Array(teachersMailList)
                                                :teachersMailList
        for (const mail of teachersMailList){
            if (!mail || !validateMail(mail)){
                throw new UfinityError(`Teacher mail ${mail} is invalid.`)
            }
        }
        let studentList = await Teacher.findCommonStudents(teachersMailList);
        return res.status(200).json({'students':studentList});
    } catch (error) {
        next(error);
    }
});

router.post('/retrievefornotifications', async function(req, res, next) {
    let teacherMailId = req.body.teacher;
    let mailText =  req.body.notification;
    
    try {
        if (!mailText){
            throw new UfinityError(`Notification cannot be empty.`)
        }
        if (!teacherMailId || !validateMail(teacherMailId)){
            throw new UfinityError(`Teacher mail ${teacherMailId} is invalid.`)
        }
        let studentEmails = await Teacher.getNotificationList(mailText, teacherMailId);
        return res.status(200).send(
            {'recipients' : studentEmails}
        );
    }
    catch(error){
        next(error);
    }
});

router.post('/suspend',async function(req, res, next) {
    let studentMail = req.body.student;
    try {
        if (!studentMail || !(typeof(studentMail) === 'string') || !validateMail(studentMail)){
            throw new UfinityError(`Student mail ${studentMail} is invalid.`)
        }
        await Teacher.suspendStudent(studentMail);
        return res.status(200).send(
            {"message": `Suspended ${studentMail}`}
        );
    }catch(error) {
        next(error);
    }
});

module.exports = router;