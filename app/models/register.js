import {_} from 'lodash'
import schemas from './schema'

export default class Registration{
    constructor(data){
        this.data = data;
        this.schema = schemas.register;        
    }

    clean(data){
        data = this.data || {};
        return _.pick(_.defaults(data, this.schema), _.keys(this.schema.values()));
    }

    save(){
        data = this.clean(data);
        db.insertIfNotExists(this.name.toLowerCase())
                .execute( [_.keys(this.schema.values()).join(','),          // Schema values
                        this.schema.sid, data[this.schema.sid],             // SID == SID
                          this.schema.tid, data[this.schema.tid] ] );       // TID == TID
    }
}