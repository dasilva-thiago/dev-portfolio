const contrastToggle = document.getElementById('contrast-toggle');

contrastToggle.addEventListener('click', () => {
    // toggle high contrast class on both body and html elements
    const isContrast = document.body.classList.toggle('high-contrast');
    document.documentElement.classList.toggle('high-contrast', isContrast);
    
    // saves user preference in localStorage
    localStorage.setItem('highContrast', isContrast);
});

// based on the initial state of the html element, set the body class to match
const isInitiallyContrast = document.documentElement.classList.contains('high-contrast');
if (isInitiallyContrast) {
    document.body.classList.add('high-contrast');
}