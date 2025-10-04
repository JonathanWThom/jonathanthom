const lightbox = document.querySelector('[data-lightbox]');
const lightboxImg = document.querySelector('[data-lightbox-img]');
const closeBtn = document.querySelector('[data-lightbox-close]');
const photosContainer = document.querySelector('[data-photos-container]');
const images = photosContainer.querySelectorAll('img');

let focusedElementBeforeModal = null;
let currentIndex = 0;

function showImage(index) {
    if (index < 0) {
        currentIndex = images.length - 1;
    } else if (index >= images.length) {
        currentIndex = 0;
    } else {
        currentIndex = index;
    }
    const image = images[currentIndex];
    const filename = image.src.split('/').pop();
    lightboxImg.src = '/photos/' + filename;
    lightboxImg.alt = image.alt;
}

function openLightbox(image) {
    focusedElementBeforeModal = document.activeElement;
    lightbox.classList.add('lightbox-open');
    currentIndex = Array.from(images).indexOf(image);
    showImage(currentIndex);
    closeBtn.focus();

    document.addEventListener('keydown', handleKeyDown);
}

function closeLightbox() {
    lightbox.classList.remove('lightbox-open');
    lightboxImg.src = '';
    lightboxImg.alt = '';

    if (focusedElementBeforeModal) {
        focusedElementBeforeModal.focus();
    }

    document.removeEventListener('keydown', handleKeyDown);
}

function handleKeyDown(e) {
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowRight') {
        showImage(currentIndex + 1);
    } else if (e.key === 'ArrowLeft') {
        showImage(currentIndex - 1);
    } else if (e.key === 'Tab') {
        const focusableElements = lightbox.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    }
}

photosContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG' && e.target.closest('[data-photos-container]')) {
        openLightbox(e.target);
    }
});

photosContainer.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.tagName === 'IMG' && e.target.closest('[data-photos-container]')) {
        e.preventDefault();
        openLightbox(e.target);
    }
});

closeBtn.addEventListener('click', () => {
    closeLightbox();
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});