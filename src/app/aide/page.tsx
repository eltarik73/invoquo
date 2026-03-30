import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/landing/nav";

export const metadata: Metadata = {
  title: "Centre d'aide Invoquo — FAQ et support",
  description:
    "Retrouvez toutes les réponses à vos questions sur Invoquo : création de compte, facturation électronique, réforme 2026, tarifs, intégrations API et plus encore.",
  alternates: { canonical: "https://invoquo.vercel.app/aide" },
};

const detailsStyle: React.CSSProperties = {
  border: "1px solid #f0edf0",
  borderRadius: 12,
  marginBottom: 8,
};

const summaryStyle: React.CSSProperties = {
  padding: "16px 20px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  listStyle: "none",
};

const answerStyle: React.CSSProperties = {
  padding: "0 20px 16px",
  fontSize: 14.5,
  color: "#555",
  lineHeight: 1.65,
};

export default function AidePage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-[720px] mx-auto">
          {/* ── Header ── */}
          <section className="mb-14">
            <h1
              className="font-bold tracking-tight text-gray-900"
              style={{ fontSize: 28, lineHeight: 1.25 }}
            >
              Centre d&apos;aide
            </h1>
            <p
              className="mt-4 text-gray-500"
              style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 560 }}
            >
              Trouvez rapidement les réponses à vos questions sur la facturation
              électronique, votre compte Invoquo et la conformité 2026.
            </p>
          </section>

          {/* ── 1. Premiers pas ── */}
          <section className="mb-10">
            <h3
              className="font-semibold text-gray-900 mb-4"
              style={{ fontSize: 17 }}
            >
              Premiers pas
            </h3>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Comment créer mon compte Invoquo ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Rendez-vous sur{" "}
                  <Link href="/signup" className="text-[#7c3aed] underline">
                    la page d&apos;inscription
                  </Link>{" "}
                  et renseignez votre adresse e-mail et un mot de passe. Vous
                  serez ensuite invité à saisir votre numéro de SIRET : Invoquo
                  récupère automatiquement les informations de votre entreprise
                  (raison sociale, adresse, forme juridique) grâce à
                  l&apos;annuaire officiel Pappers. En quelques clics, votre
                  espace de facturation est prêt.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Comment créer ma première facture ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Depuis votre tableau de bord, cliquez sur le bouton
                  &laquo;&nbsp;Nouvelle facture&nbsp;&raquo;. Sélectionnez ou
                  créez un client, ajoutez vos lignes de prestation (désignation,
                  quantité, prix unitaire HT, taux de TVA), puis validez. Invoquo
                  génère automatiquement un PDF au format Factur-X, conforme à la
                  réglementation, que vous pouvez envoyer par e-mail ou transmettre
                  via votre Plateforme Agréée.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Comment ajouter un client ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Deux possibilités : depuis le menu
                  &laquo;&nbsp;Clients&nbsp;&raquo; en cliquant sur
                  &laquo;&nbsp;Nouveau client&nbsp;&raquo;, ou directement lors
                  de la création d&apos;une facture. Si votre client est une
                  entreprise, saisissez son SIRET et les champs seront
                  pré-remplis automatiquement. Pour un particulier, renseignez
                  simplement son nom et son adresse.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Comment créer un devis ?
              </summary>
              <div style={answerStyle}>
                <p>
                  La création d&apos;un devis suit le même processus que la
                  création d&apos;une facture. Depuis le menu
                  &laquo;&nbsp;Devis&nbsp;&raquo;, cliquez sur
                  &laquo;&nbsp;Nouveau devis&nbsp;&raquo;, remplissez les
                  informations client et les lignes de prestation, puis
                  enregistrez. Lorsque votre client accepte le devis, vous pouvez
                  le convertir en facture en un clic.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                L&apos;essai gratuit est-il sans engagement ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Oui, totalement. Vous bénéficiez d&apos;un mois d&apos;essai
                  gratuit sans carte bancaire et sans engagement. À la fin de la
                  période d&apos;essai, vous choisissez le forfait qui vous
                  convient ou votre compte passe simplement en lecture seule.
                  Aucune facturation surprise.
                </p>
              </div>
            </details>
          </section>

          {/* ── 2. Facturation électronique et réforme 2026 ── */}
          <section className="mb-10">
            <h3
              className="font-semibold text-gray-900 mb-4"
              style={{ fontSize: 17 }}
            >
              Facturation électronique et réforme 2026
            </h3>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                La facturation électronique est-elle obligatoire en 2026 ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Oui. À compter du 1er septembre 2026, toutes les entreprises
                  assujetties à la TVA devront être en mesure de recevoir des
                  factures électroniques via une Plateforme Agréée certifiée par
                  l&apos;État. L&apos;obligation d&apos;émission suivra en 2027
                  pour les grandes entreprises et ETI, puis en 2028 pour les TPE
                  et PME. Invoquo vous permet d&apos;être conforme dès
                  maintenant.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Qu&apos;est-ce qu&apos;une Plateforme Agréée (PA) ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Une Plateforme Agréée est un intermédiaire certifié par la
                  Direction Générale des Finances Publiques (DGFiP) qui assure
                  la transmission, la réception et le contrôle des factures
                  électroniques entre les entreprises et l&apos;administration
                  fiscale. Les PA doivent répondre à des normes strictes de
                  sécurité (ISO 27001) et de conformité (NF 203). Invoquo
                  s&apos;appuie sur une PA immatriculée pour garantir la
                  conformité de vos factures.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Un PDF envoyé par e-mail est-il une facture électronique ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Non. Un simple fichier PDF envoyé par e-mail ne constitue pas
                  une facture électronique au sens de la réforme. Pour être
                  conforme, la facture doit être au format structuré (Factur-X,
                  UBL ou CII) et être transmise via une Plateforme Agréée. C&apos;est
                  exactement ce que fait Invoquo : chaque facture est générée au
                  format Factur-X et transmise automatiquement via la PA.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Qu&apos;est-ce que le format Factur-X ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Factur-X est un format hybride qui combine un document PDF
                  lisible par l&apos;humain et un fichier XML structuré lisible
                  par les logiciels. Ce format, normé par la norme franco-allemande
                  EN 16931, permet à la fois la lecture visuelle de la facture et
                  son traitement automatique par les systèmes comptables. Invoquo
                  génère toutes les factures dans ce format.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Quelles sont les sanctions en cas de non-conformité ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Les sanctions prévues sont les suivantes : 500 euros d&apos;amende
                  dès septembre 2026 si vous n&apos;êtes pas connecté à une
                  Plateforme Agréée (puis 1 000 euros tous les trois mois),
                  15 euros par facture non émise au format électronique, et
                  250 euros par manquement aux obligations de e-reporting.
                  Invoquo vous met en conformité pour éviter ces pénalités.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Qu&apos;est-ce que le e-reporting ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Le e-reporting est l&apos;obligation de transmettre à
                  l&apos;administration fiscale les données de transactions qui
                  ne relèvent pas de la facturation électronique inter-entreprises
                  (B2B domestique). Cela concerne notamment les ventes aux
                  particuliers (B2C) et les transactions avec des entreprises
                  établies à l&apos;étranger. La Plateforme Agréée utilisée par
                  Invoquo gère automatiquement le routage : les factures B2B
                  passent par le circuit e-invoicing, les autres par le
                  e-reporting.
                </p>
              </div>
            </details>
          </section>

          {/* ── 3. Fonctionnalités ── */}
          <section className="mb-10">
            <h3
              className="font-semibold text-gray-900 mb-4"
              style={{ fontSize: 17 }}
            >
              Fonctionnalités
            </h3>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Invoquo gère-t-il la TVA BTP (taux réduits) ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Oui. Invoquo prend en charge tous les taux de TVA applicables
                  en France, y compris les taux réduits du secteur BTP : 10 %
                  pour les travaux de rénovation et d&apos;amélioration, et 5,5 %
                  pour les travaux d&apos;amélioration de la performance
                  énergétique. Vous pouvez appliquer un taux de TVA différent à
                  chaque ligne de facturation.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Les mentions légales artisan sont-elles automatiques ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Oui. Dès que vous renseignez vos informations d&apos;assurance
                  professionnelle (numéro de contrat, assureur, couverture
                  géographique) dans les paramètres, Invoquo ajoute
                  automatiquement ces mentions obligatoires sur toutes vos
                  factures. De même, les mentions liées à la franchise en base
                  de TVA, à l&apos;autoliquidation ou à l&apos;appartenance à
                  une association agréée sont générées automatiquement selon
                  votre configuration.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Puis-je envoyer mes factures par e-mail ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Oui. Une fois votre facture créée et validée, vous pouvez
                  l&apos;envoyer directement par e-mail à votre client depuis
                  Invoquo. Le PDF Factur-X est joint automatiquement. Vous pouvez
                  personnaliser l&apos;objet et le corps de l&apos;e-mail dans
                  les paramètres, et programmer des relances automatiques en cas
                  de retard de paiement.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Puis-je exporter mes données pour mon comptable ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Oui. Invoquo propose plusieurs formats d&apos;export : le
                  Fichier des Écritures Comptables (FEC), obligatoire en cas de
                  contrôle fiscal, l&apos;export CSV ou Excel pour les
                  traitements personnalisés, le rapport PDF mensuel synthétique,
                  et l&apos;archive Factur-X (ZIP contenant tous les PDF
                  structurés de la période). Tous ces exports sont accessibles
                  depuis le menu &laquo;&nbsp;Export comptable&nbsp;&raquo;.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Invoquo fonctionne-t-il sur mobile ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Oui. Invoquo est une application web responsive, optimisée
                  pour une utilisation sur smartphone et tablette. Vous pouvez
                  créer une facture, consulter vos statistiques ou vérifier vos
                  factures reçues directement depuis votre téléphone, sur le
                  chantier ou en déplacement. Aucune application à installer.
                </p>
              </div>
            </details>
          </section>

          {/* ── 4. Tarifs et abonnement ── */}
          <section className="mb-10">
            <h3
              className="font-semibold text-gray-900 mb-4"
              style={{ fontSize: 17 }}
            >
              Tarifs et abonnement
            </h3>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Combien coûte Invoquo ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Invoquo propose deux forfaits mensuels sans engagement :
                </p>
                <ul
                  style={{
                    marginTop: 8,
                    paddingLeft: 20,
                    listStyleType: "disc",
                  }}
                >
                  <li style={{ marginBottom: 4 }}>
                    <strong>Essentiel</strong> — 19 euros HT / mois : réception
                    des factures fournisseurs via la Plateforme Agréée.
                  </li>
                  <li>
                    <strong>Pro</strong> — 49 euros HT / mois : réception +
                    création de factures, devis, avoirs, relances automatiques,
                    export comptable et reporting.
                  </li>
                </ul>
                <p style={{ marginTop: 8 }}>
                  Chaque forfait inclut un mois d&apos;essai gratuit sans carte
                  bancaire.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Puis-je changer de forfait ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Oui, à tout moment. Vous pouvez passer du forfait Essentiel au
                  forfait Pro (ou inversement) directement depuis vos paramètres.
                  Le changement prend effet immédiatement et le montant est
                  ajusté au prorata de la période restante.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Comment annuler mon abonnement ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Rendez-vous dans les paramètres de votre compte, section
                  &laquo;&nbsp;Abonnement&nbsp;&raquo;, puis cliquez sur
                  &laquo;&nbsp;Annuler mon abonnement&nbsp;&raquo;. Votre
                  accès reste actif jusqu&apos;à la fin de la période en cours.
                  Vos données sont conservées et vous pouvez vous réabonner à
                  tout moment.
                </p>
              </div>
            </details>
          </section>

          {/* ── 5. Intégrations et API ── */}
          <section className="mb-14">
            <h3
              className="font-semibold text-gray-900 mb-4"
              style={{ fontSize: 17 }}
            >
              Intégrations et API
            </h3>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Puis-je connecter mon logiciel à Invoquo ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Oui. Invoquo expose une API REST complète qui permet
                  d&apos;intégrer la facturation électronique dans n&apos;importe
                  quel logiciel tiers. Vous pouvez créer des factures, gérer vos
                  clients, récupérer les factures reçues et consulter vos
                  statistiques de manière programmatique. Consultez la{" "}
                  <Link
                    href="/docs/api"
                    className="text-[#7c3aed] underline"
                  >
                    documentation API
                  </Link>{" "}
                  pour en savoir plus.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                Comment obtenir une clé API ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Rendez-vous dans les paramètres de votre compte, section
                  &laquo;&nbsp;API et intégrations&nbsp;&raquo;. Vous pouvez y
                  générer une clé API liée à votre SIRET. Cette clé doit être
                  conservée de manière sécurisée côté serveur et ne doit jamais
                  être exposée dans le navigateur.
                </p>
              </div>
            </details>

            <details style={detailsStyle}>
              <summary style={summaryStyle}>
                L&apos;intégration est-elle gratuite ?
              </summary>
              <div style={answerStyle}>
                <p>
                  Oui. L&apos;accès à l&apos;API est inclus dans tous les
                  forfaits Invoquo, sans surcoût ni limitation spécifique. Seules
                  les limites de débit standard s&apos;appliquent (100 requêtes
                  par minute) pour garantir la qualité du service.
                </p>
              </div>
            </details>
          </section>

          {/* ── Contact ── */}
          <section>
            <div
              style={{
                background: "#faf8ff",
                border: "1px solid #e9e0fc",
                borderRadius: 14,
                padding: "32px 28px",
                textAlign: "center",
              }}
            >
              <h3
                className="font-semibold text-gray-900"
                style={{ fontSize: 17, marginBottom: 8 }}
              >
                Vous ne trouvez pas la réponse ?
              </h3>
              <p
                className="text-gray-500"
                style={{ fontSize: 14.5, lineHeight: 1.6, marginBottom: 20 }}
              >
                Notre équipe est disponible pour vous aider. Écrivez-nous à{" "}
                <strong>support@invoquo.fr</strong> et nous vous répondons sous
                24 heures.
              </p>
              <a
                href="mailto:support@invoquo.fr"
                style={{
                  display: "inline-block",
                  background: "#7c3aed",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "10px 24px",
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                Contacter le support
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
