const overlay = document.getElementById('about-modal-overlay');
const closeBtn = document.getElementById('about-modal-close');
const expandableCards = document.querySelectorAll('.about-card--expandable');

function openModal(id) {
    document.querySelectorAll('.about-modal-content').forEach(el => {
        el.hidden = true;
    });

    const target = document.getElementById('modal-' + id);
    if (!target) return;

    target.hidden = false;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');

    const focusable = overlay.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();

    expandableCards.forEach(card => {
        if (card.dataset.modal === id) {
            card.setAttribute('aria-expanded', 'true');
        }
    });
}

function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');

    expandableCards.forEach(card => card.setAttribute('aria-expanded', 'false'));

    const activeCard = document.querySelector('.about-card--expandable[aria-expanded="false"]');
    if (activeCard) activeCard.focus();
}

expandableCards.forEach(card => {
    card.addEventListener('click', () => {
        openModal(card.dataset.modal);
    });
});

closeBtn.addEventListener('click', closeModal);

overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
});