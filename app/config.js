var mysql_config = {
'host': '0.0.0.0',
'port': 3306,
'user': 'root',
'database': 'UfinityDb',
'password': 'u51n17y'
}

var table_names={
    'student':'student',
    'teacher':'teacher',
    'registered': 'register'
}

module.exports={
    'mysql':mysql_config,
    'tables':table_names
}