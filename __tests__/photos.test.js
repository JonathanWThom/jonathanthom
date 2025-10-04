/**
 * @jest-environment jsdom
 */

// Mock the DOM structure that photos.js expects
document.body.innerHTML = `
    <div class="photos" data-photos-container>
        <img src="/photos/optimized/img1.jpg" alt="Image 1" tabindex="0">
        <img src="/photos/optimized/img2.jpg" alt="Image 2" tabindex="0">
        <img src="/photos/optimized/img3.jpg" alt="Image 3" tabindex="0">
    </div>
    <div id="lightbox" class="lightbox" role="dialog" aria-modal="true" data-lightbox>
        <span class="close" aria-label="Close" data-lightbox-close tabindex="0">&times;</span>
        <img class="lightbox-content" id="lightbox-img" alt="" data-lightbox-img tabindex="0">
    </div>
`;

// Re-declaring the content of photos.js for testing purposes
const lightbox = document.querySelector('[data-lightbox]');
const lightboxImg = document.querySelector('[data-lightbox-img]');
const closeBtn = document.querySelector('[data-lightbox-close]');
const photosContainer = document.querySelector('[data-photos-container]');
const images = photosContainer.querySelectorAll('img');
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
    lightbox.classList.add('lightbox-open');
    currentIndex = Array.from(images).indexOf(image);
    showImage(currentIndex);
    closeBtn.focus();

    document.addEventListener('keydown', handleKeyDown);
}

function closeLightbox() {
    lightbox.classList.remove('lightbox-open');
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

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    }
}

// Mock event listeners for testing
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


describe('Lightbox functionality', () => {
    let initialFocusedElement;

    beforeEach(() => {
        // Save the initial active element before each test
        initialFocusedElement = document.activeElement;

        // Reset DOM and re-import/re-evaluate script before each test
        document.body.innerHTML = `
            <div class="photos" data-photos-container>
                <img src="/photos/optimized/img1.jpg" alt="Image 1" tabindex="0">
                <img src="/photos/optimized/img2.jpg" alt="Image 2" tabindex="0">
                <img src="/photos/optimized/img3.jpg" alt="Image 3" tabindex="0">
            </div>
            <div id="lightbox" class="lightbox" role="dialog" aria-modal="true" data-lightbox>
                <span class="close" aria-label="Close" data-lightbox-close tabindex="0">&times;</span>
                <img class="lightbox-content" id="lightbox-img" alt="" data-lightbox-img tabindex="0">
            </div>
        `;
        // Re-query elements after DOM reset
        Object.assign(global, {
            lightbox: document.querySelector('[data-lightbox]'),
            lightboxImg: document.querySelector('[data-lightbox-img]'),
            closeBtn: document.querySelector('[data-lightbox-close]'),
            photosContainer: document.querySelector('[data-photos-container]'),
            images: document.querySelectorAll('.photos img'),
            focusedElementBeforeModal: undefined,
            currentIndex: undefined,
        });
        // Ensure the initial focused element is something that can receive focus
        // For example, focus the first image thumbnail
        images[0].focus();
    });

    afterEach(() => {
        // Restore initial focus after each test
        if (initialFocusedElement && typeof initialFocusedElement.focus === 'function') {
            initialFocusedElement.focus();
        }
    });


    test('showImage updates lightbox content correctly', () => {
        showImage(0);
        expect(lightboxImg.src).toContain('/photos/img1.jpg');
        expect(lightboxImg.alt).toBe('Image 1');

        showImage(1);
        expect(lightboxImg.src).toContain('/photos/img2.jpg');
        expect(lightboxImg.alt).toBe('Image 2');
    });

    test('showImage cycles to the last image when index is less than 0', () => {
        showImage(-1);
        expect(lightboxImg.src).toContain('/photos/img3.jpg');
        expect(lightboxImg.alt).toBe('Image 3');
    });

    test('showImage cycles to the first image when index is greater than or equal to images length', () => {
        showImage(3);
        expect(lightboxImg.src).toContain('/photos/img1.jpg');
        expect(lightboxImg.alt).toBe('Image 1');
    });

    test('openLightbox displays lightbox and sets focus', () => {
        const firstImage = images[0];
        const closeBtnFocusSpy = jest.spyOn(closeBtn, 'focus');
        firstImage.focus(); // Simulate focusing the image before opening lightbox

        openLightbox(firstImage);

        expect(lightbox.classList.contains('lightbox-open')).toBe(true);
        expect(lightboxImg.src).toContain('/photos/img1.jpg');
        expect(lightboxImg.alt).toBe('Image 1');
        expect(closeBtnFocusSpy).toHaveBeenCalled();
        closeBtnFocusSpy.mockRestore();
    });

    test('closeLightbox hides lightbox and restores focus', () => {
        const firstImage = images[0];
        const firstImageFocusSpy = jest.spyOn(firstImage, 'focus');
        firstImage.focus();
        openLightbox(firstImage); // Open it first

        closeLightbox();

        expect(lightbox.classList.contains('lightbox-open')).toBe(false);
        expect(firstImageFocusSpy).toHaveBeenCalled();
        firstImageFocusSpy.mockRestore();
    });

    test('Escape key closes lightbox', () => {
        const firstImage = images[0];
        firstImage.focus();
        openLightbox(firstImage);

        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);

        expect(lightbox.classList.contains('lightbox-open')).toBe(false);
    });

    test('ArrowRight key shows next image', () => {
        const firstImage = images[0];
        firstImage.focus();
        openLightbox(firstImage); // Current index is 0

        const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        document.dispatchEvent(arrowRightEvent);

        expect(lightboxImg.src).toContain('/photos/img2.jpg');
        expect(lightboxImg.alt).toBe('Image 2');
    });

    test('ArrowLeft key shows previous image', () => {
        const secondImage = images[1];
        secondImage.focus();
        openLightbox(secondImage); // Current index is 1

        const arrowLeftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        document.dispatchEvent(arrowLeftEvent);

        expect(lightboxImg.src).toContain('/photos/img1.jpg');
        expect(lightboxImg.alt).toBe('Image 1');
    });

    test('Clicking close button closes lightbox', () => {
        const firstImage = images[0];
        openLightbox(firstImage);

        closeBtn.click();

        expect(lightbox.classList.contains('lightbox-open')).toBe(false);
    });

    test('Clicking outside lightbox content closes lightbox', () => {
        const firstImage = images[0];
        openLightbox(firstImage);

        lightbox.click(); // Simulate click on the lightbox overlay itself

        expect(lightbox.classList.contains('lightbox-open')).toBe(false);
    });

    test('Clicking on image inside lightbox does not close lightbox', () => {
        const firstImage = images[0];
        openLightbox(firstImage);

        lightboxImg.click(); // Simulate click on the image inside lightbox

        expect(lightbox.classList.contains('lightbox-open')).toBe(true);
    });

    test('Clicking on thumbnail opens lightbox', () => {
        const firstImage = images[0];
        firstImage.click();

        expect(lightbox.classList.contains('lightbox-open')).toBe(true);
        expect(lightboxImg.src).toContain('/photos/img1.jpg');
    });

    test('Enter key on thumbnail opens lightbox', () => {
        const firstImage = images[0];
        firstImage.focus();
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        firstImage.dispatchEvent(enterEvent);

        expect(lightbox.classList.contains('lightbox-open')).toBe(true);
        expect(lightboxImg.src).toContain('/photos/img1.jpg');
    });

    test('Space key on thumbnail opens lightbox', () => {
        const firstImage = images[0];
        firstImage.focus();
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
        firstImage.dispatchEvent(spaceEvent);

        expect(lightbox.classList.contains('lightbox-open')).toBe(true);
        expect(lightboxImg.src).toContain('/photos/img1.jpg');
    });

    test('Tab key cycles focus within lightbox (forward)', () => {
        const firstImage = images[0];

        const originalFocus = HTMLElement.prototype.focus;
        let activeEl = document.body;

        const focusMock = jest.fn(function() {
            activeEl = this;
            originalFocus.call(this);
        });
        HTMLElement.prototype.focus = focusMock;

        Object.defineProperty(document, 'activeElement', {
            configurable: true,
            get: () => activeEl
        });

        openLightbox(firstImage);

        focusMock.mockClear();

        lightboxImg.focus();
        expect(document.activeElement).toBe(lightboxImg);

        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        document.dispatchEvent(tabEvent);

        expect(document.activeElement).toBe(closeBtn);

        HTMLElement.prototype.focus = originalFocus;
    });

    test('Shift+Tab key cycles focus within lightbox (backward)', () => {
        const firstImage = images[0];

        const originalFocus = HTMLElement.prototype.focus;
        let activeEl = document.body;

        const focusMock = jest.fn(function() {
            activeEl = this;
            originalFocus.call(this);
        });
        HTMLElement.prototype.focus = focusMock;

        Object.defineProperty(document, 'activeElement', {
            configurable: true,
            get: () => activeEl
        });

        openLightbox(firstImage);

        focusMock.mockClear();

        closeBtn.focus();
        expect(document.activeElement).toBe(closeBtn);

        const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
        document.dispatchEvent(shiftTabEvent);

        expect(document.activeElement).toBe(lightboxImg);

        HTMLElement.prototype.focus = originalFocus;
    });
});