"use client";

import { useEffect } from "react";

export default function EmbedMessenger({
  siret,
  token,
}: {
  siret: string;
  token: string;
}) {
  useEffect(() => {
    window.parent.postMessage({ type: "invoquo:loaded", siret }, "*");

    // Warn parent 5 min before token expiry (token lasts 1h)
    const expiryWarning = setTimeout(() => {
      window.parent.postMessage({ type: "invoquo:token-expiring" }, "*");
    }, 55 * 60 * 1000);

    function handleMessage(event: MessageEvent) {
      const { type, payload } = event.data || {};
      if (type === "bativio:new-token" && payload?.token) {
        const url = new URL(window.location.href);
        url.searchParams.set("token", payload.token);
        window.location.href = url.toString();
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      clearTimeout(expiryWarning);
      window.removeEventListener("message", handleMessage);
    };
  }, [siret, token]);

  return null;
}
