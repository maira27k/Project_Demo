// Global chart instances
let portfolioChart, performanceChart;

// Initialize all charts
export function initializeCharts() {
  try {
    initializePortfolioChart();
    initializePerformanceChart();
    console.log('Charts initialized successfully');
  } catch (error) {
    console.error('Error initializing charts:', error);
  }
}

// Initialize Portfolio Pie Chart
function initializePortfolioChart() {
  const canvas = document.getElementById('portfolioPieChart');
  if (!canvas) {
    console.warn('Portfolio chart canvas not found');
    return;
  }

  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart if it exists
  if (portfolioChart) {
    portfolioChart.destroy();
  }

  const isDark = document.body.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#ffffff' : '#212529';

  portfolioChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Stocks', 'Gold', 'Bitcoin', 'Bonds', 'Cash'],
      datasets: [{
        data: [45, 20, 15, 12, 8],
        backgroundColor: [
          '#00d4ff',
          '#ffb800',
          '#ff3366',
          '#00ff88',
          '#8892a6'
        ],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            padding: 15,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${percentage}% (₹${(value * 10000).toLocaleString('en-IN')})`;
            }
          }
        }
      },
      cutout: '60%',
      animation: {
        animateRotate: true,
        duration: 1000
      }
    }
  });
}

// Initialize Performance Line Chart
function initializePerformanceChart() {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) {
    console.warn('Performance chart canvas not found');
    return;
  }

  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart if it exists
  if (performanceChart) {
    performanceChart.destroy();
  }

  const isDark = document.body.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#ffffff' : '#212529';
  const gridColor = isDark ? '#2a3441' : '#e9ecef';

  // Generate sample performance data
  const performanceData = generatePerformanceData();

  performanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: performanceData.labels,
      datasets: [{
        label: 'Portfolio Value',
        data: performanceData.values,
        borderColor: '#00d4ff',
        backgroundColor: '#00d4ff20',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Portfolio Value: ₹${context.parsed.y.toLocaleString('en-IN')}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColor,
            font: {
              size: 11
            }
          },
          grid: {
            color: gridColor,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColor,
            font: {
              size: 11
            },
            callback: function(value) {
              return '₹' + (value / 1000).toFixed(0) + 'K';
            }
          },
          grid: {
            color: gridColor,
            drawBorder: false
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  });
}

// Generate sample performance data
function generatePerformanceData() {
  const labels = [];
  const values = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days

  let currentValue = 480000; // Starting value

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Format date as MM/DD
    const dateStr = (date.getMonth() + 1).toString().padStart(2, '0') + 
                   '/' + date.getDate().toString().padStart(2, '0');
    labels.push(dateStr);

    // Generate realistic market movement
    const change = (Math.random() - 0.45) * 0.03; // Slight upward bias
    currentValue = Math.max(currentValue * (1 + change), 400000);
    values.push(Math.round(currentValue));
  }

  return { labels, values };
}

// Update chart colors when theme changes
export function updateChartColors() {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#ffffff' : '#212529';
  const gridColor = isDark ? '#2a3441' : '#e9ecef';

  // Update portfolio chart
  if (portfolioChart) {
    portfolioChart.options.plugins.legend.labels.color = textColor;
    portfolioChart.update('none'); // Update without animation
  }

  // Update performance chart
  if (performanceChart) {
    performanceChart.options.plugins.legend.labels.color = textColor;
    performanceChart.options.scales.x.ticks.color = textColor;
    performanceChart.options.scales.y.ticks.color = textColor;
    performanceChart.options.scales.x.grid.color = gridColor;
    performanceChart.options.scales.y.grid.color = gridColor;
    performanceChart.update('none'); // Update without animation
  }

  console.log('Chart colors updated for theme:', isDark ? 'dark' : 'light');
}

// Update chart data (for real-time updates)
export function updateChartData(newData) {
  if (performanceChart && newData) {
    // Add new data point
    const currentTime = new Date();
    const timeStr = currentTime.getHours().toString().padStart(2, '0') + 
                   ':' + currentTime.getMinutes().toString().padStart(2, '0');
    
    performanceChart.data.labels.push(timeStr);
    performanceChart.data.datasets[0].data.push(newData.portfolioValue);

    // Keep only last 20 data points for performance
    if (performanceChart.data.labels.length > 20) {
      performanceChart.data.labels.shift();
      performanceChart.data.datasets[0].data.shift();
    }

    performanceChart.update('active');
  }
}

// Resize charts when container size changes
export function resizeCharts() {
  if (portfolioChart) {
    portfolioChart.resize();
  }
  if (performanceChart) {
    performanceChart.resize();
  }
}

// Get chart instances (for external use)
export function getChartInstances() {
  return {
    portfolioChart,
    performanceChart
  };
}

// Destroy all charts
export function destroyCharts() {
  if (portfolioChart) {
    portfolioChart.destroy();
    portfolioChart = null;
  }
  if (performanceChart) {
    performanceChart.destroy();
    performanceChart = null;
  }
  console.log('All charts destroyed');
}

// Initialize charts when window is resized
window.addEventListener('resize', debounce(resizeCharts, 250));

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}