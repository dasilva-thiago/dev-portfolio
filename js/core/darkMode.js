const darkToggle = document.getElementById('dark-toggle');
const themeColorMeta = document.getElementById('theme-color-meta');

const THEME_COLORS = {
    light: '#4a76ee', // --link-color light mode
    dark:  '#7a9ff5', // --link-color dark mode
};

function updateThemeColor(isDark) {
    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isDark ? THEME_COLORS.dark : THEME_COLORS.light);
    }
}

function updateIcon(isDark) {
    const existing = darkToggle.querySelector('svg') || darkToggle.querySelector('i');
    const newIcon = document.createElement('i');
    newIcon.className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
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
    updateThemeColor(isDark);
    localStorage.setItem('darkMode', isDark);
});

const isInitiallyDark = document.documentElement.classList.contains('dark-mode');
if (isInitiallyDark) {
    document.body.classList.add('dark-mode');
}
updateIcon(isInitiallyDark);
updateThemeColor(isInitiallyDark);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem('darkMode') !== null) return;
    const isDark = e.matches;
    document.body.classList.toggle('dark-mode', isDark);
    document.documentElement.classList.toggle('dark-mode', isDark);
    updateIcon(isDark);
    updateThemeColor(isDark);
});