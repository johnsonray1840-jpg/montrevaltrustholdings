document.addEventListener('DOMContentLoaded', function () {
  // Delete confirmation for any delete button with class "delete-app"
  document.querySelectorAll('.delete-app').forEach(btn => {
    btn.addEventListener('click', function (e) {
      if (!confirm('Permanently delete this application? This cannot be undone.')) {
        e.preventDefault();
      }
    });
  });

  // Approve confirmation for buttons with class "approve-app"
  document.querySelectorAll('.approve-app').forEach(btn => {
    btn.addEventListener('click', function (e) {
      if (!confirm('Approve this LLC application? An approval email will be sent to the user.')) {
        e.preventDefault();
      }
    });
  });

  // Reject modal handling
  var rejectModal = document.getElementById('rejectModal');
  var showRejectBtns = document.querySelectorAll('.show-reject-modal');
  var hideRejectBtns = document.querySelectorAll('.hide-reject-modal');

  showRejectBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      if (rejectModal) rejectModal.style.display = 'flex';
      var llcName = this.getAttribute('data-llc-name');
      var appId = this.getAttribute('data-app-id');
      var modalLLCName = document.getElementById('modalLLCName');
      var rejectForm = document.getElementById('rejectForm');
      if (modalLLCName) modalLLCName.textContent = llcName;
      if (rejectForm) rejectForm.action = '/admin/trusts/' + appId + '/reject';
    });
  });

  hideRejectBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      if (rejectModal) rejectModal.style.display = 'none';
    });
  });

  // Close modal when clicking outside (optional)
  if (rejectModal) {
    rejectModal.addEventListener('click', function (e) {
      if (e.target === rejectModal) rejectModal.style.display = 'none';
    });
  }
});
