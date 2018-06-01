import db from '../db'
import student from './student'
import config from '../config'

export default class Teacher{
    constructor(mail){
        this.mail=mail;
    }

    clean(data){
        data = this.data || {};
        schema = schemas.Teacher;
        return _.pick(_.defaults(data, schema), _.keys(schema));
    }

    get mail(){
        return this.mail
    }
    
    suspend(student_mail_id, callback){
        Student = new student(student_mail_id)
        Student.suspend()
    }

    registerStudents(students){
        
    }

    getMailingList(email){
        registered_students = this.getRegisteredStudents()

    }

    getRegisteredStudents(){
        this.id;
    }

    findCommonStudents(Teacher1, Teacher2){

    }
}