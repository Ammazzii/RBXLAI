// src/app/page.tsx

import Link from 'next/link';
import { LandingPageClient } from './landing-page-client'; // This is for the animations in the next step

export default function LandingPage() {
  return (
    <>
      <div className="animated-gradient-background"></div>

      <header>
        <nav>
            <a href="#" className="logo">RBXLabs</a>
            <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#faq">FAQ</a></li>
            </ul>
            <Link href="/dashboard" className="cta-button">Get Started</Link>
        </nav>
      </header>

      <main>
        {/* HERO SECTION */}
        <section id="hero">
            <h1 className="hero-title">Build Roblox games 10x faster with your AI assistant for <span id="typewriter"></span></h1>
            <p className="hero-subtitle">Generate, debug, and understand complex Luau scripts using simple English.</p>
            
            <div className="signup-form-container">
                <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
                    <input type="email" placeholder="Enter your email address" required />
                    <Link href="/dashboard" className="cta-button">Continue</Link>
                </form>
                <div className="divider">
                    <span>OR</span>
                </div>
                <Link href="/dashboard" className="google-button">
                    <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                </Link>
                <p className="form-footer-text">
                    Don&apos;t have an account? <Link href="/dashboard">Register</Link>
                </p>
            </div>
        </section>

        {/* SOCIAL PROOF SECTION */}
        <section id="social-proof">
            <p className="proof-text">TRUSTED BY THE NEXT GENERATION OF ROBLOX CREATORS</p>
            <div className="logo-cloud">
                <div className="logo-scroll">
                    <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M8 8h8v8"></path></svg><span>GameForge</span></div>
                    <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 7 7-7 7-7-7 7-7z"></path><path d="m2 12 7 7-7 7"></path></svg><span>Diamond Devs</span></div>
                    <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg><span>Poly-Perfect</span></div>
                    <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 0-10 10"></path></svg><span>Orbital Studios</span></div>
                    <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21 8 17l-4 4"></path><path d="m20 4-4 4-4-4"></path><path d="M16 4h4v4"></path><path d="M4 20v-4h4"></path></svg><span>Vortex Games</span></div>
                    <div className="brand-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"></path><path d="M18 9l-6 6-6-6"></path></svg><span>Gravity Shift</span></div>
                </div>
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

        {/* FEATURES SECTION */}
        <section id="features">
             <div className="feature-card">
                <h2>From a prompt to a script.</h2>
                <div className="code-demo">
                    <div className="prompt-panel">"Make a part that kills a player on touch"</div>
                    <pre className="code-panel"><code><span className="syntax-keyword">local</span> part = script.Parent<br/><br/>part.Touched:<span className="syntax-function">Connect</span>(<span className="syntax-keyword">function</span>(hit)<br/>    <span className="syntax-keyword">local</span> humanoid = hit.Parent:<span className="syntax-function">FindFirstChild</span>(<span className="syntax-string">"Humanoid"</span>)<br/>    <span className="syntax-keyword">if</span> humanoid <span className="syntax-keyword">then</span><br/>        humanoid.Health = <span className="syntax-number">0</span><br/>    <span className="syntax-keyword">end</span><br/><span className="syntax-keyword">end</span>)</code></pre>
                </div>
            </div>
            <div className="feature-card">
                <h2>Your personal coding tutor.</h2>
                <div className="code-demo">
                     <pre className="code-panel"><code><span className="syntax-comment">-- What does this line do?</span><br/><span className="syntax-highlight">part.Touched:<span className="syntax-function">Connect</span>(<span className="syntax-keyword">function</span>(hit)</span><br/>...<br/><span className="syntax-keyword">end</span>)</code></pre>
                    <div className="explanation-panel">
                        This line connects a function to the &apos;Touched&apos; event. The function will run every time another part physically touches `part` in the game.
                    </div>
                </div>
            </div>
             <div className="feature-card">
                <h2>Debug and Optimize.</h2>
                <div className="code-demo-split">
                    <div className="code-half">
                        <span className="code-label">BEFORE</span>
                        <pre className="code-panel small"><code><span className="syntax-keyword">function</span> <span className="syntax-function">onTouched</span>(hit)<br/>    <span className="syntax-keyword">if</span> hit.Parent...<br/><span className="syntax-keyword">end</span><br/>part.Touched:connect(onTouched)</code></pre>
                    </div>
                    <div className="code-half">
                        <span className="code-label">AFTER</span>
                        <pre className="code-panel small"><code><span className="syntax-comment">-- Modern event handling</span><br/>part.Touched:<span className="syntax-function">Connect</span>(<span className="syntax-keyword">function</span>(hit)<br/>    ...<br/><span className="syntax-keyword">end</span>)</code></pre>
                    </div>
                </div>
            </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing">
            <div className="section-header">
                <h2>Pricing That Scales With You</h2>
                <p>Start for free, then upgrade for more power and full Studio integration.</p>
            </div>
            <div className="pricing-grid">
                <div className="pricing-card">
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
                <div className="pricing-card">
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
                <div className="pricing-card popular">
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
                <div className="pricing-card">
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
        <section id="faq">
            <div className="section-header">
                <h2>Frequently Asked Questions</h2>
            </div>
            <div className="faq-container">
                <details className="faq-item">
                    <summary>What is RBXLabs?</summary>
                    <p>RBXLabs is an AI-powered tool designed specifically for the Roblox platform. It helps developers by automatically generating, debugging, and explaining Luau code, allowing them to build games and experiences faster and more efficiently.</p>
                </details>
                <details className="faq-item">
                    <summary>How is this different from ChatGPT or other AIs?</summary>
                    <p>While general-purpose AIs are powerful, RBXLabs is fine-tuned exclusively on modern, high-quality Roblox scripts and documentation. It understands Roblox-specific concepts like DataStores, RemoteEvents, and the game hierarchy, leading to more accurate, secure, and ready-to-use code.</p>
                </details>
                <details className="faq-item">
                    <summary>Is the generated code reliable?</summary>
                    <p>Our AI is trained on a massive dataset of best practices. While it&apos;s an incredibly powerful co-pilot, we always recommend that you test the generated code thoroughly within your game&apos;s specific context. Our goal is to save you 90% of the work, not replace a developer&apos;s final review.</p>
                </details>
                 <details className="faq-item">
                    <summary>Can I cancel my Pro plan at any time?</summary>
                    <p>Yes, absolutely. You can manage your subscription from your account dashboard and cancel at any time. You will retain Pro access for the remainder of your billing period.</p>
                </details>
            </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section id="cta">
            <h2>Ready to Start Building?</h2>
            <Link href="/dashboard" className="cta-button large">Get Started For Free</Link>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 RBXLabs. All Rights Reserved.</p>
      </footer>
      
      <LandingPageClient />
    </>
  );
}