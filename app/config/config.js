require('dotenv').config();

let env = process.env.NODE_ENV

var mysql_config = {
'host': process.env['MYSQL_'+env+'_HOST'],
'port': process.env['MYSQL_'+env+'_PORT'],
'user': process.env['MYSQL_'+env+'_USER'],
'database': process.env['MYSQL_'+env+'_DATABASE'],
'password': process.env['MYSQL_'+env+'_PASSWORD'],
'connectionLimit':151
}

var mysql_table_names={
    'student':'students',
    'teacher':'teachers',
    'register': 'registration'
}

module.exports={
    'mysql':mysql_config,
    'tables':mysql_table_names
}