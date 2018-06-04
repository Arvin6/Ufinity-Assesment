import config from './config/config'

// Mysql
let mysql_connection = require('mysql')
var myConnection = mysql_connection.createPool(config.mysql);

class QueryBuilder {
    constructor(){
        this.query='';    
        return this;
    }

    delete(table){
        this.query = `DELETE FROM ${table}`;
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
        this.query = this.query + ` JOIN ${table2} ON ${on}`;
        return this;
    }

    insert(table){
        this.query = `INSERT INTO ${table}(??) VALUES(?)`;
        return this;
    }

    upsert(table){
        // QueryBuilder
        this.query = `INSERT INTO ${table}(??)VALUES(?,?) ON DUPLICATE KEY UPDATE ??=?, ??=?`;
        return this;
    }

    where(){
        this.query = this.query + ' WHERE ?? = ?';
        return this;
    }

    update(table, column, value){
        // QueryBuilder
        this.query = `Update ${table} set ${column} = ${value}`
        return this;
    }
    and(){
        this.query = this.query + ' AND ??=?'
        return this;
    }

    execute(data, callback){
        // Runner
        myConnection.getConnection( (error, connection)=>{
            // Get connection and close after use
            if (error) {
                throw error;
            }
            let formatted_query = connection.format(this.query, data);
            connection.query(
                formatted_query, function(err, result){
                    if (err){
                        // Release on error
                        connection.release();
                        return callback(err, null);
                    }
                    // Release after result
                    connection.release();
                    return callback(null, JSON.parse(JSON.stringify(result)));
            });
        });
    }
}

module.exports = QueryBuilder;