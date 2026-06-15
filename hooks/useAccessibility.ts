import { useEffect, useCallback, RefObject } from 'react';

interface KeyboardNavigationOptions {
    onEscape?: () => void;
    onEnter?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onTab?: () => void;
    enabled?: boolean;
}

/**
 * Hook for handling keyboard navigation
 * Provides accessible keyboard controls for components
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
    const {
        onEscape,
        onEnter,
        onArrowUp,
        onArrowDown,
        onArrowLeft,
        onArrowRight,
        onTab,
        enabled = true
    } = options;

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return;

        switch (event.key) {
            case 'Escape':
                if (onEscape) {
                    event.preventDefault();
                    onEscape();
                }
                break;
            case 'Enter':
                if (onEnter) {
                    event.preventDefault();
                    onEnter();
                }
                break;
            case 'ArrowUp':
                if (onArrowUp) {
                    event.preventDefault();
                    onArrowUp();
                }
                break;
            case 'ArrowDown':
                if (onArrowDown) {
                    event.preventDefault();
                    onArrowDown();
                }
                break;
            case 'ArrowLeft':
                if (onArrowLeft) {
                    event.preventDefault();
                    onArrowLeft();
                }
                break;
            case 'ArrowRight':
                if (onArrowRight) {
                    event.preventDefault();
                    onArrowRight();
                }
                break;
            case 'Tab':
                if (onTab) {
                    onTab();
                }
                break;
        }
    }, [enabled, onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab]);

    useEffect(() => {
        if (enabled) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [enabled, handleKeyDown]);
}

/**
 * Hook for managing focus trap in modals/dialogs
 */
export function useFocusTrap(isActive: boolean, containerRef: RefObject<HTMLElement>) {
    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus first element
        firstElement?.focus();

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleTabKey);
        return () => container.removeEventListener('keydown', handleTabKey);
    }, [isActive, containerRef]);
}

/**
 * Hook to announce messages to screen readers
 */
export function useScreenReaderAnnouncement() {
    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }, []);

    return announce;
}

/**
 * Utility to generate unique IDs for ARIA attributes
 */
let idCounter = 0;
export function useUniqueId(prefix: string = 'id'): string {
    const id = `${prefix}-${++idCounter}`;
    return id;
}

/**
 * Check if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches;
}
