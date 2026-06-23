const heroSection = document.querySelector('.hero-section');

if (heroSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                document.body.classList.add('scrolled-past-hero');
            } else {
                document.body.classList.remove('scrolled-past-hero');
            }
        });
    }, {
        threshold: 0
    });

    observer.observe(heroSection);
}