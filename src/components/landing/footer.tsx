import Link from "next/link";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "/#fonctionnalites" },
      { label: "Tarifs", href: "/#tarifs" },
      { label: "Conformité", href: "/conformite" },
      { label: "Artisans", href: "/logiciel-facturation-artisan" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Centre d'aide", href: "/aide" },
      { label: "Documentation API", href: "/docs/api" },
      { label: "Plateforme Agréée", href: "/plateforme-agreee" },
      { label: "Guide réforme 2026", href: "/facturation-electronique-2026" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "CGU", href: "/cgu" },
      { label: "Confidentialité", href: "/confidentialite" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Logo + tagline */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <svg viewBox="0 0 32 32" fill="none" width={28} height={28} aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="#7c3aed" />
                <path d="M8 10h4v12H8V10z" fill="#fff" />
                <path d="M15 10h4l5 12h-4l-5-12z" fill="#fff" opacity=".9" />
                <circle cx="24" cy="10" r="2" fill="#a78bfa" />
              </svg>
              <span className="text-lg font-bold text-gray-900">invoquo</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Facturation électronique conforme,
              <br />connectée Plateforme Agréée.
            </p>
            <div className="mt-4 space-y-1 text-xs text-gray-500">
              <p>
                <a href="mailto:support@invoquo.fr" className="hover:text-[#7c3aed] transition-colors">
                  support@invoquo.fr
                </a>
              </p>
              <p>
                <a href="mailto:partenaires@invoquo.fr" className="hover:text-[#7c3aed] transition-colors">
                  partenaires@invoquo.fr
                </a>
              </p>
              <p>Chambéry, France</p>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-[#7c3aed] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Invoquo. Logiciel de facturation électronique connecté Plateforme Agréée.
          </p>
        </div>
      </div>
    </footer>
  );
}
