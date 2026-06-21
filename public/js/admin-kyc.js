document.addEventListener('DOMContentLoaded', function() {
    // Reject modal controls
    var rejectModal = document.getElementById('rejectModal');
    var showRejectBtn = document.getElementById('showRejectBtn');
    var hideRejectBtn = document.getElementById('hideRejectBtn');

    if (showRejectBtn && rejectModal) {
        showRejectBtn.addEventListener('click', function() {
            rejectModal.style.display = 'flex';
        });
    }
    if (hideRejectBtn && rejectModal) {
        hideRejectBtn.addEventListener('click', function() {
            rejectModal.style.display = 'none';
        });
    }

    // Delete confirmation (just log; form submit handles it)
    var deleteBtn = document.getElementById('deleteKycBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            if (!confirm('Delete this KYC? User will need to resubmit.')) {
                e.preventDefault();
            }
        });
    }
});
