document.addEventListener('DOMContentLoaded', function () {
  // --- Checkbox logic to enable the submit button ---
  const checkboxes = document.querySelectorAll('#confirmSaved, #confirmUnderstand, #confirmNoScreenshot');
  const confirmBtn = document.getElementById('confirmBtn');

  function updateButton() {
    if (confirmBtn) {
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      confirmBtn.disabled = !allChecked;
    }
  }

  checkboxes.forEach(cb => cb.addEventListener('change', updateButton));
  updateButton(); // initial state

  // --- Copy phrase ---
  const copyPhraseBtn = document.getElementById('copyPhraseBtn');
  if (copyPhraseBtn) {
    copyPhraseBtn.addEventListener('click', function () {
      const phrase = this.getAttribute('data-phrase');
      navigator.clipboard.writeText(phrase).then(() => alert('Recovery phrase copied'));
    });
  }

  // --- Download phrase ---
  const downloadPhraseBtn = document.getElementById('downloadPhraseBtn');
  if (downloadPhraseBtn) {
    downloadPhraseBtn.addEventListener('click', function () {
      const phrase = this.getAttribute('data-phrase');
      const addresses = JSON.parse(this.getAttribute('data-addresses'));
      const content = `River Stone Wyoming Wallet\nRecovery Phrase:\n${phrase}\n\nAddresses:\nBTC: ${addresses.btc}\nETH: ${addresses.eth}\nUSDT: ${addresses.usdt}\nXRP: ${addresses.xrp}\nBNB: ${addresses.bnb}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'RiverStoneWyoming_wallet.txt';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // --- Copy individual address (used in the table) ---
  document.querySelectorAll('.copy-address-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const address = this.getAttribute('data-address');
      navigator.clipboard.writeText(address).then(() => alert('Address copied'));
    });
  });
});
