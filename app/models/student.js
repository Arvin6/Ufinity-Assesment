import {_} from 'lodash'
import db from '../db'
import schemas from '../schema'
import config from '../config'

export default class Student {
    constructor(data) {
        this.data = this.clean(data);
    }

    clean(data) {
        // Sanitizing our object
        data = data || {};
        let schema = schemas.students;
        return _.pick(_.defaults(data, schema), _.keys(schema));
    }

    async suspend() {
        // Suspend student
        db_cn = new db();
        this.data[schemas.students.isSuspended] = true;
        return await new Promise( (resolve, reject) =>{
            db_cn.update(config.tables.student)
                .execute( [schemas.students.isSuspended,true,
                    this.data[schemas.students.mail]],
                        (error, result)=>{
                            if (error){
                                console.log(error);
                                return reject('Unable to suspend the student');
                            }
                            resolve(result)
                        });
        });
    }

    static async findByMail(mailId) {
        // Returns a Student object
        return await new Promise((resolve, reject)=>{
            let db_cn = new db();
            db_cn.findByAttribute(config.tables.student, schemas.students.mail)
                    .execute([mailId], (err, data) => {
                        if (err){
                            console.log(err);
                            return reject('Database error.');                        
                        }
                        if (data.length < 1) {
                            console.log(data);                            
                            return reject('Student '+mailId+' does not exist.');                                                        
                        }
                        let sInstance = new Student(data[0]);
                        resolve(sInstance);
                    });
        });
    }
}