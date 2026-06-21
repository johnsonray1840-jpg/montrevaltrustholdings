document.addEventListener('DOMContentLoaded', function() {
    console.log('Signup script loaded');

    // Password toggle
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            const isPassword = input.getAttribute('type') === 'password';
            input.setAttribute('type', isPassword ? 'text' : 'password');
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    });

    // Password strength meter
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    if (passwordInput && strengthFill && strengthText) {
        passwordInput.addEventListener('input', function() {
            const val = this.value;
            let strength = 0;
            if (val.length >= 8) strength++;
            if (/[a-z]/.test(val)) strength++;
            if (/[A-Z]/.test(val)) strength++;
            if (/[0-9]/.test(val)) strength++;
            if (/[^a-zA-Z0-9]/.test(val)) strength++;
            const percent = (strength / 5) * 100;
            strengthFill.style.width = percent + '%';
            let color = 'transparent', text = '';
            if (val.length === 0) { color = 'transparent'; text = ''; }
            else if (strength <= 2) { color = 'var(--danger)'; text = 'Weak'; }
            else if (strength === 3) { color = 'var(--warning)'; text = 'Fair'; }
            else if (strength === 4) { color = 'var(--success)'; text = 'Strong'; }
            else { color = '#10b981'; text = 'Very Strong'; }
            strengthFill.style.background = color;
            strengthText.textContent = text;
            strengthText.style.color = color;
        });
    }

    // Confirm password match
    const confirmInput = document.getElementById('confirmPassword');
    if (confirmInput && passwordInput) {
        confirmInput.addEventListener('input', function() {
            if (this.value !== passwordInput.value) this.setCustomValidity('Passwords do not match');
            else this.setCustomValidity('');
        });
        passwordInput.addEventListener('input', function() {
            if (confirmInput.value) confirmInput.dispatchEvent(new Event('input'));
        });
    }
});
