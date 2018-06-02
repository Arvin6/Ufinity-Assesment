import express from 'express';

import Teacher from '../app/models/teacher';
import Student from '../app/models/student';

var router = express.Router()

router.post('/register',async function(req, res){
    let teacherMail = req.body.teacher;
    let studentsMailList = req.body.students;
    let students = []
    try {
        let teacherInstance = await Teacher.findByMail(teacherMail);
        for (const mail of studentsMailList) {
            let studentInstance = await Student.findByMail(mail);
            await teacherInstance.registerStudent(studentInstance)
        }
        return res.status(201).send()
    }
    catch(error){
        console.log(error);
        return res.status(400).send({'error':error});
    }
});

router.get('/commonstudents',async function(req, res){
    let teachersMailList = req.query.teacher
    let studentList = await Teacher.findCommonStudents(teachersMailList)
    return res.status(200).send(studentList);
});

router.post('/retrievefornotifications', async function(req, res, next) {
    let teacherMailId = req.body.teacher;
    let mailText =  req.body.notification;
    
    try{
        let studentMentions = await new Teacher().getMentions(mailText);
        let studentRegistrations = await Teacher.getRegisteredStudents(teacherMailId);
        let studentEmails = new Set([...studentMentions,...studentRegistrations]);
        return res.status(200).send(
            {'recipients' : studentEmails}
        );
    }
    catch(error){
        console.log(error);
        return res.status(400).send(error)
    }
});

router.post('/suspend',async function(req, res){
    let studentMail = req.body.student;
    try {
        await Teacher.suspendStudent(studentMail);
        return res.status(204).send();
    }catch(error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

module.exports = router;