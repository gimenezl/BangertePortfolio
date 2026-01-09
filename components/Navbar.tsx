'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/about', label: 'About Me' },
    { href: '/contact', label: "Let's talk" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHomePage = pathname === '/';

    return (
        <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
            : 'bg-transparent'
            }`}>
            <nav className="container-custom flex items-center justify-between py-5">
                {/* Logo */}
                {!isHomePage && (
                    <Link
                        href="/"
                        className="text-lg font-light tracking-wide text-white/90 hover:text-white transition-all duration-300 group"
                    >
                        <span className="inline-block transition-transform duration-300 group-hover:-translate-y-0.5">
                            Home
                        </span>
                    </Link>
                )}

                {isHomePage && <div />}

                {/* Desktop Navigation */}
                <ul className="hidden md:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`relative text-sm font-light tracking-wide transition-all duration-300 group ${pathname === link.href
                                    ? 'text-white'
                                    : 'text-white/60 hover:text-white'
                                    }`}
                            >
                                <span className="inline-block transition-transform duration-300 group-hover:-translate-y-0.5">
                                    {link.label}
                                </span>
                                {/* Animated underline */}
                                <span className={`absolute -bottom-1 left-0 h-px bg-white transition-all duration-300 ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                                    }`} />
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 -mr-2 text-white/70 hover:text-white transition-all duration-300 hover:scale-110"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? 'Close menu' : 'Open menu'}
                >
                    <span className="transition-transform duration-300 inline-block">
                        {isOpen ? <X size={22} /> : <Menu size={22} />}
                    </span>
                </button>
            </nav>

            {/* Mobile Navigation */}
            <div className={`md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <ul className="container-custom py-6 space-y-4">
                    {navLinks.map((link, index) => (
                        <li
                            key={link.href}
                            style={{ transitionDelay: isOpen ? `${index * 50}ms` : '0ms' }}
                            className={`transition-all duration-300 ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                                }`}
                        >
                            <Link
                                href={link.href}
                                className={`block text-lg font-light tracking-wide transition-all duration-300 hover:translate-x-2 ${pathname === link.href
                                    ? 'text-white'
                                    : 'text-white/60 hover:text-white'
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </header>
    );
}
