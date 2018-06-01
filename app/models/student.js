import db from '../db'
import schema from 'schema'
import config from '../config'
import { callbackify } from 'util';

export class Student{
    constructor(mail_id){
        this.mail_id = mail_id;
    }

    clean(data){
        data = this.data || {};
        schema = schemas.student;
        return _.pick(_.defaults(data, schema), _.keys(schema));
    }

    set suspend(){
        this.is_suspended = true
    }

    findByMail(mail){
        db.findByMail(this.name.toLowerCase())
                .execute([this.mail_id], callback);
    } 

    get is_suspended(){
        return this.is_suspended;
    }
}