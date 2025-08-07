const db = require('../config/db');

exports.getBenchmark = (req, res) => {
  db.query('SELECT * FROM benchmark', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
