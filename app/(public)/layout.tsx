'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className={isHomePage ? 'flex-1' : 'flex-1 pt-20'}>
                {children}
            </main>
            <Footer />
        </div>
    );
}
