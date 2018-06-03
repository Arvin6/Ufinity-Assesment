import express from 'express';

import Teacher from '../../app/models/teacher';
import Student from '../../app/models/student';
import UfinityError from '../../app/models/Customerror';

var router = express.Router()

const validateMail = function(mailId){
    const emailPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
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
        let teacherInstance = await Teacher.findByMail(teacherMail);
        for (const mail of studentsMailList) {
            let studentInstance = await Student.findByMail(mail);
            await teacherInstance.registerStudent(studentInstance)
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
            throw new UfinityError('Field teacher cannot be empty');
        }
        teachersMailList = !(teachersMailList instanceof Array)?Array(teachersMailList):teachersMailList
        for (const mail of teachersMailList){
            if (!mail || !validateMail(mail)){
                throw new UfinityError(`Invalid teacher mail`)
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
            throw new UfinityError(`notification cannot be empty.`)
        }
        if (!teacherMailId || !validateMail(teacherMailId)){
            throw new UfinityError(`Teacher mail is invalid.`)
        }
        // Get promises
        let studentMentions = await Teacher.getMentions(mailText);
        let studentRegistrations = await Teacher.getRegisteredStudents(teacherMailId);
        // Get only unique mails
        let studentEmails = new Set([...studentMentions,...studentRegistrations]);
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
            throw new UfinityError(`Student mail is invalid.`)
        }
        await Teacher.suspendStudent(studentMail);
        return res.status(204).send();
    }catch(error) {
        next(error);
    }
});

module.exports = router;