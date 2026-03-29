import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription — Essai gratuit 1 mois",
  description:
    "Creez votre compte Invoquo gratuitement. Logiciel de facturation electronique conforme a la reforme 2026. 1 mois gratuit, sans carte bancaire.",
  alternates: { canonical: "https://invoquo.vercel.app/signup" },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
