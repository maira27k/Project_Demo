const db = require('../config/db');

exports.getPerformanceLogs = (req, res) => {
  db.query('SELECT * FROM performance_log', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
