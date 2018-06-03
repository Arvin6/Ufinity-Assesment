import {_} from 'lodash';
import db from '../db';
import schemas from '../config/schema';
import config from '../config/config';

import UfinityError from './Customerror';
import Student from './student';
import Registration from './register';

export default class Teacher {
    constructor(data) {
        this.data = this.clean(data);
    }

    clean(data) {
        // Sanitize data
        data = data || {};
        let schema = schemas.teachers;
        return _.pick(_.defaults(data, schema), _.keys(schema));
    }

    static async suspendStudent(studentMail) {
        let studentInstance = await Student.findByMail(studentMail)
        if (studentInstance.data[schemas.students.isSuspended]){
            throw new UfinityError(`${studentMail} is already suspended.`);
        }
        return studentInstance.suspend(true);
    }

    static findByMail(mailId) {
        // Returns a teacher object
        return new Promise((resolve, reject)=>{
            let db_cn = new db();
            db_cn.findByAttribute(config.tables.teacher, schemas.teachers.mail)
                .execute([mailId], (err, data) =>{
                    if (err) {
                        return reject(err)
                    }
                    if (data.length < 1) {
                        return reject(new UfinityError('Teacher '+mailId+' does not exist.'));
                    }
                    let teacherInstance = new Teacher(data[0])
                    resolve(teacherInstance);
                })
            });
    }

    static async getMentions(mailText){
        let studentEmails = [];
        // Split and check
        let words = mailText.split(' ')
        for(const word of words) {
            let pattern = /^@[a-zA-z0-9]+@[a-zA-Z0-9]+\.[A-Za-z0-9]+/g;
            let match = pattern.exec(word);
            if (match) {
                let sanitizedMail = match[0].slice(1);
                try{
                    let studentInstance = await Student.findByMail(sanitizedMail);                    
                    if (!studentInstance.isSuspended){
                        studentEmails.push(sanitizedMail);
                    }
                }catch(error){
                    // console.log(error);
                }
            }
        }
        return studentEmails;
    }

    registerStudent(student) {
        // teacher is a Teacher instance
        let regData = {}
        let registration = schemas.registration;
        regData[registration.teacher_id] = this.data[schemas.teachers.id];
        regData[registration.student_id] = student.data[schemas.students.id];
        return new Registration(regData).register();
    }

    static async getNotificationList(mailText, teacherMailId){
        let studentMentions = await Teacher.getMentions(mailText);
        let Registrations = await Teacher.getRegisteredStudents(teacherMailId);
        return _.union(studentMentions, Registrations);
    }

    static async getRegisteredStudents(teacherEmail) {
        await Teacher.findByMail(teacherEmail);        
        let students = await Registration.getRegisteredStudents(teacherEmail);
        // Object to array
        students = _.map(students, _.property(schemas.students.mail));
        return students;
    }

    static async findCommonStudents(teachersMailList) {
        let registeredListPromise = []
        for (const mail of teachersMailList){
            // Push promises to list
            registeredListPromise.push(Teacher.getRegisteredStudents(mail));
        }
        let registeredList = await Promise.all([...registeredListPromise])
        return _.intersectionWith(...registeredList, _.isEqual);
    }
}