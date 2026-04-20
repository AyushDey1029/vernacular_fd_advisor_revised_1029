/**
 * SuggestionCard.js — FD Suggestion Input Card
 * Renders an attractive form to collect investment details.
 */

/**
 * Creates a suggestion input card DOM element.
 * @param {object} options - { onSubmit, labels }
 * @returns {HTMLElement}
 */
export function renderSuggestionCard({ onSubmit, labels }) {
  const card = document.createElement('div');
  card.className = 'suggestion-card';

  card.innerHTML = `
    <div class="suggestion-card-header">
      <div class="suggestion-icon">💡</div>
      <span class="suggestion-title">${labels.title || 'FD Recommendation'}</span>
    </div>
    
    <div class="suggestion-form">
      <div class="input-group">
        <label class="input-label">${labels.amount || 'Investment Amount (₹)'}</label>
        <input type="text" id="sug-amount" class="attractive-input" placeholder="e.g. 1,00,000" maxlength="15">
      </div>
      
      <div class="input-group">
        <label class="input-label">${labels.tenure || 'Tenure (Years)'}</label>
        <input type="number" id="sug-tenure" class="attractive-input" placeholder="e.g. 2" min="1" max="10" step="0.5">
      </div>
      
      <div class="input-group">
        <label class="input-label">${labels.age || 'Your Age'}</label>
        <input type="number" id="sug-age" class="attractive-input" placeholder="e.g. 25" min="1" max="120">
      </div>

      <button id="sug-submit" class="suggestion-submit">
        <span>${labels.submit || 'Find Best FD'}</span>
      </button>
    </div>
  `;

  // --- Dynamic Interactions ---
  
  const amountInput = card.querySelector('#sug-amount');
  const submitBtn = card.querySelector('#sug-submit');

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
    const tenure = card.querySelector('#sug-tenure').value;
    const age = card.querySelector('#sug-age').value;

    if (!rawAmount || !tenure || !age) {
      alert(labels.error || 'Please fill all fields');
      return;
    }

    // Dynamic animation on click
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<div class="loading-spinner"></div> <span>Processing...</span>`;

    try {
      await onSubmit({
        amount: parseInt(rawAmount),
        tenure: parseFloat(tenure),
        age: parseInt(age)
      });
      
      // Optionally remove the card or show success
      card.style.opacity = '0.6';
      card.style.pointerEvents = 'none';
      submitBtn.innerHTML = `✅ ${labels.done || 'Done'}`;
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      alert(err.message);
    }
  });

  return card;
}
