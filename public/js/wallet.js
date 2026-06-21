document.addEventListener('DOMContentLoaded', function () {
  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const address = this.getAttribute('data-address');
      navigator.clipboard.writeText(address).then(() => alert('Address copied'));
    });
  });

  // Receive modal
  const receiveModal = document.getElementById('receiveModal');
  const closeReceiveBtn = document.getElementById('closeReceiveModal');

  document.querySelectorAll('.receive-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const chain = this.getAttribute('data-chain');
      const address = this.getAttribute('data-address');
      const qr = this.getAttribute('data-qr');
      document.getElementById('modalChain').textContent = chain;
      document.getElementById('modalQr').src = qr;
      document.getElementById('modalAddress').textContent = address;
      if (receiveModal) receiveModal.style.display = 'flex';
    });
  });

  // Withdrawal modal
  const withdrawModal = document.getElementById('withdrawModal');
  const showWithdrawBtn = document.getElementById('showWithdrawModal');
  if (showWithdrawBtn && withdrawModal) {
    showWithdrawBtn.addEventListener('click', () => {
      withdrawModal.style.display = 'flex';
    });
  }

  // ---- UNIVERSAL CLOSE HANDLERS ----
  // 1. All elements with class "close-modal-btn" (Cancel buttons)
  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const modal = this.closest('.receive-modal');
      if (modal) modal.style.display = 'none';
    });
  });

  // 2. Specific close button for receive modal (kept for compatibility)
  if (closeReceiveBtn) {
    closeReceiveBtn.addEventListener('click', function () {
      if (receiveModal) receiveModal.style.display = 'none';
    });
  }

  // 3. Click outside modal to close (works for all modals with class "receive-modal")
  document.querySelectorAll('.receive-modal').forEach(modal => {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.style.display = 'none';
    });
  });
});