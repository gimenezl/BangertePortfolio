'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Copy, Check } from 'lucide-react';

const EMAIL = 'bangerteivana@gmail.com';

export default function ContactPage() {
    const [copied, setCopied] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const handleMouseMove = (e: MouseEvent) => {
            if (!isMobile) {
                setMousePosition({
                    x: (e.clientX / window.innerWidth) * 100,
                    y: (e.clientY / window.innerHeight) * 100,
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', checkMobile);
        };
    }, [isMobile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to send message');

            setFormData({ name: '', email: '', message: '' });
            setSubmitStatus('success');
        } catch {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative">
            {/* Animated gradient - only on desktop */}
            {!isMobile && (
                <div
                    className="fixed inset-0 opacity-30 pointer-events-none transition-all duration-1000 ease-out"
                    style={{
                        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)`,
                    }}
                />
            )}

            {/* Floating orbs - smaller on mobile */}
            <div className="fixed top-20 right-10 md:right-20 w-32 md:w-64 h-32 md:h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="fixed bottom-40 left-5 md:left-10 w-48 md:w-96 h-48 md:h-96 bg-purple-500/5 rounded-full blur-3xl" />

            <div className="relative container-custom py-16 md:py-24 lg:py-40">
                <div className="max-w-5xl">
                    {/* Large creative heading - smaller on mobile */}
                    <div className="mb-12 md:mb-24 animate-fade-in">
                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[10rem] font-extralight leading-none tracking-tight">
                            <span className="block text-white/90 hover:text-cyan-400 transition-colors duration-500 cursor-default">
                                Let's
                            </span>
                            <span className="block text-white/50 hover:text-white/90 transition-colors duration-500 cursor-default">
                                talk<span className="text-cyan-400">.</span>
                            </span>
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                        {/* Left side - Email section */}
                        <div className="animate-slide-up-delay">
                            <div className="group mb-6 md:mb-8">
                                <p className="text-white/30 text-xs md:text-sm uppercase tracking-widest mb-4 md:mb-6">Reach out</p>

                                <a
                                    href={`mailto:${EMAIL}?subject=Work Inquiry`}
                                    className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-white/70 hover:text-cyan-400 transition-all duration-500 break-all md:break-normal"
                                >
                                    {EMAIL}
                                </a>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(EMAIL);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="flex items-center gap-2 mt-3 md:mt-4 text-xs md:text-sm text-white/30 hover:text-cyan-400 transition-colors duration-300"
                                >
                                    {copied ? (
                                        <>
                                            <Check size={14} className="text-green-400" />
                                            <span className="text-green-400">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={14} />
                                            <span>Copy email</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Decorative line */}
                            <div className="w-full h-px bg-gradient-to-r from-cyan-400/30 via-white/10 to-transparent my-8 md:my-12" />

                            <p className="text-white/40 text-base md:text-lg font-light leading-relaxed">
                                I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
                            </p>
                        </div>

                        {/* Right side - Contact Form */}
                        <form onSubmit={handleSubmit} className="animate-slide-up-delay-2 space-y-6 md:space-y-8">
                            <div className="space-y-4 md:space-y-6">
                                <div className="group">
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full bg-transparent border-b border-white/10 py-3 md:py-4 text-base md:text-lg text-white placeholder-white/20 focus:border-cyan-400/50 focus:outline-none transition-all duration-500"
                                    />
                                </div>

                                <div className="group">
                                    <input
                                        type="email"
                                        placeholder="Your email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full bg-transparent border-b border-white/10 py-3 md:py-4 text-base md:text-lg text-white placeholder-white/20 focus:border-cyan-400/50 focus:outline-none transition-all duration-500"
                                    />
                                </div>

                                <div className="group">
                                    <textarea
                                        placeholder="Tell me about your project..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                        rows={4}
                                        className="w-full bg-transparent border-b border-white/10 py-3 md:py-4 text-base md:text-lg text-white placeholder-white/20 focus:border-cyan-400/50 focus:outline-none transition-all duration-500 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group relative w-full md:w-auto px-8 md:px-10 py-3 md:py-4 bg-transparent border border-white/20 rounded-full overflow-hidden transition-all duration-500 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] disabled:opacity-50"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3 text-white/80 group-hover:text-white transition-colors duration-300">
                                    {isSubmitting ? 'Sending...' : 'Send message'}
                                    <Send size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </span>

                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </button>

                            {/* Status messages */}
                            {submitStatus === 'success' && (
                                <div className="flex items-center gap-3 text-green-400 animate-fade-in">
                                    <Check size={20} />
                                    <span>Message sent! I'll get back to you soon.</span>
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <p className="text-red-400 animate-fade-in">
                                    Something went wrong. Please try again.
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
