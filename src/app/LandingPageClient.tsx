'use client';

import React, { useEffect, useState, useRef } from 'react';

// The words used in the original typewriter script
const words = ["scripts.", "datastore systems.", "admin panels.", "UI animations."];

interface LandingPageClientProps {
    children: React.ReactNode;
}

/**
 * Handles all client-side logic for the landing page:
 * 1. Typewriter effect for the hero text.
 * 2. Scroll-reveal animations for elements with the 'animate' class.
 */
export default function LandingPageClient({ children }: LandingPageClientProps) {
    const [wordIndex, setWordIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [displayText, setDisplayText] = useState('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // --- Typewriter Effect Logic (from script.js) ---
    useEffect(() => {
        // Clear any previous timeout before setting a new one
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        const currentWord = words[wordIndex];
        const typingSpeed = isDeleting ? 75 : 150;

        const handleTyping = () => {
            if (isDeleting) {
                // Deleting
                setDisplayText(currentWord.substring(0, charIndex - 1));
                setCharIndex(prev => prev - 1);
            } else {
                // Typing
                setDisplayText(currentWord.substring(0, charIndex + 1));
                setCharIndex(prev => prev + 1);
            }
        };

        // Determine next action
        if (!isDeleting && charIndex === currentWord.length) {
            // Finished typing word: Pause for 1.5s, then start deleting
            timeoutRef.current = setTimeout(() => setIsDeleting(true), 1500);
        } else if (isDeleting && charIndex === 0) {
            // Finished deleting word: Move to next word and start typing
            setIsDeleting(false);
            setWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        } else {
            // Continue typing or deleting
            timeoutRef.current = setTimeout(handleTyping, typingSpeed);
        }

        // Cleanup function for the effect
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [charIndex, isDeleting, wordIndex]);


    // --- Scroll Animation (Intersection Observer) Logic (from script.js) ---
    useEffect(() => {
        const animatedElements = document.querySelectorAll(".animate");
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(element => { observer.observe(element); });

        // Cleanup observer on unmount
        return () => {
            animatedElements.forEach(element => { observer.unobserve(element); });
        };
    }, []);

    // Inject the dynamically generated text into the specific span with id="typewriter"
    useEffect(() => {
        const typewriterElement = document.getElementById('typewriter');
        if (typewriterElement) {
            typewriterElement.textContent = displayText;
        }
    }, [displayText]);


    // Render the static content passed as children
    return <>{children}</>;
}