const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'udemy-node',
    password: 'KapaB9fm)'
});

module.exports = pool.promise();