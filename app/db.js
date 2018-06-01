import config from './config'

// Mysql
let mysql_connection = require('mysql')

export default class db{
    constructor(){
        this.query='';    
        // Pool connection object
        this.connection = mysql_connection.createPool({
            'host': mysql_config.mysql.host,
            'user': mysql_config.mysql.user,
            'password': config.mysql.password,
            'database': config.mysql.database
        });
    }

    findByMail(table){
        // QueryBuilder
        this.query = 'Select * from ${table} where mail=?';
        return this;
    }

    findIntersection(table){
        // QueryBuilder
        this.query = 'Select * from ${table1} Join ${table2} On ${table1}.? = ${table2}.? Join ${table3} On ${table1}.? = table3.?';
        return this;
    }

    insert(table){
        this.query = 'Insert into ${table} Values(?)'
        return this;
    }

    insertIfNotExists(table){
        // QueryBuilder
        Exists_query = '(Select * from ${table} where ? = ? And ? = ?)';
        this.query = 'Insert into ${table} Values(?) Where Not Exists '+Exists_query;
        return this;
    }

    update(table){
        // QueryBuilder
        this.query = 'Update ${table} set ? = ? where mail = ?';
        return this;
    }

    execute(data, callback){
        // Runner
        this.connection.query(
            this.query, [...data], function(err, result){
                if (err){
                    return callback(err, null);
                }
                return callback(null, result);
            });
    }
}
