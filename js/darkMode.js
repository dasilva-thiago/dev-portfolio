const darkToggle = document.getElementById('dark-toggle');
const icon = darkToggle.querySelector('i');

const isInitiallyDark = document.documentElement.classList.contains('dark-mode');

if (isInitiallyDark) {
    document.body.classList.add('dark-mode');
    icon.classList.replace('fa-moon', 'fa-sun');
}

darkToggle.addEventListener('click', () => {
  
    const isDark = document.body.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('dark-mode', isDark);

    icon.classList.replace(
        isDark ? 'fa-moon' : 'fa-sun',
        isDark ? 'fa-sun' : 'fa-moon'
    );
    localStorage.setItem('darkMode', isDark);
});