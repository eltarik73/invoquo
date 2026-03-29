import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ siret: string }>;
  searchParams: Promise<{ token?: string; accent?: string }>;
}

export default async function EmbedRootPage({
  params,
  searchParams,
}: Props) {
  const { siret } = await params;
  const { token, accent } = await searchParams;

  const query = new URLSearchParams();
  if (token) query.set("token", token);
  if (accent) query.set("accent", accent);

  redirect(`/embed/${siret}/dashboard?${query.toString()}`);
}
