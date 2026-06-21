(function() {
    console.log('✅ KYC script loaded');

    let currentStep = 1;
    const totalSteps = 5;

    function showStep(step) {
        console.log('➡️ Showing step:', step);
        document.querySelectorAll('.kyc-pane').forEach(p => p.classList.remove('active'));
        const activePane = document.querySelector('.kyc-pane[data-step="' + step + '"]');
        if (activePane) {
            activePane.classList.add('active');
        } else {
            console.error('❌ Pane not found for step:', step);
        }

        document.querySelectorAll('.kyc-step').forEach((s, idx) => {
            s.classList.remove('active', 'completed');
            if (idx + 1 < step) s.classList.add('completed');
            if (idx + 1 === step) s.classList.add('active');
        });

        currentStep = step;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (step === 5) updateReview();
    }

    function nextStep(e) {
        e.preventDefault();
        console.log('🔘 Next clicked, current step:', currentStep);
        if (currentStep < totalSteps) {
            showStep(currentStep + 1);
        }
    }

    function prevStep(e) {
        e.preventDefault();
        console.log('🔙 Back clicked, current step:', currentStep);
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    }

    function updateReview() {
        console.log('📋 Updating review summary');
        const getVal = (sel) => document.querySelector(sel)?.value || '—';
        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setText('reviewDob', getVal('input[name="dateOfBirth"]'));
        setText('reviewSsn', getVal('input[name="ssnLast4"]'));
        const idType = document.querySelector('select[name="idType"]');
        setText('reviewIdType', idType?.options[idType.selectedIndex]?.text || '—');
        setText('reviewIdNumber', getVal('input[name="idNumber"]'));
        const addr = [getVal('input[name="street"]'), getVal('input[name="city"]'), getVal('input[name="state"]'), getVal('input[name="zipCode"]')].filter(v => v !== '—').join(', ');
        setText('reviewAddress', addr || '—');
    }

    function setupPreview(inputId, previewId) {
        const input = document.getElementById(inputId);
        if (!input) {
            console.warn('⚠️ Input not found:', inputId);
            return;
        }
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = e => {
                    let img = document.getElementById(previewId);
                    if (!img) {
                        img = document.createElement('img');
                        img.id = previewId;
                        img.className = 'image-preview';
                        this.closest('.image-upload-area')?.parentNode.appendChild(img);
                    }
                    img.src = e.target.result;
                    img.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Wait for everything to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('🚀 Initializing KYC navigation...');

        const nextBtns = document.querySelectorAll('.next-step');
        const prevBtns = document.querySelectorAll('.prev-step');
        console.log(`Found ${nextBtns.length} next buttons, ${prevBtns.length} back buttons`);

        if (nextBtns.length === 0) {
            console.error('❌ No .next-step buttons found! Check HTML classes.');
        }

        nextBtns.forEach(btn => btn.addEventListener('click', nextStep));
        prevBtns.forEach(btn => btn.addEventListener('click', prevStep));

        // Upload triggers
        document.querySelectorAll('.upload-trigger').forEach(area => {
            area.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                if (targetId) {
                    console.log('📎 Triggering file input:', targetId);
                    document.getElementById(targetId)?.click();
                }
            });
        });

        // Image previews
        setupPreview('idFront', 'idFrontPreview');
        setupPreview('idBack', 'idBackPreview');
        setupPreview('selfie', 'selfiePreview');
        setupPreview('addressDoc', 'addressDocPreview');  


        // Submit button
        const confirmChk = document.getElementById('confirmKyc');
        const submitBtn = document.getElementById('submitBtn');
        if (confirmChk && submitBtn) {
            confirmChk.addEventListener('change', () => submitBtn.disabled = !confirmChk.checked);
        }
    }
})();