const CV_LINKS = {
    en: 'https://drive.google.com/file/d/1vNS3DdUoLXmWjCaGW1jwlL7wkwcYgS_h/view?usp=drive_link',
    pt: 'https://drive.google.com/file/d/1AenjuFP2L_emXYSSnc7XWO_PpPnCfs38/view?usp=drive_link',
    es: 'https://drive.google.com/file/d/1ZIuraVsYhbsz5QyXXTFOm1njuVFEIy2Y/view?usp=drive_link',
};

function openCV() {
    const lang = document.documentElement.lang || 'en';
    const url = CV_LINKS[lang] ?? CV_LINKS['en'];
    window.open(url, '_blank', 'noopener,noreferrer');
}

document.querySelectorAll('.cv-trigger').forEach(btn => {
    btn.addEventListener('click', openCV);
});