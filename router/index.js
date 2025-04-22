var express = require('express');
const createError = require('http-errors');
var router = express.Router();
const db = require('../lib/db');

/* GET home page. */
router.get('/', async (req, res) => {
  const [menuItems] = await db.query('SELECT * FROM t_menu');
  console.log(menuItems)
  res.render('layout', { menuItems });
});

router.get('/content/:page', async (req, res) => {
  const page = req.params.page;
  console.log("content/"+page);

  const year = req.query.year || new Date().getFullYear();
  console.log("year:"+year);
  let params;
  let sql;

  switch (page) {
  case 'ka_010100' :
    sql = 'SELECT '
        +   'u.user_nm, '
        +   'CASE ufm.member_class_cd '
        +     'WHEN \'104001\' THEN \'[회장]\' '
        +     'WHEN \'104002\' THEN \'[부회장]\' '
        +     'WHEN \'104003\' THEN \'[기획총무]\' '
        +     'WHEN \'104004\' THEN \'[재무총무]\' '
        +     'WHEN \'104005\' THEN \'[훈련부장]\' '
        +     'WHEN \'104006\' THEN \'[훈련차장]\' '
        +     'WHEN \'104007\' THEN \'[고문]\' '
        +     'WHEN \'104008\' THEN \'일반회원\' '
        +     'WHEN \'104009\' THEN \'게스트\' '
        +     'WHEN \'104010\' THEN \'[홍보부장]\' '
        +     'WHEN \'104011\' THEN \'[감독]\' '
        +     'WHEN \'104012\' THEN \'[감사]\' '
        +     'ELSE \'UNKNOWN\' '
        +   'END AS member_class_nm, '
        +   'u.gender, u.user_nm_alias, u.remark '
        + 'FROM t_user_full_membership ufm LEFT JOIN t_user u ON ufm.user_seq = u.user_seq '
        + 'WHERE ufm.fiscal_year = ? ORDER BY user_nm ASC';
    params = [year];
    try {
      const [results] = await db.query(sql, params);
      // console.log(results);
      res.render(`content/${page}`, { title: page, users: results, selectedYear: year || '' });  
      // res.json(results);
    } catch (err) {
      console.error('DB 오류:', err);
      res.status(500).send('서버 오류');
    }
    break;
  case 'ka_020100' :
    sql = 'SELECT '
        +   'r.race_nm, '
        +   'CASE r.race_type '
        +     'WHEN \'102000\' THEN \'마라톤\' '
        +     'WHEN \'102100\' THEN \'울트라마라톤\' '
        +     'WHEN \'102200\' THEN \'트레일런\' '
        +     'WHEN \'102300\' THEN \'스카이런\' '
        +     'WHEN \'102400\' THEN \'트라이애슬론\' '
        +     'WHEN \'102500\' THEN \'육상\' '
        +     'WHEN \'102600\' THEN \'등산\' '
        +     'WHEN \'102700\' THEN \'걷기\' '
        +     'WHEN \'102800\' THEN \'체력단련\' '
        +     'ELSE \'UNKNOWN\' '
        +   'END AS race_type_nm, '
        +   'r.additional_info, r.race_date, r.race_place '
        + 'FROM t_race r '
        + 'WHERE YEAR(r.race_date) = ? ORDER BY race_seq ASC';
    params = [year];
    try {
      const [results] = await db.query(sql, params);
      // console.log(results);
      res.render(`content/${page}`, { title: page, races: results, selectedYear: year || '' });  
      // res.json(results);
    } catch (err) {
      console.error('DB 오류:', err);
      res.status(500).send('서버 오류');
    }
    break;
  case 'ka_030100' :
    sql = 'SELECT '
        +   'u.user_nm AS user_nm, '
        +   'IF(f.cnt > 0, f.cnt, 0) AS cnt, '
        +   'IF(f.total_cnt > 0, f.total_cnt, 0) AS total_cnt, '
        +   'IF(f.total_cnt > 0, FORMAT(f.cnt / f.total_cnt * 100, 2), 0.00) AS attend_rate '
        + 'FROM t_user_full_membership ufm '
        + 'LEFT JOIN t_user u ON ufm.user_seq = u.user_seq '
        + 'LEFT JOIN ( '
        +   'SELECT '
        +     'tp.user_seq AS seq, ' 
        +     'COUNT(tp.user_seq) AS cnt, ' 
        +     '(SELECT COUNT(*) FROM t_training WHERE YEAR(training_date) = ? AND training_type_cd = \'103001\') AS total_cnt '
        +     'FROM kkace.t_training_participants tp '
        +     'WHERE YEAR(tp.training_date) = ? '
        +     'GROUP BY tp.user_seq '
        + ') AS f ON ufm.user_seq = f.seq '
        + 'WHERE ufm.fiscal_year = ? ' // AND f.cnt > 0 '
        + 'ORDER BY f.cnt DESC, u.user_nm ASC';
    params = [year,year,year];
    try {
      const [results] = await db.query(sql, params);
      // console.log(results);
      res.render(`content/${page}`, { title: page, stats: results, selectedYear: year || '' });  
      // res.json(results);
    } catch (err) {
      console.error('DB 오류:', err);
      res.status(500).send('서버 오류');
    }
    break;
  case 'ka_030200' :
  case 'ka_030300' :
    sql = '' 
        + 'SELECT * '
        + 'FROM ('
        +   'SELECT '
        +     'rp.user_seq, up.user_nm, r.race_nm, r.race_date, up.best_record, rp.new_record_yn, rp.first_yn '
        +   'FROM ('
        +     'SELECT a.user_seq AS user_seq, u.user_nm AS user_nm, MIN(a.user_record) AS best_record '
        +     'FROM t_race_participants a '
        +     'LEFT JOIN t_race r ON r.race_seq = a.race_seq ' 
        +     'LEFT JOIN t_user u ON a.user_seq = u.user_seq ' 
        +     'WHERE '
        +       'a.event_cd = \'102001\' AND a.finish_yn = \'Y\' AND a.team_event_type = \'\' AND '
        +       'a.user_record IS NOT NULL AND YEAR(r.race_date) = ? '
        +     'GROUP BY a.user_seq'
        +   ') AS up '
        +   'LEFT JOIN t_race_participants rp ON rp.user_seq = up.user_seq AND rp.user_record = up.best_record '
        +   'LEFT JOIN t_race r ON rp.race_seq = r.race_seq '
        +   'INNER JOIN t_user_full_membership ufm ON up.user_seq = ufm.user_seq AND ufm.fiscal_year = ? '
        + ') AS pb '
        + 'WHERE YEAR(pb.race_date) = ? '
        + 'ORDER BY pb.best_record';
    params = [year,year,year];
    try {
      const [results] = await db.query(sql, params);
      // console.log(results);
      res.render(`content/${page}`, { title: page, stats: results, selectedYear: year || '' });  
      // res.json(results);
    } catch (err) {
      console.error('DB 오류:', err);
      res.status(500).send('서버 오류');
    }
    break;
  }
});

module.exports = router;
