const CV_LINKS = {
    en: 'https://drive.google.com/file/d/1UOhK4xDzmFq4bRrPBnx3FFA-qJAHE_NO/view?usp=drive_link',
    pt: 'https://drive.google.com/file/d/1a__rsk0Nmi1t7kQWMrKVzzs_W0ysLR26/view?usp=drive_link',
    es: 'https://drive.google.com/file/d/1tMGwzcvhm7dEnYzg5O_BZVcG1K23xDCc/view?usp=drive_link',
};

function openCV() {
    const lang = document.documentElement.lang || 'en';
    const url = CV_LINKS[lang] ?? CV_LINKS['en'];
    window.open(url, '_blank', 'noopener,noreferrer');
}

document.querySelectorAll('.cv-trigger').forEach(btn => {
    btn.addEventListener('click', openCV);
});