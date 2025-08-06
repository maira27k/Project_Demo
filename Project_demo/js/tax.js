// Tax Calculator Module

export function initializeTaxCalculator() {
    const taxBtn = document.getElementById('taxBtn');
    
    if (taxBtn) {
      taxBtn.addEventListener('click', calculateTax);
    }
    
    // Add input event listeners for real-time calculation
    const inputs = ['capGains', 'ltcgGains', 'dividends'];
    inputs.forEach(inputId => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('input', debounce(calculateTax, 500));
      }
    });
    
    console.log('Tax calculator initialized');
  }
  
  function calculateTax() {
    try {
      // Get input values
      const stcgGains = parseFloat(document.getElementById('capGains')?.value) || 0;
      const ltcgGains = parseFloat(document.getElementById('ltcgGains')?.value) || 0;
      const dividends = parseFloat(document.getElementById('dividends')?.value) || 0;
  
      // Indian tax rates (as of 2024)
      const STCG_RATE = 0.15; // 15% for STCG on equity
      const LTCG_RATE = 0.10; // 10% for LTCG above ₹1 lakh on equity
      const DIVIDEND_RATE = 0.30; // 30% (assuming highest tax slab)
      const LTCG_EXEMPTION = 100000; // ₹1 lakh exemption for LTCG
  
      // Calculate taxes
      const stcgTax = stcgGains * STCG_RATE;
      const ltcgTaxable = Math.max(ltcgGains - LTCG_EXEMPTION, 0);
      const ltcgTax = ltcgTaxable * LTCG_RATE;
      const divTax = dividends * DIVIDEND_RATE;
      const totalTax = stcgTax + ltcgTax + divTax;
  
      // Update UI
      updateTaxResults({
        stcgTax,
        ltcgTax,
        divTax,
        totalTax,
        ltcgExemption: LTCG_EXEMPTION
      });
  
      // Show additional tax information
      showTaxBreakdown({
        stcgGains,
        ltcgGains,
        dividends,
        ltcgTaxable,
        ltcgExemption: LTCG_EXEMPTION
      });
  
    } catch (error) {
      console.error('Error calculating tax:', error);
      showTaxError('Error calculating tax. Please check your inputs.');
    }
  }
  
  function updateTaxResults(taxes) {
    const elements = {
      stcgTax: document.getElementById('stcgTax'),
      ltcgTax: document.getElementById('ltcgTax'),
      divTax: document.getElementById('divTax'),
      totalTax: document.getElementById('totalTax')
    };
  
    Object.keys(elements).forEach(key => {
      if (elements[key]) {
        elements[key].textContent = `₹${taxes[key].toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
      }
    });
  
    // Add visual feedback for total tax
    const totalTaxElement = elements.totalTax;
    if (totalTaxElement) {
      totalTaxElement.parentElement.className = taxes.totalTax > 50000 ? 
        'mb-0 text-danger fw-bold' : 'mb-0 text-success fw-bold';
    }
  }
  
  function showTaxBreakdown(data) {
    // Create or update tax breakdown section
    let breakdownDiv = document.getElementById('taxBreakdown');
    
    if (!breakdownDiv) {
      breakdownDiv = document.createElement('div');
      breakdownDiv.id = 'taxBreakdown';
      breakdownDiv.className = 'mt-3 p-3 border rounded';
      
      const taxResultDiv = document.getElementById('taxResult');
      if (taxResultDiv) {
        taxResultDiv.appendChild(breakdownDiv);
      }
    }
  
    const exemptionUsed = Math.min(data.ltcgGains, data.ltcgExemption);
    
    breakdownDiv.innerHTML = `
      <h6 class="text-primary mb-3">Tax Calculation Breakdown</h6>
      <div class="row g-3">
        <div class="col-md-6">
          <div class="small">
            <strong>Short Term Capital Gains:</strong><br>
            Amount: ₹${data.stcgGains.toLocaleString('en-IN')}<br>
            Tax Rate: 15%<br>
            <span class="text-primary">Tax: ₹${(data.stcgGains * 0.15).toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div class="col-md-6">
          <div class="small">
            <strong>Long Term Capital Gains:</strong><br>
            Total LTCG: ₹${data.ltcgGains.toLocaleString('en-IN')}<br>
            Exemption Used: ₹${exemptionUsed.toLocaleString('en-IN')}<br>
            Taxable LTCG: ₹${data.ltcgTaxable.toLocaleString('en-IN')}<br>
            Tax Rate: 10%<br>
            <span class="text-primary">Tax: ₹${(data.ltcgTaxable * 0.10).toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div class="col-12">
          <div class="small">
            <strong>Dividend Income:</strong><br>
            Amount: ₹${data.dividends.toLocaleString('en-IN')}<br>
            Tax Rate: 30% (assumed highest slab)<br>
            <span class="text-primary">Tax: ₹${(data.dividends * 0.30).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
      <div class="alert alert-info mt-3 small">
        <i class="fas fa-info-circle me-2"></i>
        <strong>Note:</strong> This is an approximate calculation. Actual tax may vary based on your income slab, 
        deductions, and current tax laws. Please consult a tax advisor for accurate calculations.
      </div>
    `;
  }
  
  function showTaxError(message) {
    const taxResultDiv = document.getElementById('taxResult');
    if (taxResultDiv) {
      taxResultDiv.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          ${message}
        </div>
      `;
    }
  }
  
  // Tax saving suggestions
  export function showTaxSavingSuggestions() {
    const suggestions = [
      {
        title: 'Hold for Long Term',
        description: 'Hold equity investments for more than 1 year to benefit from LTCG tax rates (10%) instead of STCG (15%)',
        potential: 'Save up to 5% on capital gains'
      },
      {
        title: 'Utilize LTCG Exemption',
        description: 'First ₹1 lakh of long-term capital gains on equity is tax-free each financial year',
        potential: 'Save up to ₹10,000 annually'
      },
      {
        title: 'Tax Loss Harvesting',
        description: 'Book losses to offset capital gains and reduce your overall tax liability',
        potential: 'Reduce taxable gains significantly'
      },
      {
        title: 'SIP Investments',
        description: 'Systematic investments help in rupee cost averaging and better tax planning',
        potential: 'Better tax-efficient returns'
      }
    ];
  
    // This could be displayed in a modal or separate section
    return suggestions;
  }
  
  // Export tax rates for use in other modules
  export const TAX_RATES = {
    STCG_EQUITY: 0.15,
    LTCG_EQUITY: 0.10,
    LTCG_EXEMPTION: 100000,
    DIVIDEND: 0.30, // Highest slab assumption
    DEBT_STCG: 0.30, // As per income slab
    DEBT_LTCG: 0.20  // With indexation benefit
  };
  
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