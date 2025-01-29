const Mysql = require('mysql2/promise')

const mySqlPool = Mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'task'
})

module.exports = mySqlPool;