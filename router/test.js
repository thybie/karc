var express = require('express');
var router = express.Router();
const db = require('../lib/db');

/* GET home page. */
router.get('/', async (req, res) => {
  let username = req.query.username;

  if (username == null || username.length === 0) {
    
    res.send(JSON.stringify({
        code : 400,
        message : "missing parameter"
    }));
      
      return;
  }

  res.send(JSON.stringify({
      code : 200,
      yourname : username
  }));
});

module.exports = router;
