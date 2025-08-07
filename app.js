const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

const portfolioRoutes = require('./routes/portfolio');
const transactionRoutes = require('./routes/transactions');
const taxRoutes = require('./routes/tax');
const performanceRoutes = require('./routes/performance');
const benchmarkRoutes = require('./routes/benchmark'); // Assuming you have a benchmark route

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/benchmark', benchmarkRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
