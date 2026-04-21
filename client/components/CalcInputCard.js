import { getCalcCardHTML } from './CalcCard.js';

/**
 * CalcInputCard.js — FD Calculation Input Form
 * Renders an attractive form to collect details for calculating FD returns.
 */

/**
 * Creates a calculation input card DOM element.
 * @param {object} options - { onSubmit, labels, initialValues }
 * @returns {HTMLElement}
 */
export function renderCalcInputCard({ onSubmit, labels, initialValues = {} }) {
  const card = document.createElement('div');
  card.className = 'suggestion-card live-calculator'; // Added class for easier targeting

  const { amount = '', tenure = '', rate = '' } = initialValues;

  card.innerHTML = `
    <div class="suggestion-card-header">
      <div class="suggestion-icon" style="background: rgba(34, 211, 160, 0.1); color: var(--accent-green);">🧮</div>
      <span class="suggestion-title" style="color: var(--accent-green);">${labels.title || 'Calculator'}</span>
      <div class="live-indicator">● LIVE</div>
    </div>
    
    <div class="suggestion-form">
      <div class="input-grid">
        <div class="input-group">
          <label class="input-label">${labels.amount || 'Amount (₹)'}</label>
          <input type="text" id="calc-amount" class="attractive-input" placeholder="e.g. 1,00,000" maxlength="15" value="${amount}">
        </div>
        
        <div class="input-group">
          <label class="input-label">${labels.tenure || 'Years'}</label>
          <input type="number" id="calc-tenure" class="attractive-input" placeholder="e.g. 2" min="0.1" max="25" step="0.5" value="${tenure}">
        </div>
        
        <div class="input-group">
          <label class="input-label">${labels.rate || 'Rate (%)'}</label>
          <input type="number" id="calc-rate" class="attractive-input" placeholder="e.g. 7" min="1" max="15" step="0.1" value="${rate}">
        </div>
      </div>

      <div id="calc-result-container" class="calc-result-mini" style="display: none;">
        <!-- Results will be injected here live -->
      </div>
    </div>

    <style>
      .live-calculator { position: relative; }
      .live-indicator {
        margin-left: auto;
        font-size: 10px;
        color: var(--accent-green);
        font-weight: 700;
        letter-spacing: 1px;
        animation: blink 2s infinite;
      }
      @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      
      .input-grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr;
        gap: 10px;
      }
      
      .calc-result-mini {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px dashed rgba(255,255,255,0.1);
        animation: slide-up 0.3s ease;
      }
      
      @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      
      /* Reuse calc-card internal styles for the mini results */
      .calc-result-mini .calc-card-header { display: none; }
      .calc-result-mini .calc-rows { gap: 6px; }
      .calc-result-mini .calc-row { font-size: 13px; padding: 4px 0; }
    </style>
  `;

  // --- Core Elements ---
  const amountInput = card.querySelector('#calc-amount');
  const tenureInput = card.querySelector('#calc-tenure');
  const rateInput   = card.querySelector('#calc-rate');
  const resultContainer = card.querySelector('#calc-result-container');

  function updateCalculation() {
    const rawAmt = amountInput.value.replace(/\D/g, '');
    const amt = parseInt(rawAmt);
    const ten = parseFloat(tenureInput.value);
    const rat = parseFloat(rateInput.value);

    // Only show results if inputs are valid and > 0
    if (amt > 0 && ten > 0 && rat > 0) {
      const interest = (amt * ten * rat) / 100;
      const maturity = amt + interest;

      resultContainer.innerHTML = getCalcCardHTML({
        principal: amt,
        tenureYears: ten,
        rate: rat,
        interest: interest,
        maturity: maturity
      });
      resultContainer.style.display = 'block';
    } else {
      resultContainer.style.display = 'none';
    }
  }

  // --- Dynamic Interactions ---
  
  // Format currency on typing
  amountInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value) {
      e.target.value = new Intl.NumberFormat('en-IN').format(parseInt(value));
    }
    updateCalculation();
  });

  tenureInput.addEventListener('input', updateCalculation);
  rateInput.addEventListener('input', updateCalculation);

  // Initial update if values are provided
  if (amount || tenure || rate) {
    updateCalculation();
  }

  return card;
}
