import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/landing/nav";
import { Countdown } from "@/components/landing/countdown";

function Logo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" width={24} height={24} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#7c3aed" />
      <path d="M8 10h4v12H8V10z" fill="#fff" />
      <path d="M15 10h4l5 12h-4l-5-12z" fill="#fff" opacity=".9" />
      <circle cx="24" cy="10" r="2" fill="#a78bfa" />
    </svg>
  );
}

export function SeoPage({
  children,
  cta = true,
}: {
  children: React.ReactNode;
  cta?: boolean;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main className="pt-24 pb-16 px-4">
        <article className="max-w-4xl mx-auto prose prose-gray prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight prose-a:text-violet-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-table:border-collapse prose-th:bg-gray-50 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:text-sm prose-th:font-semibold prose-th:border prose-th:border-gray-200 prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-gray-200 prose-td:text-sm prose-strong:text-gray-900 prose-li:marker:text-violet-500">
          {children}
        </article>
      </main>

      {cta && (
        <section className="py-16 px-4 bg-gradient-to-br from-violet-600 to-violet-800">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Pret pour la reforme du 1er septembre 2026 ?
            </h2>
            <p className="text-violet-200 mt-2">
              Inscrivez-vous en 2 minutes. 1 mois gratuit, sans carte bancaire.
            </p>
            <div className="mt-6">
              <Countdown />
            </div>
            <Link href="/signup">
              <Button
                size="lg"
                className="mt-8 bg-white text-violet-700 hover:bg-violet-50"
              >
                Essayer gratuitement
              </Button>
            </Link>
          </div>
        </section>
      )}

      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold text-gray-900 text-sm">invoquo</span>
          </div>
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Invoquo
          </p>
        </div>
      </footer>
    </div>
  );
}

export function SeoHero({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="not-prose text-center mb-12">
      <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
        {badge}
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
        {title}
      </h1>
      <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      <div className="mt-6 flex gap-3 justify-center">
        <Link href="/signup">
          <Button size="lg">Essayer gratuitement</Button>
        </Link>
        <Link href="/#tarifs">
          <Button size="lg" variant="outline">
            Voir les tarifs
          </Button>
        </Link>
      </div>
    </div>
  );
}
