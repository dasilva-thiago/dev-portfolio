const darkToggle = document.getElementById('dark-toggle');
const icon = darkToggle.querySelector('i');

function updateIcon(isDark) {
    icon.classList.toggle('fa-sun', isDark);
    icon.classList.toggle('fa-moon', !isDark);
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