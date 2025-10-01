import Link from 'next/link';
import LandingPageClient from './LandingPageClient'; 
import HeroSignUpForm from './components/HeroSignUpForm'; 
// NOTE: If you created LandingPageNav in an earlier step, uncomment and use it below.
// import LandingPageNav from './components/LandingPageNav'; 

/**
 * RBXAI Landing Page - Server Component (Static Structure)
 * All client-side functionality (animations, typewriter) is wrapped in LandingPageClient.
 */
export default function LandingPage() {
    return (
        <LandingPageClient>
            {/* The animated-gradient-background element, fixed with the corrected subtle colors */}
            <div className="animated-gradient-background"></div>

            {/* HEADER */}
            {/* Using inline header structure, or replace with <LandingPageNav /> if implemented */}
            <header className="animate">
                <nav>
                    <Link href="/" className="logo">RBXLabs</Link>
                    <ul>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#pricing">Pricing</a></li>
                        <li><a href="#faq">FAQ</a></li>
                    </ul>
                    {/* Header CTA points to dashboard/login */}
                    <Link href="/dashboard" className="cta-button">Get Started</Link>
                </nav>
            </header>

            <main>
                {/* HERO SECTION */}
                <section id="hero">
                    <h1 className="hero-title animate">
                        Build Roblox games 10x faster with your AI assistant for <span id="typewriter"></span>
                    </h1>
                    <p className="hero-subtitle animate">Generate, debug, and understand complex Luau scripts using simple English.</p>
                    
                    {/* RESTORED COMPLEX SIGN-UP FORM STRUCTURE */}
                    <div className="signup-form-container animate">
                         <HeroSignUpForm />
                    </div>
                </section>

                {/* SOCIAL PROOF SECTION */}
                <section id="social-proof" className="animate">
                    <p className="proof-text">TRUSTED BY THE NEXT GENERATION OF ROBLOX CREATORS</p>
                    <div className="logo-cloud">
                        {/* Note: In a production app, these SVGs would ideally be external components */}
                        <div className="logo-scroll">
                            <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M8 8h8v8"></path></svg><span>GameForge</span></div>
                            <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 7 7-7 7-7-7 7-7z"></path><path d="m2 12 7 7-7 7"></path></svg><span>Diamond Devs</span></div>
                            <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg><span>Poly-Perfect</span></div>
                            <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 0-10 10"></path></svg><span>Orbital Studios</span></div>
                            <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21 8 17l-4 4"></path><path d="m20 4-4 4-4-4"></path><path d="M16 4h4v4"></path><path d="M4 20v-4h4"></path></svg><span>Vortex Games</span></div>
                            <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"></path><path d="M18 9l-6 6-6-6"></path></svg><span>Gravity Shift</span></div>
                        </div>
                        {/* Duplicate for seamless scrolling effect */}
                        <div className="logo-scroll">
                            <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M8 8h8v8"></path></svg><span>GameForge</span></div>
                            <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 7 7-7 7-7-7 7-7z"></path><path d="m2 12 7 7-7 7"></path></svg><span>Diamond Devs</span></div>
                            <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg><span>Poly-Perfect</span></div>
                            <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 0-10 10"></path></svg><span>Orbital Studios</span></div>
                            <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21 8 17l-4 4"></path><path d="m20 4-4 4-4-4"></path><path d="M16 4h4v4"></path><path d="M4 20v-4h4"></path></svg><span>Vortex Games</span></div>
                            <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"></path><path d="M18 9l-6 6-6-6"></path></svg><span>Gravity Shift</span></div>
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION (Simplified JSX from previous steps) */}
                <section id="features">
                    <div className="feature-card animate">
                        <h2>From a prompt to a script.</h2>
                        <div className="code-demo">
                            <div className="prompt-panel">"Make a part that kills a player on touch"</div>
                            <pre className="code-panel">
                                <code>
                                    <span className="syntax-keyword">local</span> part = script.Parent<br/><br/>
                                    part.Touched:<span className="syntax-function">Connect</span>(<span className="syntax-keyword">function</span>(hit)<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="syntax-keyword">local</span> humanoid = hit.Parent:<span className="syntax-function">FindFirstChild</span>(<span className="syntax-string">"Humanoid"</span>)<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="syntax-keyword">if</span> humanoid <span className="syntax-keyword">then</span><br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;humanoid.Health = <span className="syntax-number">0</span><br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="syntax-keyword">end</span><br/>
                                    <span className="syntax-keyword">end</span>)
                                </code>
                            </pre>
                        </div>
                    </div>
                    <div className="feature-card animate">
                        <h2>Your personal coding tutor.</h2>
                        <div className="code-demo">
                            <pre className="code-panel">
                                <code>
                                    <span className="syntax-comment">-- What does this line do?</span><br/>
                                    <span className="syntax-highlight">part.Touched:<span className="syntax-function">Connect</span>(<span className="syntax-keyword">function</span>(hit)</span><br/>
                                    ...<br/>
                                    <span className="syntax-keyword">end</span>)
                                </code>
                            </pre>
                            <div className="explanation-panel">
                                This line connects a function to the 'Touched' event. The function will run every time another part physically touches `part` in the game.
                            </div>
                        </div>
                    </div>
                    <div className="feature-card animate">
                        <h2>Debug and Optimize.</h2>
                        <div className="code-demo-split">
                            <div className="code-half">
                                <span className="code-label">BEFORE</span>
                                <pre className="code-panel small">
                                    <code>
                                        <span className="syntax-keyword">function</span> <span className="syntax-function">onTouched</span>(hit)<br/>
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="syntax-keyword">if</span> hit.Parent...<br/>
                                        <span className="syntax-keyword">end</span><br/>
                                        part.Touched:connect(onTouched)
                                    </code>
                                </pre>
                            </div>
                            <div className="code-half">
                                <span className="code-label">AFTER</span>
                                <pre className="code-panel small">
                                    <code>
                                        <span className="syntax-comment">-- Modern event handling</span><br/>
                                        part.Touched:<span className="syntax-function">Connect</span>(<span className="syntax-keyword">function</span>(hit)<br/>
                                        &nbsp;&nbsp;&nbsp;&nbsp;...<br/>
                                        <span className="syntax-keyword">end</span>)
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRICING SECTION */}
                <section id="pricing" className="animate">
                    <div className="section-header">
                        <h2>Pricing That Scales With You</h2>
                        <p>Start for free, then upgrade for more power and full Studio integration.</p>
                    </div>
                    <div className="pricing-grid">
                        {/* Free Tier */}
                        <div className="pricing-card animate">
                            <h3>Free</h3>
                            <p className="price">$0</p>
                            <p className="price-desc">For trying out ideas and learning the ropes.</p>
                            <ul className="pricing-features">
                                <li>15,000 tokens/month</li>
                                <li>Basic web chat only</li>
                                <li>No Studio Plugin access</li>
                                <li>Community support</li>
                            </ul>
                            <Link href="/dashboard" className="cta-button secondary">Start for Free</Link>
                        </div>
                        {/* Starter Tier */}
                        <div className="pricing-card animate">
                            <h3>Starter</h3>
                            <p className="price">$12.99<span>/mo</span></p>
                            <p className="price-desc">For hobbyists and dedicated learners.</p>
                            <ul className="pricing-features">
                                <li>100,000 tokens/month</li>
                                <li>Full Web Platform Access</li>
                                <li>Studio Plugin (Read-only)</li>
                                <li>Up to 3 Projects</li>
                            </ul>
                            <Link href="/dashboard" className="cta-button secondary">Get Started</Link>
                        </div>
                        {/* Pro Tier */}
                        <div className="pricing-card popular animate">
                            <div className="popular-badge">Most Popular</div>
                            <h3>Pro</h3>
                            <p className="price">$29.99<span>/mo</span></p>
                            <p className="price-desc">For serious developers building the next hit game.</p>
                            <ul className="pricing-features">
                                <li>500,000 tokens/month</li>
                                <li>Full Studio Plugin (Write Access)</li>
                                <li>Unlimited Projects</li>
                                <li>Code Collaboration</li>
                                <li>Priority Support</li>
                            </ul>
                            <Link href="/dashboard" className="cta-button primary">Go Pro</Link>
                        </div>
                        {/* Studio Tier */}
                        <div className="pricing-card animate">
                            <h3>Studio</h3>
                            <p className="price">$79.99<span>/mo</span></p>
                            <p className="price-desc">For professional studios and teams.</p>
                            <ul className="pricing-features">
                                <li>2,000,000 tokens/month</li>
                                <li>Everything in Pro</li>
                                <li>Team Features (5 Seats)</li>
                                <li>Custom AI Behaviors</li>
                                <li>Advanced Analytics</li>
                            </ul>
                            <Link href="/dashboard" className="cta-button secondary">Contact Sales</Link>
                        </div>
                    </div>
                </section>

                {/* FAQ SECTION */}
                <section id="faq" className="animate">
                    <div className="section-header">
                        <h2>Frequently Asked Questions</h2>
                    </div>
                    <div className="faq-container">
                        <details className="faq-item animate">
                            <summary>What is RBXLabs?</summary>
                            <p>RBXLabs is an AI-powered tool designed specifically for the Roblox platform. It helps developers by automatically generating, debugging, and explaining Luau code, allowing them to build games and experiences faster and more efficiently.</p>
                        </details>
                        <details className="faq-item animate">
                            <summary>How is this different from ChatGPT or other AIs?</summary>
                            <p>While general-purpose AIs are powerful, RBXLabs is fine-tuned exclusively on modern, high-quality Roblox scripts and documentation. It understands Roblox-specific concepts like DataStores, RemoteEvents, and the game hierarchy, leading to more accurate, secure, and ready-to-use code.</p>
                        </details>
                        <details className="faq-item animate">
                            <summary>Is the generated code reliable?</summary>
                            <p>Our AI is trained on a massive dataset of best practices. While it's an incredibly powerful co-pilot, we always recommend that you test the generated code thoroughly within your game's specific context. Our goal is to save you 90% of the work, not replace a developer's final review.</p>
                        </details>
                        <details className="faq-item animate">
                            <summary>Can I cancel my Pro plan at any time?</summary>
                            <p>Yes, absolutely. You can manage your subscription from your account dashboard and cancel at any time. You will retain Pro access for the remainder of your billing period.</p>
                        </details>
                    </div>
                </section>

                {/* FINAL CTA SECTION */}
                <section id="cta" className="animate">
                    <h2>Ready to Start Building?</h2>
                    <Link href="/dashboard" className="cta-button large">Get Started For Free</Link>
                </section>
            </main>

            <footer>
                <p>&copy; 2025 RBXLabs. All Rights Reserved.</p>
            </footer>
        </LandingPageClient>
    );
}