const lightbox = document.querySelector('[data-lightbox]');
const lightboxImg = document.querySelector('[data-lightbox-img]');
const closeBtn = document.querySelector('[data-lightbox-close]');
const photosContainer = document.querySelector('[data-photos-container]');
const images = photosContainer.querySelectorAll('img');
const announcement = document.querySelector('[data-lightbox-announcement]');

let focusedElementBeforeModal = null;
let currentIndex = 0;

function getFullSizeSrc(image) {
    const src = image.currentSrc || image.src;
    const filename = src.split('/').pop();
    return '/photos/' + filename;
}

function preloadAdjacentImages(index) {
    const nextIndex = (index + 1) % images.length;
    const nextImage = new Image();
    nextImage.src = getFullSizeSrc(images[nextIndex]);

    const prevIndex = index - 1 < 0 ? images.length - 1 : index - 1;
    const prevImage = new Image();
    prevImage.src = getFullSizeSrc(images[prevIndex]);
}

function showImage(index) {
    if (index < 0) {
        currentIndex = images.length - 1;
    } else if (index >= images.length) {
        currentIndex = 0;
    } else {
        currentIndex = index;
    }
    const image = images[currentIndex];
    lightboxImg.src = getFullSizeSrc(image);
    lightboxImg.alt = image.alt;

    lightboxImg.onerror = function() {
        lightboxImg.alt = 'Image failed to load. Please try again.';
        if (announcement) {
            announcement.textContent = 'Error loading image. Please try closing and reopening the lightbox.';
        }
    };

    if (announcement) {
        announcement.textContent = `Image ${currentIndex + 1} of ${images.length}: ${image.alt}`;
    }

    preloadAdjacentImages(currentIndex);
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

closeBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeLightbox();
    }
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});