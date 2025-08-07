const db = require('../config/db');

exports.getPortfolioItems = (req, res) => {
  db.query('SELECT * FROM portfolio_items', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.addItem = (req, res) => {
  const { name, quantity, price } = req.body;
  db.query(
    'INSERT INTO portfolio_items (name, quantity, price) VALUES (?, ?, ?)',
    [name, quantity, price],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Item added successfully' });
    }
  );
};

exports.removeItem = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM portfolio_items WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item removed successfully' });
  });
};
