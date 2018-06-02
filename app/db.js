import config from './config'

// Mysql
let mysql_connection = require('mysql')
var myConnection = mysql_connection.createPool(config.mysql);

class QueryBuilder {
    constructor(){
        this.query='';    
        return this;
    }

    findByAttribute(table, attribute){
        // QueryBuilder
        this.query = `SELECT * FROM ${table} WHERE ${attribute}=?`;
        return this;
    }

    joinTables(table1, table2, on, return_columns){
        if (return_columns === null) return_columns = '*';
        if (this.query === '') {
            this.query = `SELECT ${return_columns} FROM ${table1} JOIN ${table2} ON ${on}`;
            return this;         
        }
        this.query = this.query + ` JOIN ${table2} ON ${on}`
        return this;
    }

    insert(table){
        this.query = `INSERT INTO ${table}(??) VALUES(?)`
        return this;
    }

    upsert(table){
        // QueryBuilder
        this.query = `INSERT INTO ${table}(??)VALUES(?,?) ON DUPLICATE KEY UPDATE ??=?, ??=?`;
        return this;
    }

    where(condition){
        this.query = this.query + ' WHERE '+condition;
        return this;
    }

    update(table){
        // QueryBuilder
        this.query = `Update ${table} set ?? = ? where mail = ?`;
        return this;
    }

    execute(data, callback){
        // Runner
        myConnection.getConnection( (error, connection)=>{
            if (error) {
                console.log(error)
                throw error;
            }
            let formatted_query = connection.format(this.query, data)
            connection.query(
                formatted_query, function(err, result){
                    if (err){
                        console.log(err);
                        connection.release();
                        return callback(err, null);
                    }
                    connection.release();
                    return callback(null, JSON.parse(JSON.stringify(result)));
            });
        });
    }
}

module.exports = QueryBuilder;