const db = require('../config/db');

exports.getTransactions = (req, res) => {
  db.query('SELECT * FROM transactions', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.addTransaction = (req, res) => {
  const { type, amount, date } = req.body;
  db.query(
    'INSERT INTO transactions (type, amount, date) VALUES (?, ?, ?)',
    [type, amount, date],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Transaction added successfully' });
    }
  );
};
