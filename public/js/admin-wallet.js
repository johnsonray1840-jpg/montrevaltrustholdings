document.addEventListener('DOMContentLoaded', function () {
  // Open modals
  document.querySelectorAll('.open-modal-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      var modalId = this.getAttribute('data-modal');
      var modal = document.getElementById(modalId);
      if (modal) modal.style.display = 'flex';
    });
  });

  // Close modals (button or outside click)
  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      var modal = this.closest('.modal');
      if (modal) modal.style.display = 'none';
    });
  });
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.style.display = 'none';
    });
  });

  // Adjust balance modal
const adjustModal = document.getElementById('adjustModal');
const adjustForm = document.getElementById('adjustForm');
const reasonGroup = document.getElementById('reasonGroup');
const adjustReason = document.getElementById('adjustReason');
const operationSelect = adjustForm?.querySelector('select[name="operation"]');

document.querySelectorAll('.adjust-balance-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const walletId = this.getAttribute('data-wallet-id');
    adjustForm.action = `/admin/wallet/adjust/${walletId}`;
    if (adjustModal) adjustModal.style.display = 'flex';
  });
});

// Toggle reason requirement
if (operationSelect) {
  operationSelect.addEventListener('change', function () {
    if (this.value === 'add') {
      adjustReason.setAttribute('required', '');
      reasonGroup.querySelector('label span').style.display = 'inline';
    } else {
      adjustReason.removeAttribute('required');
      reasonGroup.querySelector('label span').style.display = 'none';
    }
  });
}

  // View phrase: populate view modal
  document.querySelectorAll('.view-phrase-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.getElementById('viewPhrase').textContent = this.getAttribute('data-phrase') || '';
      document.getElementById('viewBtc').textContent = this.getAttribute('data-btc') || '';
      document.getElementById('viewEth').textContent = this.getAttribute('data-eth') || '';
      document.getElementById('viewUsdt').textContent = this.getAttribute('data-usdt') || '';
      document.getElementById('viewXrp').textContent = this.getAttribute('data-xrp') || '';
      document.getElementById('viewBnb').textContent = this.getAttribute('data-bnb') || '';
      var modal = document.getElementById('viewModal');
      if (modal) modal.style.display = 'flex';
    });
  });

  // Delete confirmation
  document.querySelectorAll('.delete-phrase-form').forEach(form => {
    form.addEventListener('submit', function (e) {
      if (!confirm('Delete this phrase permanently?')) e.preventDefault();
    });
  });
});
