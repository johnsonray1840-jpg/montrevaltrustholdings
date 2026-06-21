document.addEventListener('DOMContentLoaded', function () {
  // Reject modal
  var modal = document.getElementById('rejectModal');
  var rejectForm = document.getElementById('rejectForm');
  document.querySelectorAll('.show-reject-modal').forEach(btn => {
    btn.addEventListener('click', function () {
      var id = this.getAttribute('data-id');
      rejectForm.action = '/admin/withdrawals/' + id + '/reject';
      if (modal) modal.style.display = 'flex';
    });
  });
  document.querySelectorAll('.close-modal-btn').forEach(b => b.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  }));
  // Approve confirmation already handled by class approve-app from admin-applications.js? We'll add a small confirm in this script
  document.querySelectorAll('.approve-app').forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (!confirm('Approve this withdrawal?')) e.preventDefault();
    });
  });
});
