import { jwtVerify } from "jose";

const EMBED_SECRET = new TextEncoder().encode(process.env.EMBED_JWT_SECRET!);

interface EmbedPayload {
  sub: string;
  siret: string;
  type: "embed";
  modules: string[];
  exp: number;
}

export async function verifyEmbedToken(
  token: string,
): Promise<EmbedPayload | null> {
  try {
    const { payload } = await jwtVerify(token, EMBED_SECRET);
    if (payload.type !== "embed") return null;
    return payload as unknown as EmbedPayload;
  } catch {
    return null;
  }
}
