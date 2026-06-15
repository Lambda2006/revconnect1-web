"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar({ hubMode = false }: { hubMode?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#0A2240] sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Wordmark */}
          <Link href="/" className="flex items-center text-xl font-bold tracking-tight">
            <span className="text-white">VictoryRev</span>
            <span className="text-[#C8102E]">Connect</span>
            <span className="text-white ml-2 font-normal text-sm tracking-widest uppercase">Boaters</span>
          </Link>

          {!hubMode && (
            <>
              {/* Desktop nav */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/features" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                  Features
                </Link>
                <Link href="/boats" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                  Supported Boats
                </Link>
                <Link href="/business" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                  For Businesses
                </Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                  Pricing
                </Link>
                <Link
                  href="/pricing"
                  className="bg-[#C8102E] hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden text-gray-300 hover:text-white p-2"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        {!hubMode && menuOpen && (
          <div className="md:hidden pb-4 border-t border-navy-light pt-4 space-y-3">
            <Link href="/features" className="block text-gray-300 hover:text-white text-sm font-medium px-2 py-1" onClick={() => setMenuOpen(false)}>
              Features
            </Link>
            <Link href="/boats" className="block text-gray-300 hover:text-white text-sm font-medium px-2 py-1" onClick={() => setMenuOpen(false)}>
              Supported Boats
            </Link>
            <Link href="/business" className="block text-gray-300 hover:text-white text-sm font-medium px-2 py-1" onClick={() => setMenuOpen(false)}>
              For Businesses
            </Link>
            <Link href="/pricing" className="block text-gray-300 hover:text-white text-sm font-medium px-2 py-1" onClick={() => setMenuOpen(false)}>
              Pricing
            </Link>
            <Link
              href="/pricing"
              className="block bg-[#C8102E] hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg text-center transition-colors mx-2"
              onClick={() => setMenuOpen(false)}
            >
              Start Free Trial
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
