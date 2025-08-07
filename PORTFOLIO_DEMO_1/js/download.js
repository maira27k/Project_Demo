// download.js - Portfolio data download functionality

class DownloadManager {
    constructor() {
      this.downloadBtn = null;
      this.init();
    }
  
    init() {
      this.downloadBtn = document.getElementById('downloadPortfolio');
      if (this.downloadBtn) {
        this.downloadBtn.addEventListener('click', () => this.showDownloadModal());
      }
      
      // Create download modal
      this.createDownloadModal();
    }
  
    createDownloadModal() {
      // Check if modal already exists
      if (document.getElementById('downloadModal')) return;
  
      const modal = document.createElement('div');
      modal.id = 'downloadModal';
      modal.className = 'modal';
      
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h3><i class="fas fa-download"></i> Download Portfolio</h3>
          
          <div class="download-options">
            <div class="download-format">
              <h4>Select Format:</h4>
              <div class="format-buttons">
                <button class="btn btn-primary format-btn" data-format="json">
                  <i class="fas fa-code"></i>
                  JSON
                </button>
                <button class="btn btn-primary format-btn" data-format="csv">
                  <i class="fas fa-file-csv"></i>
                  CSV
                </button>
                <button class="btn btn-primary format-btn" data-format="pdf">
                  <i class="fas fa-file-pdf"></i>
                  PDF
                </button>
                <button class="btn btn-primary format-btn" data-format="excel">
                  <i class="fas fa-file-excel"></i>
                  Excel
                </button>
              </div>
            </div>
            
            <div class="download-data">
              <h4>Select Data:</h4>
              <div class="data-checkboxes">
                <label class="checkbox-label">
                  <input type="checkbox" id="includePortfolio" checked>
                  <span class="checkmark"></span>
                  Portfolio Holdings
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" id="includeTransactions" checked>
                  <span class="checkmark"></span>
                  Transaction History
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" id="includePerformance">
                  <span class="checkmark"></span>
                  Performance Data
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" id="includeTax">
                  <span class="checkmark"></span>
                  Tax Records
                </label>
              </div>
            </div>
            
            <div class="download-actions">
              <button class="btn btn-success" id="downloadExecute">
                <i class="fas fa-download"></i>
                Download
              </button>
              <button class="btn btn-secondary" id="downloadCancel">
                Cancel
              </button>
            </div>
          </div>
          
          <div class="download-progress" id="downloadProgress" style="display: none;">
            <div class="progress-bar">
              <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text" id="progressText">Preparing download...</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Add event listeners
      this.setupDownloadModalEvents(modal);
    }
  
    setupDownloadModalEvents(modal) {
      const closeBtn = modal.querySelector('.close');
      const cancelBtn = modal.querySelector('#downloadCancel');
      const executeBtn = modal.querySelector('#downloadExecute');
      const formatBtns = modal.querySelectorAll('.format-btn');
      
      let selectedFormat = 'json';
      
      // Close modal events
      [closeBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('click', () => this.hideDownloadModal());
      });
      
      // Format selection
      formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          formatBtns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedFormat = btn.dataset.format;
        });
      });
      
      // Execute download
      executeBtn.addEventListener('click', () => {
        this.executeDownload(selectedFormat);
      });
      
      // Close on outside click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideDownloadModal();
        }
      });
      
      // Default selection
      formatBtns[0].classList.add('selected');
    }
  
    showDownloadModal() {
      const modal = document.getElementById('downloadModal');
      if (modal) {
        modal.classList.add('show');
      }
    }
  
    hideDownloadModal() {
      const modal = document.getElementById('downloadModal');
      if (modal) {
        modal.classList.remove('show');
        // Reset progress
        const progress = document.getElementById('downloadProgress');
        const actions = modal.querySelector('.download-actions');
        progress.style.display = 'none';
        actions.style.display = 'flex';
      }
    }
  
    async executeDownload(format) {
      const modal = document.getElementById('downloadModal');
      const progress = document.getElementById('downloadProgress');
      const actions = modal.querySelector('.download-actions');
      const progressFill = document.getElementById('progressFill');
      const progressText = document.getElementById('progressText');
      
      // Show progress bar
      actions.style.display = 'none';
      progress.style.display = 'block';
      
      try {
        // Get selected data types
        const includePortfolio = document.getElementById('includePortfolio').checked;
        const includeTransactions = document.getElementById('includeTransactions').checked;
        const includePerformance = document.getElementById('includePerformance').checked;
        const includeTax = document.getElementById('includeTax').checked;
        
        // Collect data
        const data = {};
        let progressValue = 0;
        
        if (includePortfolio) {
          this.updateProgress(progressFill, progressText, 20, 'Fetching portfolio data...');
          data.portfolio = await apiService.getPortfolio();
          progressValue += 25;
        }
        
        if (includeTransactions) {
          this.updateProgress(progressFill, progressText, 40, 'Fetching transactions...');
          data.transactions = await apiService.getTransactions();
          progressValue += 25;
        }
        
        if (includePerformance) {
          this.updateProgress(progressFill, progressText, 60, 'Fetching performance data...');
          data.performance = await apiService.getPerformanceData();
          progressValue += 25;
        }
        
        if (includeTax) {
          this.updateProgress(progressFill, progressText, 80, 'Fetching tax records...');
          data.taxRecords = await apiService.getTaxRecords();
          progressValue += 25;
        }
        
        // Add metadata
        data.metadata = {
          exportDate: new Date().toISOString(),
          format: format,
          version: '1.0',
          currency: CONFIG.CURRENCY.CODE,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        
        this.updateProgress(progressFill, progressText, 90, 'Generating file...');
        
        // Generate and download file
        await this.generateAndDownload(data, format);
        
        this.updateProgress(progressFill, progressText, 100, 'Download complete!');
        
        // Hide modal after success
        setTimeout(() => {
          this.hideDownloadModal();
          UTILS.showNotification('Portfolio data downloaded successfully', 'success');
        }, 1500);
        
      } catch (error) {
        console.error('Download failed:', error);
        this.updateProgress(progressFill, progressText, 0, 'Download failed');
        UTILS.showNotification('Failed to download portfolio data', 'error');
        
        // Show actions again
        setTimeout(() => {
          progress.style.display = 'none';
          actions.style.display = 'flex';
        }, 2000);
      }
    }
  
    updateProgress(progressFill, progressText, percentage, text) {
      progressFill.style.width = `${percentage}%`;
      progressText.textContent = text;
    }
  
    async generateAndDownload(data, format) {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `portfolio_${timestamp}`;
      
      switch (format) {
        case 'json':
          this.downloadJSON(data, filename);
          break;
        case 'csv':
          await this.downloadCSV(data, filename);
          break;
        case 'pdf':
          await this.downloadPDF(data, filename);
          break;
        case 'excel':
          await this.downloadExcel(data, filename);
          break;
        default:
          throw new Error('Unsupported format');
      }
    }
  
    downloadJSON(data, filename) {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      this.downloadBlob(blob, `${filename}.json`);
    }
  
    async downloadCSV(data, filename) {
      let csvContent = '';
      
      // Portfolio CSV
      if (data.portfolio && data.portfolio.length > 0) {
        csvContent += 'PORTFOLIO HOLDINGS\n';
        csvContent += 'Symbol,Name,Quantity,Avg Cost,Current Price,Market Value,Gain/Loss,Gain/Loss %\n';
        
        data.portfolio.forEach(item => {
          const marketValue = (item.quantity * (item.current_price || item.avg_cost)) || 0;
          const totalCost = item.quantity * item.avg_cost;
          const gainLoss = marketValue - totalCost;
          const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
          
          csvContent += `${item.ticker_symbol || item.symbol || 'N/A'},`;
          csvContent += `"${(item.asset_name || 'N/A').replace(/"/g, '""')}",`;
          csvContent += `${item.quantity || 0},`;
          csvContent += `${item.avg_cost || 0},`;
          csvContent += `${item.current_price || item.avg_cost || 0},`;
          csvContent += `${marketValue.toFixed(2)},`;
          csvContent += `${gainLoss.toFixed(2)},`;
          csvContent += `${gainLossPercent.toFixed(2)}%\n`;
        });
        csvContent += '\n';
      }
      
      // Transactions CSV
      if (data.transactions && data.transactions.length > 0) {
        csvContent += 'TRANSACTION HISTORY\n';
        csvContent += 'Date,Symbol,Type,Quantity,Price,Total Value\n';
        
        data.transactions.forEach(txn => {
          csvContent += `${UTILS.formatDate(txn.txn_date)},`;
          csvContent += `${txn.ticker_symbol || 'N/A'},`;
          csvContent += `${txn.txn_type || 'N/A'},`;
          csvContent += `${txn.quantity || 0},`;
          csvContent += `${txn.price || 0},`;
          csvContent += `${txn.total_value || 0}\n`;
        });
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      this.downloadBlob(blob, `${filename}.csv`);
    }
  
    async downloadPDF(data, filename) {
      // Create a simple HTML report and convert to PDF using browser print
      const reportWindow = window.open('', '_blank');
      const reportHTML = this.generatePDFReport(data);
      
      reportWindow.document.write(reportHTML);
      reportWindow.document.close();
      
      // Wait for content to load
      reportWindow.onload = function() {
        setTimeout(() => {
          reportWindow.print();
          reportWindow.close();
        }, 500);
      };
    }
  
    generatePDFReport(data) {
      const currentTheme = themeManager.currentTheme;
      const themeStyles = currentTheme === 'dark' ? `
        body { background: #1a1a1a; color: #ffffff; }
        table { border-color: #404040; }
        th { background: #2d2d2d; }
        tr:nth-child(even) { background: #2d2d2d; }
      ` : `
        body { background: #ffffff; color: #212529; }
        table { border-color: #dee2e6; }
        th { background: #f8f9fa; }
        tr:nth-child(even) { background: #f8f9fa; }
      `;
  
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Portfolio Report - ${new Date().toLocaleDateString()}</title>
          <style>
            ${themeStyles}
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #007bff; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid; padding: 8px; text-align: left; }
            th { font-weight: bold; }
            .summary { margin: 20px 0; padding: 15px; border: 1px solid; border-radius: 5px; }
            .positive { color: #28a745; }
            .negative { color: #dc3545; }
            @media print {
              body { background: white !important; color: black !important; }
            }
          </style>
        </head>
        <body>
          <h1>Portfolio Report</h1>
          <div class="summary">
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Total Holdings:</strong> ${data.portfolio ? data.portfolio.length : 0}</p>
          </div>
          
          ${this.generatePortfolioTable(data.portfolio)}
          ${this.generateTransactionsTable(data.transactions)}
          
          <div style="margin-top: 30px; font-size: 12px; color: #666;">
            <p>This report was generated by Portfolio Manager Pro</p>
          </div>
        </body>
        </html>
      `;
    }
  
    generatePortfolioTable(portfolio) {
      if (!portfolio || portfolio.length === 0) {
        return '<h2>Portfolio Holdings</h2><p>No holdings found.</p>';
      }
  
      let html = '<h2>Portfolio Holdings</h2><table>';
      html += '<tr><th>Symbol</th><th>Name</th><th>Quantity</th><th>Avg Cost</th><th>Current Price</th><th>Market Value</th><th>Gain/Loss</th></tr>';
      
      let totalValue = 0;
      let totalCost = 0;
      
      portfolio.forEach(item => {
        const marketValue = (item.quantity * (item.current_price || item.avg_cost)) || 0;
        const costBasis = item.quantity * item.avg_cost;
        const gainLoss = marketValue - costBasis;
        
        totalValue += marketValue;
        totalCost += costBasis;
        
        const gainLossClass = gainLoss >= 0 ? 'positive' : 'negative';
        
        html += '<tr>';
        html += `<td>${item.ticker_symbol || item.symbol || 'N/A'}</td>`;
        html += `<td>${item.asset_name || 'N/A'}</td>`;
        html += `<td>${item.quantity || 0}</td>`;
        html += `<td>${UTILS.formatCurrency(item.avg_cost || 0)}</td>`;
        html += `<td>${UTILS.formatCurrency(item.current_price || item.avg_cost || 0)}</td>`;
        html += `<td>${UTILS.formatCurrency(marketValue)}</td>`;
        html += `<td class="${gainLossClass}">${UTILS.formatCurrency(gainLoss)}</td>`;
        html += '</tr>';
      });
      
      const totalGainLoss = totalValue - totalCost;
      const totalGainLossClass = totalGainLoss >= 0 ? 'positive' : 'negative';
      
      html += '<tr style="font-weight: bold; border-top: 2px solid;">';
      html += '<td colspan="5">TOTAL</td>';
      html += `<td>${UTILS.formatCurrency(totalValue)}</td>`;
      html += `<td class="${totalGainLossClass}">${UTILS.formatCurrency(totalGainLoss)}</td>`;
      html += '</tr>';
      html += '</table>';
      
      return html;
    }
  
    generateTransactionsTable(transactions) {
      if (!transactions || transactions.length === 0) {
        return '<h2>Recent Transactions</h2><p>No transactions found.</p>';
      }
  
      // Show only last 20 transactions for PDF
      const recentTransactions = transactions.slice(-20);
      
      let html = '<h2>Recent Transactions (Last 20)</h2><table>';
      html += '<tr><th>Date</th><th>Symbol</th><th>Type</th><th>Quantity</th><th>Price</th><th>Total</th></tr>';
      
      recentTransactions.reverse().forEach(txn => {
        html += '<tr>';
        html += `<td>${UTILS.formatDate(txn.txn_date)}</td>`;
        html += `<td>${txn.ticker_symbol || 'N/A'}</td>`;
        html += `<td>${txn.txn_type || 'N/A'}</td>`;
        html += `<td>${txn.quantity || 0}</td>`;
        html += `<td>${UTILS.formatCurrency(txn.price || 0)}</td>`;
        html += `<td>${UTILS.formatCurrency(txn.total_value || 0)}</td>`;
        html += '</tr>';
      });
      
      html += '</table>';
      return html;
    }
  
    async downloadExcel(data, filename) {
      // For Excel, we'll create a detailed CSV that can be opened in Excel
      // This is a simplified version - for full Excel support, you'd need a library like SheetJS
      
      let content = 'sep=,\n'; // Excel separator hint
      content += 'Portfolio Manager Pro - Export\n';
      content += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      // Portfolio sheet equivalent
      if (data.portfolio && data.portfolio.length > 0) {
        content += 'PORTFOLIO HOLDINGS\n';
        content += 'Symbol,Name,Asset Type,Quantity,Average Cost,Current Price,Market Value,Total Cost,Gain/Loss,Gain/Loss %,Day Change,Day Change %\n';
        
        data.portfolio.forEach(item => {
          const marketValue = (item.quantity * (item.current_price || item.avg_cost)) || 0;
          const totalCost = item.quantity * (item.avg_cost || 0);
          const gainLoss = marketValue - totalCost;
          const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
          
          content += `${item.ticker_symbol || 'N/A'},`;
          content += `"${(item.asset_name || 'N/A').replace(/"/g, '""')}",`;
          content += `${item.asset_type || 'Stock'},`;
          content += `${item.quantity || 0},`;
          content += `${item.avg_cost || 0},`;
          content += `${item.current_price || item.avg_cost || 0},`;
          content += `${marketValue.toFixed(2)},`;
          content += `${totalCost.toFixed(2)},`;
          content += `${gainLoss.toFixed(2)},`;
          content += `${gainLossPercent.toFixed(2)},`;
          content += `${item.day_change || 0},`;
          content += `${item.day_change_percent || 0}\n`;
        });
        content += '\n\n';
      }
      
      // Transactions sheet equivalent
      if (data.transactions && data.transactions.length > 0) {
        content += 'TRANSACTION HISTORY\n';
        content += 'Date,Symbol,Name,Type,Quantity,Price,Total Value,Fees,Notes\n';
        
        data.transactions.forEach(txn => {
          content += `${UTILS.formatDate(txn.txn_date)},`;
          content += `${txn.ticker_symbol || 'N/A'},`;
          content += `"${(txn.asset_name || 'N/A').replace(/"/g, '""')}",`;
          content += `${txn.txn_type || 'N/A'},`;
          content += `${txn.quantity || 0},`;
          content += `${txn.price || 0},`;
          content += `${txn.total_value || 0},`;
          content += `${txn.fees || 0},`;
          content += `"${(txn.notes || '').replace(/"/g, '""')}"\n`;
        });
      }
      
      const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      this.downloadBlob(blob, `${filename}.csv`); // Excel will open CSV files
    }
  
    downloadBlob(blob, filename) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }
  
  // Initialize download manager
  const downloadManager = new DownloadManager();
  
  // Make globally available
  window.downloadManager = downloadManager;