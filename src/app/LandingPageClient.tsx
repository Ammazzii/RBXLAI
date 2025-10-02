'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; 
import EmailAuthForm from '@/components/EmailAuthForm'; 

// The words used in the original typewriter script
const words = ["scripts.", "datastore systems.", "admin panels.", "UI animations."];

interface LandingPageClientProps {
    children: React.ReactNode;
}

// Custom type for element props we expect to check
type ElementProps = { id?: string; className?: string; children?: React.ReactNode; [key: string]: any };

// Type guard that ensures the element is valid and has props
const isElementWithProps = (child: React.ReactNode): child is React.ReactElement<ElementProps> => {
    return React.isValidElement(child) && typeof child.props === 'object' && child.props !== null;
};

/**
 * Handles all client-side logic for the landing page.
 */
export default function LandingPageClient({ children }: LandingPageClientProps) {
    const [wordIndex, setWordIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [displayText, setDisplayText] = useState('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [showAuthForm, setShowAuthForm] = useState(false);
    const searchParams = useSearchParams();

    // --- Typewriter Effect Logic (omitted for space) ---
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        const currentWord = words[wordIndex];
        const typingSpeed = isDeleting ? 75 : 150;

        const handleTyping = () => {
            if (isDeleting) {
                setDisplayText(currentWord.substring(0, charIndex - 1));
                setCharIndex(prev => prev - 1);
            } else {
                setDisplayText(currentWord.substring(0, charIndex + 1));
                setCharIndex(prev => prev + 1);
            }
        };

        if (!isDeleting && charIndex === currentWord.length) {
            timeoutRef.current = setTimeout(() => setIsDeleting(true), 1500);
        } else if (isDeleting && charIndex === 0) {
            setIsDeleting(false);
            setWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        } else {
            timeoutRef.current = setTimeout(handleTyping, typingSpeed);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [charIndex, isDeleting, wordIndex]);

    // --- Scroll Animation Logic (omitted for space) ---
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

        return () => {
            animatedElements.forEach(element => { observer.unobserve(element); });
        };
    }, []);

    useEffect(() => {
        const typewriterElement = document.getElementById('typewriter');
        if (typewriterElement) {
            typewriterElement.textContent = displayText;
        }
    }, [displayText]);


    // --- LOGIC: Check URL for ?auth=true on mount ---
    useEffect(() => {
        if (searchParams.get('auth') === 'true') {
            setShowAuthForm(true);
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [searchParams]);

    // Function to clone and modify the children (MAXIMUM TYPE SAFETY)
    const renderContent = () => {
        return React.Children.map(children, (child) => {
            // Level 1: Find the <main> tag
            if (isElementWithProps(child) && child.type === 'main') {
                const mainChild = child;
                
                return React.cloneElement(mainChild, {
                    children: React.Children.map(mainChild.props.children, (heroChild) => {
                        if (!isElementWithProps(heroChild)) return heroChild;

                        // Level 2: Find the Hero section
                        if (heroChild.props.id === 'hero') {
                            const heroElement = heroChild;

                            return React.cloneElement(heroElement, {
                                children: React.Children.map(heroElement.props.children, (ctaContainer) => {
                                    if (!isElementWithProps(ctaContainer)) return ctaContainer;
                                    
                                    // Level 3: Find the CTA container (div with class mt-8 animate)
                                    if (ctaContainer.props.className?.includes('mt-8 animate')) {
                                        
                                        return React.cloneElement(ctaContainer, {
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
                                    return ctaContainer;
                                })
                            });
                        }
                        return heroChild;
                    })
                });
            }
            return child;
        });
    }

    // Render the static content passed as children, with the modified Hero CTA area
    return renderContent();
}