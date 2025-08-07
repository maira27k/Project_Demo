const db = require('../config/db');

exports.getTaxRecords = (req, res) => {
  db.query('SELECT * FROM tax_records', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.addTaxRecord = (req, res) => {
  const { type, amount, year } = req.body;
  db.query(
    'INSERT INTO tax_records (type, amount, year) VALUES (?, ?, ?)',
    [type, amount, year],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Tax record added successfully' });
    }
  );
};
