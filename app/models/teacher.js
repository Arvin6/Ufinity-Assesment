import {_} from 'lodash'
import db from '../db'
import schemas from '../schema'
import config from '../config'
import Student from './student'
import Registration from './register'

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
        console.log(studentInstance);
        if (studentInstance.data[schemas.students.isSuspended]){
            throw `${studentMail} is already suspended.`
        }
        return studentInstance.suspend()
    }

    static async findByMail(mailId) {
        // Returns a teacher object
        return await new Promise((resolve, reject)=>{
            let db_cn = new db();
            db_cn.findByAttribute(config.tables.teacher, schemas.teachers.mail)
                .execute([mailId], (err, data) =>{
                    if (err) {
                        console.log(err);
                        return reject('Database error.')                        
                    }
                    if (data.length < 1) {
                        console.log(data);
                        return reject('Teacher '+mailId+' does not exist.')                                                
                    }
                    let teacherInstance = new Teacher(data[0])
                    resolve(teacherInstance);
                })
            });
    }

    async getMentions(mailText){
        let studentEmails = [];
        // Split and check
        let words = mailText.split(' ')
        for(const word of words) {
            let pattern = /^@[a-zA-z0-9]+@[a-zA-Z0-9]+\.[A-Za-z0-9]+/g;
            let match = pattern.exec(word);
            if (match) {
                let sanitizedWord = match[0].slice(1);
                try{
                    await Student.findByMail(sanitizedWord);                    
                    studentEmails.push(sanitizedWord);            
                }catch(error){
                    console.log(error);
                }
            }
        }
        return studentEmails;
    }

    async registerStudent(student) {
        // teacher is a Teacher instance
        let regData = {}
        let registration = schemas.registration;
        regData[registration.teacher_id] = this.data[schemas.teachers.id]
        regData[registration.student_id] = student.data[schemas.students.id]
        return await new Registration(regData).register();
    }

    static async getRegisteredStudents(teacherEmail) {
        let students = await Registration.getRegisteredStudents(teacherEmail);
        let studentMail = [];
        // Object to array
        students.forEach((student)=>
            studentMail.push(student[schemas.students.mail])
        )
        return studentMail;
    }

    static async findCommonStudents(teachersMailList) {
        let registeredList = []
        for (const mail of teachersMailList){
            let students = Teacher.getRegisteredStudents(mail)
            registeredList.push(students);
        }
        registeredList = await Promise.all([...registeredList])
        return _.intersectionWith(...registeredList, _.isEqual);
    }
}