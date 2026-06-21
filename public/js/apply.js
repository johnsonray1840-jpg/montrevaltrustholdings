(function() {
    const steps = document.querySelectorAll('.step-pane');
    const stepItems = document.querySelectorAll('.step-item');
    let currentStep = 1;
    const totalSteps = 8;

    function showStep(step) {
        steps.forEach(p => p.classList.remove('active'));
        const pane = document.querySelector('.step-pane[data-step="' + step + '"]');
        if (pane) pane.classList.add('active');

        stepItems.forEach((item, idx) => {
            item.classList.remove('active', 'completed');
            if (idx + 1 < step) item.classList.add('completed');
            if (idx + 1 === step) item.classList.add('active');
        });

        currentStep = step;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        saveDraft();

        // Update summary when reaching step 8
        if (step === 8) updateSummary();
    }

    document.querySelectorAll('.next-step').forEach(b => {
        b.addEventListener('click', () => { if (currentStep < totalSteps) showStep(currentStep + 1); });
    });
    document.querySelectorAll('.prev-step').forEach(b => {
        b.addEventListener('click', () => { if (currentStep > 1) showStep(currentStep - 1); });
    });

    function saveDraft() {
        const form = document.getElementById('llcForm');
        if (!form) return;
        const fd = new FormData(form);
        const data = {};
        fd.forEach((v, k) => { if (!k.startsWith('idDocument') && !k.startsWith('addressProof')) data[k] = v; });
        fetch('/apply/save-draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(e => {});
    }

    document.querySelectorAll('#llcForm input, #llcForm select, #llcForm textarea').forEach(f => {
        f.addEventListener('change', saveDraft);
        f.addEventListener('input', function() {
            if (currentStep === 8) updateSummary();
        });
    });

    document.querySelectorAll('.plan-card input').forEach(r => {
        r.addEventListener('change', function() {
            document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
            this.closest('.plan-card').classList.add('selected');
            saveDraft();
            if (currentStep === 8) updateSummary();
        });
    });

    // ------- Summary Updater -------
    function updateSummary() {
        // Plan
        const planRadio = document.querySelector('input[name="planId"]:checked');
        const summaryPlan = document.getElementById('summaryPlan');
        const summaryPrice = document.getElementById('planPrice');
        if (planRadio && summaryPlan) {
            const planCard = planRadio.closest('.plan-card');
            const planName = planCard.querySelector('strong')?.innerText || '';
            const planPrice = planCard.querySelector('div span:last-child')?.innerText?.match(/\d+/) || [0];
            summaryPlan.textContent = planName;
            if (summaryPrice) summaryPrice.textContent = planPrice[0];
        }

        // LLC Name
        const llcName = document.querySelector('input[name="trustName"]')?.value;
        const summaryName = document.getElementById('summaryName');
        if (summaryName) summaryName.textContent = llcName || '—';

        // State
        const state = document.querySelector('select[name="state"]')?.value;
        const summaryState = document.getElementById('summaryState');
        if (summaryState) summaryState.textContent = state || '—';

        // Member
        const member = document.querySelector('input[name="memberName"]')?.value;
        const summaryMember = document.getElementById('summaryMember');
        if (summaryMember) summaryMember.textContent = member || '—';
    }
    // Initial call in case step 8 is visible on load
    if (currentStep === 8) updateSummary();

    // Prevent double submit
    const form = document.getElementById('llcForm');
    if (form) {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            }
        });
    }
})();