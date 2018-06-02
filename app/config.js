var mysql_config = {
'host': 'localhost',
'port': 3306,
'user': 'ufinity',
'database': 'UfinityDb',
'password': 'U51n17yDbPa$sword'
}

var table_names={
    'student':'students',
    'teacher':'teachers',
    'register': 'registration'
}

module.exports={
    'mysql':mysql_config,
    'tables':table_names
}