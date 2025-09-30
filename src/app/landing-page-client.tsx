// src/app/landing-page-client.tsx
'use client'; // This is crucial for running browser-side code

import { useEffect } from 'react';

export function LandingPageClient() {
  useEffect(() => {
    // --- SCROLL ANIMATION LOGIC ---
    const animatedElements = document.querySelectorAll("main > section");
    animatedElements.forEach(el => el.classList.add('animate')); // Add class for initial state
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => { observer.observe(element); });

    // --- TYPEWRITER ANIMATION LOGIC ---
    const typewriterElement = document.getElementById('typewriter');
    if (typewriterElement) {
        const words = ["scripts.", "datastore systems.", "admin panels.", "UI animations."];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let animationFrameId: number;

        const type = () => {
            const currentWord = words[wordIndex];
            let displayText = '';
            const typingSpeed = isDeleting ? 75 : 150;

            if (isDeleting) {
                displayText = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                displayText = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }
            
            if (typewriterElement) typewriterElement.textContent = displayText;

            if (!isDeleting && charIndex === currentWord.length) {
                setTimeout(() => { isDeleting = true; animationFrameId = requestAnimationFrame(type); }, 1500);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                animationFrameId = requestAnimationFrame(type);
            } else {
                setTimeout(() => { animationFrameId = requestAnimationFrame(type); }, typingSpeed);
            }
        };
        
        // Start the effect
        setTimeout(() => { animationFrameId = requestAnimationFrame(type); }, 500);
        
        // Cleanup function
        return () => {
            cancelAnimationFrame(animationFrameId);
            animatedElements.forEach(element => observer.unobserve(element));
        };
    }
  }, []); // Empty dependency array means this runs once on mount

  return null; // This component renders nothing, it only runs effects
}