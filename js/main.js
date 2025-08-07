import { updateChartColors, initializeCharts } from './chart.js';
import { initializeTaxCalculator } from './tax.js';
import { initializeTrading } from './trade.js';
import { initializeBenchmark } from './benchmark.js';

// Global variables
let currentTheme = 'dark';
let sidebarOpen = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  // Initialize all modules
  initializeCharts();
  initializeTaxCalculator();
  initializeTrading();
  initializeBenchmark();
  
  // Set up navigation
  setupNavigation();
  
  // Set up theme toggle
  setupThemeToggle();
  
  // Set up mobile menu
  setupMobileMenu();
  
  // Start real-time updates
  updateRealTimeData();
  setInterval(updateRealTimeData, 30000); // Update every 30 seconds

  // Set up reports functionality
  setupReports();
  
  console.log('Portfolio Manager Pro initialized successfully');
}

// Theme Toggle Function
window.toggleTheme = function() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', currentTheme);
  
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
  
  // Update theme selector in settings
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = currentTheme;
  }
  
  // Update chart colors
  updateChartColors();
  
  console.log(`Theme switched to: ${currentTheme}`);
};

function setupThemeToggle() {
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = currentTheme;
    themeSelect.addEventListener('change', function() {
      if (this.value !== currentTheme) {
        window.toggleTheme();
      }
    });
  }
}

// Sidebar Toggle for Mobile
window.toggleSidebar = function() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay') || createSidebarOverlay();
  
  if (sidebar) {
    sidebarOpen = !sidebarOpen;
    sidebar.classList.toggle('show', sidebarOpen);
    overlay.classList.toggle('show', sidebarOpen);
    
    // Prevent body scroll when sidebar is open
    document.body.style.overflow = sidebarOpen ? 'hidden' : 'auto';
  }
};

function createSidebarOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'sidebar-overlay';
  overlay.className = 'sidebar-overlay';
  overlay.addEventListener('click', window.toggleSidebar);
  document.body.appendChild(overlay);
  return overlay;
}

// Navigation Setup
function setupNavigation() {
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const sectionName = this.getAttribute('data-section');
      if (sectionName) {
        showSection(sectionName);
        
        // Update active state
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // Close mobile sidebar after selection
        if (window.innerWidth <= 768) {
          window.toggleSidebar();
        }
      }
    });
  });
}

// Section Display Function
function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Show selected section
  const targetSection = document.getElementById(sectionName + '-section');
  if (targetSection) {
    targetSection.style.display = 'block';
    console.log(`Showing section: ${sectionName}`);
    
    // Initialize section-specific functionality
    initializeSectionFeatures(sectionName);
  } else {
    console.warn(`Section not found: ${sectionName}`);
  }
}

function initializeSectionFeatures(sectionName) {
  switch(sectionName) {
    case 'analysis':
      // Initialize analysis chart if not already done
      setTimeout(() => {
        initializeAnalysisChart();
      }, 100);
      break;
    case 'market':
      // Refresh market data
      updateMarketData();
      break;
    case 'portfolio':
      // Refresh portfolio data
      updatePortfolioHoldings();
      break;
  }
}

// Real-time Data Updates
function updateRealTimeData() {
  // Update portfolio value with small random changes
  const currentValue = 500000;
  const change = (Math.random() - 0.5) * 10000; // Random change of ±5000
  const newValue = Math.max(currentValue + change, 400000);
  
  const totalValueEl = document.getElementById('totalValue');
  if (totalValueEl) {
    totalValueEl.textContent = `₹${newValue.toLocaleString('en-IN')}`;
  }
  
  // Update ticker prices
  updatePriceTicker();
  
  // Update market data table
  updateMarketData();
  
  console.log('Real-time data updated');
}

function updatePriceTicker() {
  const tickerItems = [
    { name: 'NIFTY', price: 18245 + Math.floor(Math.random() * 200 - 100), change: (Math.random() * 2 - 1).toFixed(2) },
    { name: 'SENSEX', price: 61872 + Math.floor(Math.random() * 500 - 250), change: (Math.random() * 2 - 1).toFixed(2) },
    { name: 'BANK NIFTY', price: 42156 + Math.floor(Math.random() * 300 - 150), change: (Math.random() * 2 - 1).toFixed(2) },
    { name: 'USD/INR', price: 82.45 + (Math.random() * 0.5 - 0.25), change: (Math.random() * 0.5 - 0.25).toFixed(2) },
    { name: 'GOLD', price: 59240 + Math.floor(Math.random() * 1000 - 500), change: (Math.random() * 2 - 1).toFixed(2) }
  ];
  
  const ticker = document.getElementById('priceTicker');
  if (ticker) {
    ticker.innerHTML = tickerItems.map(item => 
      `<span class="ticker-item">${item.name}: ${item.name === 'USD/INR' ? item.price.toFixed(2) : item.price.toLocaleString('en-IN')} <span class="${item.change >= 0 ? 'positive' : 'negative'}">${item.change >= 0 ? '+' : ''}${item.change}%</span></span>`
    ).join('');
  }
}

function updateMarketData() {
  // This would typically fetch from an API
  console.log('Market data refreshed');
}

function updatePortfolioHoldings() {
  // This would typically fetch updated portfolio data
  console.log('Portfolio holdings refreshed');
}

function initializeAnalysisChart() {
  const canvas = document.getElementById('analysisChart');
  if (canvas && !canvas.hasChart) {
    const ctx = canvas.getContext('2d');
    
    // Mark as initialized
    canvas.hasChart = true;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Portfolio Performance',
          data: [450000, 465000, 478000, 490000, 485000, 495000, 510000, 505000, 515000, 520000, 518000, 525000],
          borderColor: getComputedStyle(document.body).getPropertyValue('--accent-blue').trim(),
          backgroundColor: getComputedStyle(document.body).getPropertyValue('--accent-blue').trim() + '20',
          tension: 0.4,
          fill: true
        }, {
          label: 'Benchmark (NIFTY)',
          data: [440000, 455000, 470000, 480000, 475000, 485000, 500000, 495000, 505000, 510000, 508000, 515000],
          borderColor: getComputedStyle(document.body).getPropertyValue('--accent-green').trim(),
          backgroundColor: 'transparent',
          tension: 0.4,
          borderDash: [5, 5]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim()
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim()
            },
            grid: {
              color: getComputedStyle(document.body).getPropertyValue('--border-color').trim()
            }
          },
          y: {
            ticks: {
              color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim(),
              callback: function(value) {
                return '₹' + value.toLocaleString('en-IN');
              }
            },
            grid: {
              color: getComputedStyle(document.body).getPropertyValue('--border-color').trim()
            }
          }
        }
      }
    });
  }
}

// Reports Setup
function setupReports() {
  const downloadPDF = document.getElementById('downloadPDF');
  const downloadCSV = document.getElementById('downloadCSV');
  const downloadTaxReport = document.getElementById('downloadTaxReport');
  
  if (downloadPDF) {
    downloadPDF.addEventListener('click', function() {
      // Simulate PDF download
      showDownloadMessage('Portfolio PDF report download started...');
    });
  }
  
  if (downloadCSV) {
    downloadCSV.addEventListener('click', function() {
      // Generate and download CSV
      generateCSVReport();
    });
  }
  
  if (downloadTaxReport) {
    downloadTaxReport.addEventListener('click', function() {
      // Simulate tax report download
      showDownloadMessage('Tax report download started...');
    });
  }
}

function generateCSVReport() {
  const csvData = [
    ['Symbol', 'Quantity', 'Avg Price', 'Current Price', 'P&L', 'P&L %', 'Value'],
    ['RELIANCE', '100', '2400', '2456', '5600', '2.33%', '245600'],
    ['TCS', '50', '3200', '3245', '2250', '1.41%', '162250'],
    ['GOLD', '10g', '5800', '5924', '1240', '2.14%', '59240']
  ];
  
  const csvContent = csvData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'portfolio_holdings.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  showDownloadMessage('CSV report downloaded successfully!');
}

function showDownloadMessage(message) {
  // Create a temporary message
  const messageDiv = document.createElement('div');
  messageDiv.className = 'alert alert-info position-fixed';
  messageDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  messageDiv.innerHTML = `
    <i class="fas fa-download me-2"></i>
    ${message}
    <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.remove()"></button>
  `;
  
  document.body.appendChild(messageDiv);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentElement) {
      messageDiv.remove();
    }
  }, 5000);
}

// Handle window resize
window.addEventListener('resize', function() {
  if (window.innerWidth > 768 && sidebarOpen) {
    window.toggleSidebar();
  }
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
  if (window.innerWidth <= 768 && sidebarOpen) {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    
    if (sidebar && !sidebar.contains(e.target) && !toggleButton.contains(e.target)) {
      window.toggleSidebar();
    }
  }
});

// Export functions for use in other modules
export { currentTheme, showSection, updateRealTimeData };