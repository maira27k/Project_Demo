CREATE DATABASE finance_portfolio_manager;

USE finance_portfolio_manager;

-- Portfolio Items Table
CREATE TABLE portfolio_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_type VARCHAR(50) NOT NULL,
    asset_name VARCHAR(100) NOT NULL,
    ticker_symbol VARCHAR(10),
    current_price DECIMAL(10, 2) NOT NULL
);

-- Transactions Table
CREATE TABLE transactions (
    txn_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    txn_type ENUM('buy', 'sell') NOT NULL,
    txn_date DATE NOT NULL,
    quantity DECIMAL(12, 4) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    total_value DECIMAL(14, 2) GENERATED ALWAYS AS (quantity * price) STORED,
    FOREIGN KEY (item_id) REFERENCES portfolio_items(item_id) ON DELETE CASCADE
);

-- Benchmark Table
CREATE TABLE benchmark (
    benchmark_id INT PRIMARY KEY AUTO_INCREMENT,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    change_percent DECIMAL(6,2),
    volume VARCHAR(20),
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Taxes Table
CREATE TABLE tax_records (
    tax_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    sell_date DATE NOT NULL,
    sell_price DECIMAL(12, 2) NOT NULL,
    capital_gain DECIMAL(12, 2) NOT NULL,
    tax_paid DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (item_id) REFERENCES portfolio_items(item_id) ON DELETE CASCADE
);

-- Performance Log Table
CREATE TABLE performance_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    date DATE NOT NULL,
    value DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (item_id) REFERENCES portfolio_items(item_id) ON DELETE CASCADE
);

INSERT INTO portfolio_items (item_id, asset_type, asset_name, ticker_symbol, current_price) VALUES
(1, 'stock', 'Apple Inc.', 'AAPL', 175.00),
(2, 'stock', 'Tesla Inc.', 'TSLA', 740.00),
(3, 'crypto', 'Bitcoin', 'BTC', 29000.00),
(4, 'crypto', 'Ethereum', 'ETH', 1850.00),
(5, 'etf', 'S&P 500 ETF', 'SPY', 435.00),
(6, 'bond', 'US Treasury Bond', 'USB', 99.00),
(7, 'stock', 'Microsoft', 'MSFT', 280.00),
(8, 'stock', 'Amazon', 'AMZN', 3350.00),
(9, 'commodity', 'Gold', 'GOLD', 1950.00),
(10, 'crypto', 'Solana', 'SOL', 110.00);

INSERT INTO transactions (txn_id, item_id, txn_type, txn_date, quantity, price) VALUES
(1, 1, 'buy', '2025-01-10', 10.0000, 150.00),
(2, 2, 'buy', '2025-01-11', 5.0000, 700.00),
(3, 3, 'buy', '2025-01-12', 0.5000, 25000.00),
(4, 4, 'buy', '2025-01-13', 1.0000, 1700.00),
(5, 5, 'buy', '2025-01-14', 7.0000, 420.00),
(6, 6, 'buy', '2025-01-15', 20.0000, 90.00),
(7, 1, 'sell', '2025-08-01', 10.0000, 175.00),
(8, 3, 'sell', '2025-08-01', 0.5000, 29000.00),
(9, 4, 'sell', '2025-08-01', 1.0000, 1850.00),
(10, 2, 'sell', '2025-08-01', 5.0000, 740.00);

INSERT INTO tax_records (tax_id, item_id, sell_date, sell_price, capital_gain, tax_paid) VALUES
(1, 1, '2025-08-01', 175.00, 250.00, 25.00),
(2, 2, '2025-08-01', 740.00, 200.00, 20.00),
(3, 3, '2025-08-01', 29000.00, 2000.00, 200.00),
(4, 4, '2025-08-01', 1850.00, 150.00, 15.00),
(5, 5, '2025-08-01', 435.00, 105.00, 10.50),
(6, 6, '2025-08-01', 99.00, 20.00, 2.00),
(7, 7, '2025-08-01', 280.00, 50.00, 5.00),
(8, 8, '2025-08-01', 3350.00, 300.00, 30.00),
(9, 9, '2025-08-01', 1950.00, 100.00, 10.00),
(10, 10, '2025-08-01', 110.00, 30.00, 3.00);

INSERT INTO performance_log (log_id, item_id, date, value) VALUES
(1, 1, '2025-06-01', 172.00),
(2, 1, '2025-07-01', 174.00),
(3, 2, '2025-06-01', 730.00),
(4, 2, '2025-07-01', 740.00),
(5, 3, '2025-06-01', 28000.00),
(6, 3, '2025-07-01', 29000.00),
(7, 4, '2025-06-01', 1800.00),
(8, 4, '2025-07-01', 1850.00),
(9, 5, '2025-06-01', 430.00),
(10, 5, '2025-07-01', 435.00);

INSERT INTO benchmark (benchmark_id, symbol, name, price, change_percent, volume)
VALUES
(1, 'NIFTY', 'NIFTY 50', 18245.00, 0.85, '145.2M'),
(2, 'SENSEX', 'SENSEX', 61872.00, 1.12, '234.5M'),
(3, 'BANKNIFTY', 'BANK NIFTY', 42156.00, -0.45, '89.3M'),
(4, 'USDINR', 'USD/INR', 82.45, 0.23, '2.1B'),
(5, 'GOLD', 'GOLD', 59240.00, 0.67, '45.8K'),
(6, 'NASDAQ', 'NASDAQ Composite', 14356.25, 1.14, '3.2B'),
(7, 'DOWJONES', 'Dow Jones Industrial Average', 35267.89, 0.87, '2.4B'),
(8, 'FTSE', 'FTSE 100', 7412.63, -0.12, '1.1B'),
(9, 'BTCUSD', 'Bitcoin/USD', 47682.15, 2.45, '38.9K'),
(10, 'ETHUSD', 'Ethereum/USD', 3167.42, 1.88, '21.5K');

SELECT * FROM finance_portfolio_manager.performance_log;

SELECT * FROM finance_portfolio_manager.portfolio_items;

SELECT * FROM finance_portfolio_manager.tax_records;

SELECT * FROM finance_portfolio_manager.transactions;

SELECT * FROM finance_portfolio_manager.benchmark;








