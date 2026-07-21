const overlay = document.getElementById('about-modal-overlay');
const closeBtn = document.getElementById('about-modal-close');
const expandableCards = document.querySelectorAll('.about-card--expandable');

let lastFocusedCard = null;

function openModal(id) {
    document.querySelectorAll('.about-modal-content').forEach(el => {
        el.hidden = true;
    });

    const target = document.getElementById('modal-' + id);
    if (!target) return;

    target.hidden = false;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
        closeBtn.focus({ preventScroll: true });
    });

    expandableCards.forEach(card => {
        card.setAttribute('aria-expanded', card.dataset.modal === id ? 'true' : 'false');
    });
}

function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');

    expandableCards.forEach(card => card.setAttribute('aria-expanded', 'false'));

    if (lastFocusedCard) {
        lastFocusedCard.focus({ preventScroll: true });
        lastFocusedCard = null;
    }
}

expandableCards.forEach(card => {
    card.addEventListener('click', () => {
        lastFocusedCard = card;
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