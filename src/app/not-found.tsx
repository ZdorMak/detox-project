import Link from "next/link";

// next-intl: top-level not-found is reached when no locale prefix matches.
export default function GlobalNotFound() {
  return (
    <html lang="fr">
      <body>
        <div style={{ padding: "4rem", textAlign: "center", fontFamily: "system-ui" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>404</h1>
          <p>Page introuvable / Page not found.</p>
          <p>
            <Link href="/">Retour à l&apos;accueil / Back home</Link>
          </p>
        </div>
      </body>
    </html>
  );
}
