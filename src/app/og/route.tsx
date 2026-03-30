import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        fontSize: 48,
        background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
        color: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px",
      }}>
        <div style={{ fontSize: 72, fontWeight: "bold" }}>Invoquo</div>
        <div style={{ fontSize: 36, marginTop: 20, opacity: 0.9 }}>
          Facturation Electronique Conforme 2026
        </div>
        <div style={{
          fontSize: 24,
          marginTop: 30,
          background: "rgba(255,255,255,0.15)",
          padding: "10px 30px",
          borderRadius: "50px",
        }}>
          Connecte Plateforme Agreee DGFiP
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
