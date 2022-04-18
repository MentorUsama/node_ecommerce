const mysql = require('mysql2')

const pool = mysql.createPool({
    host:'localhost',
    user:'root',
    database:'node-database',
    password:'password'
})

module.exports = pool.promise()