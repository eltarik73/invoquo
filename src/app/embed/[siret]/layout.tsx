interface Props {
  children: React.ReactNode;
  params: Promise<{ siret: string }>;
}

export default async function EmbedLayout({ children, params }: Props) {
  const { siret } = await params;

  return (
    <div className="embed-wrapper min-h-screen" data-siret={siret} style={{ background: "#FAF8F5" }}>
      <div className="px-5 py-4">{children}</div>
      <div className="text-center text-[11px] py-2" style={{ color: "#C5C0B9" }}>
        Facturation &eacute;lectronique
      </div>
    </div>
  );
}
