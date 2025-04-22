const mysql = require('mysql2/promise');

// MySQL 연결 설정
const db = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'dolepack', // ← 너의 비밀번호로 변경
  database: 'kkace'
});

module.exports = db;