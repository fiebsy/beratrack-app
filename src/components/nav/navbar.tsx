'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

// Import the SVG files as components
import BeraLogoMark from '@/assets/logos/BeraNavLogoMark.svg';
import BeraWordMark from '@/assets/logos/BeraNavWordMark.svg';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  return (
    <header className="w-full">
      <nav className={cn('container flex h-20 items-center mx-auto px-4', className)}>
        <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity text-foreground">
          <div className="h-12 w-12">
            <BeraLogoMark className="h-full w-full text-foreground" />
          </div>
          <div className="h-6 w-[120px]">
            <BeraWordMark className="h-full w-full text-foreground" />
          </div>
        </Link>
      </nav>
    </header>
  );
} 