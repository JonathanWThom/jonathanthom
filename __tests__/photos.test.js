import { describe, test, expect, beforeEach, afterEach, mock, spyOn } from 'bun:test';
import { JSDOM } from 'jsdom';

describe('Lightbox functionality', () => {
    let dom, document, lightbox, lightboxImg, closeBtn, photosContainer, images, announcement;
    let showImage, openLightbox, closeLightbox, handleKeyDown, preloadAdjacentImages;
    let currentIndex, focusedElementBeforeModal;

    beforeEach(() => {
        // Setup DOM using jsdom
        dom = new JSDOM(`<!DOCTYPE html>
            <body>
                <div class="photos" data-photos-container>
                    <img src="/photos/optimized/img1.jpg" alt="Image 1" tabindex="0">
                    <img src="/photos/optimized/img2.jpg" alt="Image 2" tabindex="0">
                    <img src="/photos/optimized/img3.jpg" alt="Image 3" tabindex="0">
                </div>
                <div id="lightbox" class="lightbox" role="dialog" aria-modal="true" data-lightbox>
                    <span class="close" aria-label="Close" data-lightbox-close tabindex="0">&times;</span>
                    <img class="lightbox-content" id="lightbox-img" alt="" data-lightbox-img tabindex="0">
                    <div class="sr-only" aria-live="polite" aria-atomic="true" data-lightbox-announcement></div>
                </div>
            </body>
        `, { url: 'http://localhost' });

        document = dom.window.document;

        // Get DOM elements
        lightbox = document.querySelector('[data-lightbox]');
        lightboxImg = document.querySelector('[data-lightbox-img]');
        closeBtn = document.querySelector('[data-lightbox-close]');
        photosContainer = document.querySelector('[data-photos-container]');
        images = photosContainer.querySelectorAll('img');
        announcement = document.querySelector('[data-lightbox-announcement]');

        currentIndex = 0;
        focusedElementBeforeModal = null;

        // Define functions (lightweight implementation for testing)
        preloadAdjacentImages = mock((index) => {
            const nextIndex = (index + 1) % images.length;
            const prevIndex = index - 1 < 0 ? images.length - 1 : index - 1;
            // Simulate preloading without actual network requests
        });

        showImage = (index) => {
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

            // Handle image loading errors
            lightboxImg.onerror = function() {
                lightboxImg.alt = 'Image failed to load. Please try again.';
                if (announcement) {
                    announcement.textContent = 'Error loading image. Please try closing and reopening the lightbox.';
                }
            };

            // Announce image change to screen readers
            if (announcement) {
                announcement.textContent = `Image ${currentIndex + 1} of ${images.length}: ${image.alt}`;
            }

            // Preload adjacent images for better performance
            preloadAdjacentImages(currentIndex);
        };

        openLightbox = (image) => {
            focusedElementBeforeModal = document.activeElement;
            lightbox.classList.add('lightbox-open');
            currentIndex = Array.from(images).indexOf(image);
            showImage(currentIndex);
            closeBtn.focus();
            document.addEventListener('keydown', handleKeyDown);
        };

        closeLightbox = () => {
            lightbox.classList.remove('lightbox-open');
            lightboxImg.src = '';
            lightboxImg.alt = '';
            if (focusedElementBeforeModal) {
                focusedElementBeforeModal.focus();
            }
            document.removeEventListener('keydown', handleKeyDown);
        };

        handleKeyDown = (e) => {
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
        };

        // Setup event listeners
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

        images[0].focus();
    });

    afterEach(() => {
        document.removeEventListener('keydown', handleKeyDown);
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
        const closeBtnFocusSpy = spyOn(closeBtn, 'focus');
        firstImage.focus();

        openLightbox(firstImage);

        expect(lightbox.classList.contains('lightbox-open')).toBe(true);
        expect(lightboxImg.src).toContain('/photos/img1.jpg');
        expect(lightboxImg.alt).toBe('Image 1');
        expect(closeBtnFocusSpy).toHaveBeenCalled();
    });

    test('closeLightbox hides lightbox and restores focus', () => {
        const firstImage = images[0];
        const firstImageFocusSpy = spyOn(firstImage, 'focus');
        firstImage.focus();
        openLightbox(firstImage);

        closeLightbox();

        expect(lightbox.classList.contains('lightbox-open')).toBe(false);
        expect(firstImageFocusSpy).toHaveBeenCalled();
    });

    test('Escape key closes lightbox', () => {
        const firstImage = images[0];
        firstImage.focus();
        openLightbox(firstImage);

        const escapeEvent = new dom.window.KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);

        expect(lightbox.classList.contains('lightbox-open')).toBe(false);
    });

    test('ArrowRight key shows next image', () => {
        const firstImage = images[0];
        firstImage.focus();
        openLightbox(firstImage);

        const arrowRightEvent = new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight' });
        document.dispatchEvent(arrowRightEvent);

        expect(lightboxImg.src).toContain('/photos/img2.jpg');
        expect(lightboxImg.alt).toBe('Image 2');
    });

    test('ArrowLeft key shows previous image', () => {
        const secondImage = images[1];
        secondImage.focus();
        openLightbox(secondImage);

        const arrowLeftEvent = new dom.window.KeyboardEvent('keydown', { key: 'ArrowLeft' });
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

        lightbox.click();

        expect(lightbox.classList.contains('lightbox-open')).toBe(false);
    });

    test('Clicking on image inside lightbox does not close lightbox', () => {
        const firstImage = images[0];
        openLightbox(firstImage);

        lightboxImg.click();

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
        const enterEvent = new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        firstImage.dispatchEvent(enterEvent);

        expect(lightbox.classList.contains('lightbox-open')).toBe(true);
        expect(lightboxImg.src).toContain('/photos/img1.jpg');
    });

    test('Space key on thumbnail opens lightbox', () => {
        const firstImage = images[0];
        firstImage.focus();
        const spaceEvent = new dom.window.KeyboardEvent('keydown', { key: ' ', bubbles: true });
        firstImage.dispatchEvent(spaceEvent);

        expect(lightbox.classList.contains('lightbox-open')).toBe(true);
        expect(lightboxImg.src).toContain('/photos/img1.jpg');
    });

    test('Enter key on close button closes lightbox', () => {
        const firstImage = images[0];
        openLightbox(firstImage);
        expect(lightbox.classList.contains('lightbox-open')).toBe(true);

        closeBtn.focus();
        const enterEvent = new dom.window.KeyboardEvent('keydown', { key: 'Enter' });
        closeBtn.dispatchEvent(enterEvent);

        expect(lightbox.classList.contains('lightbox-open')).toBe(false);
    });

    test('Space key on close button closes lightbox', () => {
        const firstImage = images[0];
        openLightbox(firstImage);
        expect(lightbox.classList.contains('lightbox-open')).toBe(true);

        closeBtn.focus();
        const spaceEvent = new dom.window.KeyboardEvent('keydown', { key: ' ' });
        closeBtn.dispatchEvent(spaceEvent);

        expect(lightbox.classList.contains('lightbox-open')).toBe(false);
    });

    // Image preloading tests
    test('preloadAdjacentImages is called when showing an image', () => {
        showImage(1);
        expect(preloadAdjacentImages).toHaveBeenCalledWith(1);
    });

    test('preloadAdjacentImages is called when opening lightbox', () => {
        const firstImage = images[0];
        preloadAdjacentImages.mockClear();

        openLightbox(firstImage);

        expect(preloadAdjacentImages).toHaveBeenCalledWith(0);
    });

    test('preloadAdjacentImages is called when navigating with arrow keys', () => {
        const firstImage = images[0];
        openLightbox(firstImage);
        preloadAdjacentImages.mockClear();

        const arrowRightEvent = new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight' });
        document.dispatchEvent(arrowRightEvent);

        expect(preloadAdjacentImages).toHaveBeenCalledWith(1);
    });

    // Network failure / error handling tests
    test('image onerror handler sets fallback alt text', () => {
        showImage(0);

        // Simulate image load error
        lightboxImg.onerror();

        expect(lightboxImg.alt).toBe('Image failed to load. Please try again.');
    });

    test('image onerror handler announces error to screen readers', () => {
        showImage(0);

        // Simulate image load error
        lightboxImg.onerror();

        expect(announcement.textContent).toBe('Error loading image. Please try closing and reopening the lightbox.');
    });

    test('showImage announces image info to screen readers', () => {
        showImage(0);
        expect(announcement.textContent).toBe('Image 1 of 3: Image 1');

        showImage(1);
        expect(announcement.textContent).toBe('Image 2 of 3: Image 2');
    });

    test('image cycling wraps correctly from last to first', () => {
        showImage(2); // Last image
        expect(lightboxImg.src).toContain('/photos/img3.jpg');

        showImage(currentIndex + 1); // Should wrap to first
        expect(lightboxImg.src).toContain('/photos/img1.jpg');
    });

    test('image cycling wraps correctly from first to last', () => {
        showImage(0); // First image
        expect(lightboxImg.src).toContain('/photos/img1.jpg');

        showImage(currentIndex - 1); // Should wrap to last
        expect(lightboxImg.src).toContain('/photos/img3.jpg');
    });
});
