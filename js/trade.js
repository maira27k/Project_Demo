// Trading Module

let orderHistory = [];
let mockPrices = {
  'RELIANCE': 2456,
  'TCS': 3245,
  'INFY': 1456,
  'HDFC': 2890,
  'ICICIBANK': 1045,
  'SBI': 578,
  'ITC': 456,
  'HDFCBANK': 1678,
  'BHARTIARTL': 934,
  'ASIANPAINT': 3234
};

export function initializeTrading() {
  const buyBtn = document.getElementById('buyBtn');
  const sellBtn = document.getElementById('sellBtn');
  
  if (buyBtn) {
    buyBtn.addEventListener('click', () => executeTrade('BUY'));
  }
  
  if (sellBtn) {
    sellBtn.addEventListener('click', () => executeTrade('SELL'));
  }
  
  // Add real-time price updates
  setInterval(updateMockPrices, 5000);
  
  console.log('Trading module initialized');
}

async function executeTrade(type) {
  const assetInput = document.getElementById('tradeAsset');
  const qtyInput = document.getElementById('tradeQty');
  const orderTypeSelect = document.getElementById('orderType');
  const resultEl = document.getElementById('tradeResult');
  
  if (!assetInput || !qtyInput || !resultEl) {
    console.error('Required trading elements not found');
    return;
  }
  
  const asset = assetInput.value.toUpperCase().trim();
  const qty = parseInt(qtyInput.value);
  const orderType = orderTypeSelect ? orderTypeSelect.value : 'market';
  
  // Validation
  if (!asset) {
    showTradeResult('Please enter an asset symbol', 'error');
    return;
  }
  
  if (!qty || qty <= 0) {
    showTradeResult('Please enter a valid quantity', 'error');
    return;
  }
  
  // Show processing state
  showTradeResult('Processing trade...', 'processing');
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Mock trade execution
    const tradeResult = await mockTradeExecution(asset, qty, type, orderType);
    
    if (tradeResult.success) {
      showTradeResult(tradeResult.message, 'success');
      updateOrderBook(tradeResult.order);
      clearTradeForm();
      updatePortfolioAfterTrade(tradeResult.order);
    } else {
      showTradeResult(tradeResult.message, 'error');
    }
    
  } catch (error) {
    console.error('Trade execution error:', error);
    showTradeResult('Error executing trade. Please try again.', 'error');
  }
}

async function mockTradeExecution(symbol, quantity, type, orderType) {
  // Simulate various trade outcomes
  const random = Math.random();
  
  // Check if symbol exists in our mock data
  if (!mockPrices[symbol]) {
    return {
      success: false,
      message: `Symbol ${symbol} not found. Available symbols: ${Object.keys(mockPrices).join(', ')}`
    };
  }
  
  const price = mockPrices[symbol];
  const totalValue = price * quantity;
  
  // Check available balance for BUY orders (mock check)
  if (type === 'BUY' && totalValue > 125000) { // Mock available balance
    return {
      success: false,
      message: `Insufficient balance. Required: ₹${totalValue.toLocaleString('en-IN')}, Available: ₹1,25,000`
    };
  }
  
  // Simulate success/failure (95% success rate)
  if (random > 0.95) {
    return {
      success: false,
      message: 'Trade failed due to market volatility. Please try again.'
    };
  }
  
  // Create order object
  const order = {
    id: generateOrderId(),
    symbol,
    quantity,
    type,
    orderType,
    price,
    totalValue,
    status: orderType === 'market' ? 'EXECUTED' : 'PENDING',
    timestamp: new Date(),
    executionTime: orderType === 'market' ? new Date() : null
  };
  
  // Add to order history
  orderHistory.unshift(order);
  
  return {
    success: true,
    message: `${type} order for ${quantity} ${symbol} ${order.status.toLowerCase()} at ₹${price.toLocaleString('en-IN')} (Total: ₹${totalValue.toLocaleString('en-IN')})`,
    order
  };
}

function showTradeResult(message, type) {
  const resultEl = document.getElementById('tradeResult');
  if (!resultEl) return;
  
  let className = 'text-info';
  let icon = 'fas fa-info-circle';
  
  switch(type) {
    case 'success':
      className = 'text-success';
      icon = 'fas fa-check-circle';
      break;
    case 'error':
      className = 'text-danger';
      icon = 'fas fa-exclamation-circle';
      break;
    case 'processing':
      className = 'text-warning';
      icon = 'fas fa-spinner fa-spin';
      break;
  }
  
  resultEl.className = `mt-3 ${className}`;
  resultEl.innerHTML = `<i class="${icon} me-2"></i>${message}`;
  
  // Auto-hide success/error messages after 5 seconds
  if (type !== 'processing') {
    setTimeout(() => {
      if (resultEl.textContent === message) {
        resultEl.textContent = '';
      }
    }, 5000);
  }
}

function updateOrderBook(order) {
  const orderBookTable = document.getElementById('orderBook');
  if (!orderBookTable) return;
  
  // Create new row
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><strong>${order.symbol}</strong></td>
    <td>${order.quantity}</td>
    <td>₹${order.price.toLocaleString('en-IN')}</td>
    <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
    <td>
      ${order.status === 'PENDING' ? 
        `<button class="btn btn-sm btn-outline-danger" onclick="cancelOrder('${order.id}')">Cancel</button>` :
        `<button class="btn btn-sm btn-outline-secondary" onclick="viewOrder('${order.id}')">View</button>`
      }
    </td>
  `;
  
  // Add to top of table
  orderBookTable.insertBefore(row, orderBookTable.firstChild);
  
  // Keep only last 10 orders visible
  while (orderBookTable.children.length > 10) {
    orderBookTable.removeChild(orderBookTable.lastChild);
  }
}

function getStatusBadgeClass(status) {
  switch(status) {
    case 'EXECUTED': return 'bg-success';
    case 'PENDING': return 'bg-warning';
    case 'CANCELLED': return 'bg-secondary';
    case 'REJECTED': return 'bg-danger';
    default: return 'bg-info';
  }
}

function clearTradeForm() {
  const assetInput = document.getElementById('tradeAsset');
  const qtyInput = document.getElementById('tradeQty');
  
  if (assetInput) assetInput.value = '';
  if (qtyInput) qtyInput.value = '';
}

function updatePortfolioAfterTrade(order) {
  // This would update the portfolio display in a real application
  console.log('Portfolio updated after trade:', order);
  
  // Trigger a portfolio refresh
  const event = new CustomEvent('portfolioUpdate', { detail: order });
  document.dispatchEvent(event);
}

function updateMockPrices() {
  Object.keys(mockPrices).forEach(symbol => {
    // Simulate price movement (-2% to +2%)
    const change = (Math.random() - 0.5) * 0.04;
    const newPrice = mockPrices[symbol] * (1 + change);
    mockPrices[symbol] = Math.max(Math.round(newPrice * 100) / 100, 1); // Minimum price of ₹1
  });
}

function generateOrderId() {
  return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Global functions for order management
window.cancelOrder = function(orderId) {
  const order = orderHistory.find(o => o.id === orderId);
  if (order) {
    order.status = 'CANCELLED';
    showTradeResult(`Order ${orderId} cancelled successfully`, 'success');
    
    // Update the UI
    const orderRows = document.querySelectorAll('#orderBook tr');
    orderRows.forEach(row => {
      if (row.innerHTML.includes(orderId)) {
        const statusCell = row.cells[3];
        statusCell.innerHTML = '<span class="badge bg-secondary">CANCELLED</span>';
        
        const actionCell = row.cells[4];
        actionCell.innerHTML = '<button class="btn btn-sm btn-outline-secondary" disabled>Cancelled</button>';
      }
    });
  }
};

window.viewOrder = function(orderId) {
  const order = orderHistory.find(o => o.id === orderId);
  if (order) {
    showOrderDetails(order);
  }
};

function showOrderDetails(order) {
  const modal = createOrderModal(order);
  document.body.appendChild(modal);
  
  // Show modal (using Bootstrap classes)
  modal.style.display = 'block';
  modal.classList.add('show');
  
  // Auto-remove modal after 10 seconds
  setTimeout(() => {
    if (modal.parentElement) {
      modal.remove();
    }
  }, 10000);
}

function createOrderModal(order) {
  const modal = document.createElement('div');
  modal.className = 'modal fade show';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;';
  
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content" style="background: var(--card-bg); color: var(--text-primary); border: 1px solid var(--border-color);">
        <div class="modal-header">
          <h5 class="modal-title">Order Details - ${order.id}</h5>
          <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
        </div>
        <div class="modal-body">
          <div class="row g-3">
            <div class="col-6"><strong>Symbol:</strong> ${order.symbol}</div>
            <div class="col-6"><strong>Quantity:</strong> ${order.quantity}</div>
            <div class="col-6"><strong>Type:</strong> ${order.type}</div>
            <div class="col-6"><strong>Order Type:</strong> ${order.orderType}</div>
            <div class="col-6"><strong>Price:</strong> ₹${order.price.toLocaleString('en-IN')}</div>
            <div class="col-6"><strong>Total Value:</strong> ₹${order.totalValue.toLocaleString('en-IN')}</div>
            <div class="col-6"><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></div>
            <div class="col-6"><strong>Order Time:</strong> ${order.timestamp.toLocaleString()}</div>
            ${order.executionTime ? `<div class="col-12"><strong>Execution Time:</strong> ${order.executionTime.toLocaleString()}</div>` : ''}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
        </div>
      </div>
    </div>
  `;
  
  // Close modal when clicking outside
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  return modal;
}

// Export functions for external use
export { mockPrices, orderHistory, updateMockPrices };