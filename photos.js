const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.getElementsByClassName('close')[0];
const images = document.querySelectorAll('.photos img');
let focusedElementBeforeModal;
let currentIndex;

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
    lightbox.style.display = 'block';
    currentIndex = Array.from(images).indexOf(image);
    showImage(currentIndex);
    closeBtn.focus();

    document.addEventListener('keydown', handleKeyDown);
}

function closeLightbox() {
    lightbox.style.display = 'none';
    focusedElementBeforeModal.focus();
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

images.forEach(image => {
    image.addEventListener('click', () => {
        openLightbox(image);
    });
    image.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(image);
        }
    });
});

closeBtn.addEventListener('click', () => {
    closeLightbox();
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});