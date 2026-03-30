import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/landing/nav";
import { Countdown } from "@/components/landing/countdown";
import { Footer } from "@/components/landing/footer";

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
      <main className="pt-28 pb-20 px-6">
        <article className="max-w-4xl mx-auto prose prose-lg prose-gray prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight prose-headings:mt-10 prose-headings:mb-4 prose-h2:text-2xl prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-3 prose-h3:text-xl prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-violet-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-strong:font-semibold prose-li:text-gray-600 prose-li:marker:text-violet-400 prose-table:overflow-hidden prose-table:border prose-table:border-gray-200 prose-table:rounded-lg prose-thead:bg-gray-50 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-sm prose-th:font-semibold prose-th:text-gray-900 prose-th:border-b prose-th:border-gray-200 prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:border-b prose-td:border-gray-100 prose-ul:space-y-2 prose-ol:space-y-2 prose-blockquote:border-violet-300 prose-blockquote:bg-violet-50/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1">
          {children}
        </article>
      </main>

      {cta && (
        <section className="py-20 px-4 bg-gradient-to-br from-violet-600 to-violet-800">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Prêt pour la réforme du 1er septembre 2026 ?
            </h2>
            <p className="text-violet-200 mt-2">
              Inscrivez-vous en 2 minutes. 1 mois gratuit, sans carte bancaire.
            </p>
            <div className="mt-8">
              <Countdown />
            </div>
            <Link href="/signup">
              <Button size="lg" className="mt-8 bg-white text-violet-700 hover:bg-violet-50">
                Essayer gratuitement
              </Button>
            </Link>
          </div>
        </section>
      )}

      <Footer />
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
    <div className="not-prose text-center mb-16">
      <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-semibold px-5 py-2 rounded-full mb-6 border border-violet-100">
        {badge}
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
        {title}
      </h1>
      <p className="mt-5 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
        {subtitle}
      </p>
      <div className="mt-8 flex gap-3 justify-center">
        <Link href="/signup">
          <Button size="lg" className="shadow-md">Essayer gratuitement</Button>
        </Link>
        <Link href="/#tarifs">
          <Button size="lg" variant="outline">Voir les tarifs</Button>
        </Link>
      </div>
      {/* Decorative separator */}
      <div className="mt-14 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
    </div>
  );
}
