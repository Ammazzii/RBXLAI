'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // NEW IMPORT
import EmailAuthForm from '@/components/EmailAuthForm';

// The words used in the original typewriter script
const words = ["scripts.", "datastore systems.", "admin panels.", "UI animations."];

interface LandingPageClientProps {
    children: React.ReactNode;
}

/**
 * Handles all client-side logic for the landing page:
 * 1. Typewriter effect for the hero text.
 * 2. Scroll-reveal animations for elements with the 'animate' class.
 * 3. Manages the display state of the Hero CTA (Button vs. Auth Form).
 * 4. Checks for URL parameter (?auth=true) to auto-open the form.
 */
export default function LandingPageClient({ children }: LandingPageClientProps) {
    const [wordIndex, setWordIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [displayText, setDisplayText] = useState('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // NEW STATE: Controls whether the form or the button is shown
    const [showAuthForm, setShowAuthForm] = useState(false);
    
    // NEW HOOK: Get URL parameters
    const searchParams = useSearchParams();

    // --- Typewriter Effect Logic (UNMODIFIED) ---
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

    // --- Scroll Animation Logic (UNMODIFIED) ---
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

    // Inject the dynamically generated text into the specific span with id="typewriter" (UNMODIFIED)
    useEffect(() => {
        const typewriterElement = document.getElementById('typewriter');
        if (typewriterElement) {
            typewriterElement.textContent = displayText;
        }
    }, [displayText]);


    // --- NEW LOGIC: Check URL for ?auth=true on mount ---
    useEffect(() => {
        if (searchParams.get('auth') === 'true') {
            setShowAuthForm(true);
            // Clean the URL history state so the user isn't stuck reloading the form
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [searchParams]); // Reruns if URL parameters change

    // Function to clone and modify the children
    const renderContent = () => {
        // We find the hero CTA section to replace it
        // Note: This relies on the specific structure in src/app/page.tsx
        return React.Children.map(children, (child: any) => {
            if (child.type === 'main') {
                return React.cloneElement(child, {
                    children: React.Children.map(child.props.children, (mainChild: any) => {
                        if (mainChild.props && mainChild.props.id === 'hero') {
                            // Found the Hero section, now look for the CTA div
                            return React.cloneElement(mainChild, {
                                children: React.Children.map(mainChild.props.children, (heroChild: any) => {
                                    // Check for the div containing the original CTA button. 
                                    // We identify it by looking for the specific className used in page.tsx
                                    if (heroChild.props && heroChild.props.className?.includes('mt-8 animate')) {
                                        return React.cloneElement(heroChild, {
                                            children: showAuthForm ? (
                                                <EmailAuthForm />
                                            ) : (
                                                <Link 
                                                    href="#" 
                                                    onClick={() => setShowAuthForm(true)} 
                                                    className="cta-button large primary px-8 py-4 text-lg"
                                                >
                                                    Get Started For Free
                                                </Link>
                                            )
                                        });
                                    }
                                    return heroChild;
                                })
                            });
                        }
                        return mainChild;
                    })
                });
            }
            return child;
        });
    }

    // Render the static content passed as children, with the modified Hero CTA area
    return renderContent();
}