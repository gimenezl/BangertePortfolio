import Link from 'next/link';
import { Instagram, Linkedin } from 'lucide-react';

// Custom Behance icon since lucide-react doesn't have one
function BehanceIcon({ size = 20 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="inline-block"
        >
            <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
        </svg>
    );
}

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-black text-white py-6">
            <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Copyright */}
                <p className="text-sm text-white/60">
                    © {currentYear} Ivana Bangerte
                </p>

                {/* Social Links */}
                <div className="flex items-center gap-4">
                    <span className="text-sm text-white/60 italic">follow me...or stalk me</span>
                    <div className="flex items-center gap-3">
                        <Link
                            href="https://www.linkedin.com/in/ivana-bangerte-8bb88b1b9/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/70 hover:text-white transition-all duration-200 hover:scale-110"
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={18} />
                        </Link>
                        <Link
                            href="https://www.behance.net/ivanabangerte"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/70 hover:text-white transition-all duration-200 hover:scale-110"
                            aria-label="Behance"
                        >
                            <BehanceIcon size={18} />
                        </Link>
                        <Link
                            href="https://www.instagram.com/ivanaasb/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/70 hover:text-white transition-all duration-200 hover:scale-110"
                            aria-label="Instagram"
                        >
                            <Instagram size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
