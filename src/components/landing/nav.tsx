"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface UserData {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  tenant?: {
    id: string;
    companyName: string;
    siret: string;
  } | null;
}

function getInitials(user: UserData): string {
  const name = user.tenant?.companyName;
  if (name && !name.includes("@")) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (user.firstName) {
    return (
      (user.firstName[0] || "") + (user.lastName?.[0] || "")
    ).toUpperCase();
  }
  return user.email[0].toUpperCase();
}

function getDisplayName(user: UserData): string {
  return (
    user.tenant?.companyName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email.split("@")[0]
  );
}

function UserMenu({ user }: { user: UserData }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const initials = getInitials(user);
  const displayName = getDisplayName(user);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-violet-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
        <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[140px] truncate">
          {displayName}
        </span>
        <svg
          className="w-3.5 h-3.5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {user.email}
            </p>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Tableau de bord
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Paramètres
            </Link>
          </div>

          <div className="border-t border-gray-100" />

          <div className="py-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.data || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-transparent"}`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="Invoquo - Accueil"
        >
          <svg
            viewBox="0 0 32 32"
            fill="none"
            width={32}
            height={32}
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="8" fill="#7c3aed" />
            <path d="M8 10h4v12H8V10z" fill="#fff" />
            <path d="M15 10h4l5 12h-4l-5-12z" fill="#fff" opacity=".9" />
            <circle cx="24" cy="10" r="2" fill="#a78bfa" />
          </svg>
          <span className="text-lg font-bold text-gray-900">invoquo</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a
            href="/#fonctionnalites"
            className="hover:text-gray-900 transition-colors"
          >
            Fonctionnalités
          </a>
          <a
            href="/#tarifs"
            className="hover:text-gray-900 transition-colors"
          >
            Tarifs
          </a>
          <a
            href="/conformite"
            className="hover:text-gray-900 transition-colors"
          >
            Conformité
          </a>
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-8 h-8" />
          ) : user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Tableau de bord
                </Button>
              </Link>
              <UserMenu user={user} />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Essai gratuit</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
