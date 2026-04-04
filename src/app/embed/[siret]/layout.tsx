interface Props {
  children: React.ReactNode;
  params: Promise<{ siret: string }>;
}

export default async function EmbedLayout({ children, params }: Props) {
  const { siret } = await params;

  return (
    <div className="embed-wrapper min-h-screen bg-gray-50" data-siret={siret}>
      <div className="p-4">{children}</div>
      <div className="text-center text-xs text-gray-400 py-2">
        Facturation &eacute;lectronique
      </div>
    </div>
  );
}
