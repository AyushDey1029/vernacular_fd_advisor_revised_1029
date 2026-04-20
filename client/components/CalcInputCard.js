/**
 * CalcInputCard.js — FD Calculation Input Form
 * Renders an attractive form to collect details for calculating FD returns.
 */

/**
 * Creates a calculation input card DOM element.
 * @param {object} options - { onSubmit, labels }
 * @returns {HTMLElement}
 */
export function renderCalcInputCard({ onSubmit, labels }) {
  const card = document.createElement('div');
  card.className = 'suggestion-card'; // Reusing the same attractive styles from suggestion-card

  card.innerHTML = `
    <div class="suggestion-card-header">
      <div class="suggestion-icon" style="background: rgba(34, 211, 160, 0.1); color: var(--accent-green);">🧮</div>
      <span class="suggestion-title" style="color: var(--accent-green);">${labels.title || 'Calculate Returns'}</span>
    </div>
    
    <div class="suggestion-form">
      <div class="input-group">
        <label class="input-label">${labels.amount || 'Investment Amount (₹)'}</label>
        <input type="text" id="calc-amount" class="attractive-input" placeholder="e.g. 1,00,000" maxlength="15">
      </div>
      
      <div class="input-group">
        <label class="input-label">${labels.tenure || 'Tenure (Years)'}</label>
        <input type="number" id="calc-tenure" class="attractive-input" placeholder="e.g. 2" min="0.5" max="20" step="0.5">
      </div>
      
      <div class="input-group">
        <label class="input-label">${labels.rate || 'Interest Rate (%)'}</label>
        <input type="number" id="calc-rate" class="attractive-input" placeholder="e.g. 7.5" min="1" max="15" step="0.1">
      </div>

      <button id="calc-submit" class="suggestion-submit" style="background: linear-gradient(135deg, var(--accent-green), #10b981); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
        <span>${labels.submit || 'Calculate'}</span>
      </button>
    </div>
  `;

  // --- Dynamic Interactions ---
  
  const amountInput = card.querySelector('#calc-amount');
  const submitBtn = card.querySelector('#calc-submit');

  // Format currency on typing
  amountInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value) {
      e.target.value = new Intl.NumberFormat('en-IN').format(parseInt(value));
    }
  });

  // Handle Submission
  submitBtn.addEventListener('click', async () => {
    const rawAmount = amountInput.value.replace(/\D/g, '');
    const tenure = card.querySelector('#calc-tenure').value;
    const rate = card.querySelector('#calc-rate').value;

    if (!rawAmount || !tenure || !rate) {
      alert(labels.error || 'Please fill all fields');
      return;
    }

    // Dynamic animation on click
    submitBtn.disabled = true;
    submitBtn.innerHTML = `✅ ${labels.done || 'Done'}`;
    
    card.style.opacity = '0.6';
    card.style.pointerEvents = 'none';

    // Submit details
    onSubmit({
      amount: parseInt(rawAmount),
      tenure: parseFloat(tenure),
      rate: parseFloat(rate)
    });
  });

  return card;
}
