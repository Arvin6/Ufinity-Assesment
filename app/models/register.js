import {_} from 'lodash'
import db from '../db'

import config from '../config/config'
import schemas from '../config/schema'
import UfinityError from './Customerror';


export default class Registration {
    constructor(data) {
        this.data = this.clean(data);
    }

    clean(data) {
        data = data || {};
        let schema = schemas.registration;
        return _.pick(_.defaults(data, schema), _.keys(schema));
    }

    register() {
        let teacher_id = schemas.registration.teacher_id
        let student_id = schemas.registration.student_id
        let db_cn = new db();
        return new Promise((resolve, reject) => {
            db_cn.upsert(config.tables.register)
                .execute( [[schemas.registration.student_id, schemas.registration.teacher_id],
                        this.data[student_id], this.data[teacher_id],
                        student_id.toString(), this.data[student_id],
                          teacher_id.toString(), this.data[teacher_id] ],
                            (error, result) =>{
                                if (error) {
                                return reject(new UfinityError(`Student cannnot be registered to teacher`));
                            }
                                resolve (result);
                        });
        });
    }
        

    static getRegisteredStudents(teacherMailId) {
        // Table names
        let teacherTable = config.tables.teacher;
        let registerTable = config.tables.register;
        let studentTable = config.tables.student;

        // Student column names
        let studentIdColumn = schemas.students.id;
        let studentMailColumn = schemas.students.mail;
        let studentIsSuspended = schemas.students.isSuspended;
        // Teacher column names
        let teacherIdColumn = schemas.teachers.id;
        let teacherMailColumn = schemas.teachers.mail;
        // Registration column names
        let regTeacherId = schemas.registration.teacher_id;
        let regStudentId = schemas.registration.student_id;
        
        // Join condition for student and registration tables
        let studentOnCondition = `${studentTable}.${studentIdColumn} = ${registerTable}.${regStudentId}`;
        // Join condition for teacher and registration tables
        let teacherOnCondition = `${teacherTable}.${teacherIdColumn} = ${registerTable}.${regTeacherId}`;
        // The columns to return
        let return_columns = `${studentTable}.${studentMailColumn}`;
        // Where condition to filter out the necessary condition to check suspension and teacher's subscription list
        let where_condition 
        
        // Query ops
        let db_cn = new db();
        // Fetch from DB
        return new Promise( (resolve, reject) => {
            db_cn.joinTables(teacherTable, registerTable, teacherOnCondition, return_columns)
                    .joinTables(registerTable, studentTable, studentOnCondition, null)
                        .where()
                            .and()
                            .execute([`${teacherTable}.${teacherMailColumn}`,`${teacherMailId}`,
                                     `${studentTable}.${studentIsSuspended}`, false],
                                 function (error, result){
                                    if (error){
                                        return reject(error);
                                    }
                                resolve(result);
                            });
            });
    }
}