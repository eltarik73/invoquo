"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-transparent"}`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Invoquo - Accueil">
          <svg viewBox="0 0 32 32" fill="none" width={32} height={32} aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#7c3aed" />
            <path d="M8 10h4v12H8V10z" fill="#fff" />
            <path d="M15 10h4l5 12h-4l-5-12z" fill="#fff" opacity=".9" />
            <circle cx="24" cy="10" r="2" fill="#a78bfa" />
          </svg>
          <span className="text-lg font-bold text-gray-900">invoquo</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a href="#fonctionnalites" className="hover:text-gray-900 transition-colors">
            Fonctionnalites
          </a>
          <a href="#tarifs" className="hover:text-gray-900 transition-colors">
            Tarifs
          </a>
          <a href="#conformite" className="hover:text-gray-900 transition-colors">
            Conformite
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Connexion</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Essai gratuit</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
