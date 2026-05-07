const darkToggle = document.getElementById('dark-toggle');
const icon = darkToggle.querySelector('i');

function updateIcon(isDark) {
    const existing = darkToggle.querySelector('svg') || darkToggle.querySelector('i');
    const newIcon = document.createElement('i');
    newIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

    if (existing) {
        darkToggle.replaceChild(newIcon, existing);
    } else {
        darkToggle.appendChild(newIcon);
    }
}
darkToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('dark-mode', isDark);
    updateIcon(isDark);
    localStorage.setItem('darkMode', isDark);
});

// inicialização
const isInitiallyDark = document.documentElement.classList.contains('dark-mode');
if (isInitiallyDark) {
    document.body.classList.add('dark-mode');
}
updateIcon(isInitiallyDark);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem('darkMode') !== null) return;
    const isDark = e.matches;
    document.body.classList.toggle('dark-mode', isDark);
    document.documentElement.classList.toggle('dark-mode', isDark);
    updateIcon(isDark);
});