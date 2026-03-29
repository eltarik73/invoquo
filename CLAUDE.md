# CLAUDE.md — Invoquo

## Projet

Invoquo est un SaaS de facturation électronique ciblant les TPE, artisans et auto-entrepreneurs en France. Échéance réglementaire : **1er septembre 2026** (obligation de réception pour TOUTES les entreprises assujetties TVA).

Invoquo fonctionne en **double usage** :
1. **Application standalone** — un artisan va sur app.invoquo.fr et gère toute sa facturation
2. **Moteur embeddable** — intégré en marque blanche dans Bativio, Klik&Go et tout site tiers via iframe + API

4 canaux de distribution : Invoquo direct, Bativio, Klik&Go, Klikphone.

**Positionnement** : simple, friendly, conforme. L'artisan ne voit jamais de jargon technique. Il voit "Vous êtes en règle".

---

## Stack technique

| Couche | Technologie | Hébergement |
|---|---|---|
| Frontend + Backend | Next.js (App Router, API Routes, Server Actions) | Vercel |
| ORM | Prisma | — |
| Base de données | PostgreSQL | Railway |
| Auth | **Maison** (JWT access 15min + refresh rotatif hashé en BDD) | — |
| Jobs background | BullMQ + Upstash Redis | Cloud |
| Stockage PDF | Vercel Blob | Vercel |
| Génération PDF | @react-pdf/renderer (server-side, cible < 50 Ko) | — |
| Emails | Resend | Cloud |
| DNS / CDN | Cloudflare | Cloud |
| SIRET auto-fill | API Pappers v2 | — |
| Monitoring | Sentry | Cloud |
| Validation | Zod | — |

**Pas de Clerk.** Auth 100% maison : JWT access token (15 min) + refresh token rotatif (90 jours), hashé en BDD. Même pattern que Bativio.

---

## Design system (verrouillé — V8)

| Élément | Valeur |
|---|---|
| Typographie | **DM Sans** (body + titres) + **DM Mono** (numéros, montants, dates) |
| Couleur primaire | **#7c3aed** (violet) |
| Couleur primaire light | #f5f3ff |
| Couleur primaire dark | #6d28d9 |
| Style | Mix **Qonto** (clean, pro, sidebar structurée) + **Tiime** (explications simples, chaleureux, friendly) |
| Fond | Blanc pur / #f9fafb |
| Cards | Blanc, border 1px #e5e7eb, border-radius 10px |
| Animations | Cascade au chargement (fadeIn), compteurs animés |
| Statuts | Vert (payée), Bleu (transmise), Ambre (en attente), Rouge (en retard/rejetée), Gris (brouillon) |

**Rejeté** : mockups dashboard dans le hero, emojis fusée/étoile, animations trop complexes, look générique IA, Inter/Roboto.

---

## Architecture modulaire

Invoquo est découpé en modules indépendants. Chaque module est un dossier dans `src/modules/`. L'app standalone utilise tous les modules. Une app hôte n'utilise que ceux qu'elle veut.

### Modules

```
src/modules/
├── auth/           # Auth maison (JWT, refresh, sessions, middleware)
├── tenant/         # Multi-tenant par SIRET (gestion entreprises, onboarding)
├── invoicing/      # Création factures, devis, avoirs, numérotation séquentielle
├── received/       # Factures reçues via PA (Mode Pont)
├── clients/        # Gestion contacts clients + fournisseurs
├── pa/             # Intégration Plateforme Agréée (provisioning, polling, émission)
├── pdf/            # Génération PDF + Factur-X (@react-pdf/renderer)
├── isca/           # NF525 auto-certification (chaînage HMAC, JET, clôtures, export)
├── reporting/      # CA, TVA, statuts, top clients, graphiques
├── export/         # Export comptable (FEC, CSV, Excel, archive Factur-X)
├── embed/          # Routes embed pour iframe + theming + postMessage + embedToken
├── api-external/   # API REST externe pour apps hôtes (auth apiKey)
├── notifications/  # Emails transactionnels (Resend) + notifications in-app
└── settings/       # Paramètres (templates facture, mentions, numérotation, banque, emails)
```

### Structure d'un module

```
src/modules/invoicing/
├── actions/          # Server Actions (Next.js)
├── api/              # API Routes (app/api/...)
├── components/       # Composants React (UI)
├── hooks/            # Custom hooks
├── lib/              # Logique métier pure (pas de dépendance React)
├── schemas/          # Schemas Zod (validation)
├── types/            # Types TypeScript
└── index.ts          # Exports publics du module
```

---

## Authentification (maison)

**Pas de Clerk. Pas de NextAuth. 100% custom.**

```
Inscription : email + mot de passe → hash bcrypt → JWT access (15min) + refresh (90j, rotatif, hashé en BDD)
Connexion : email + mdp → vérif bcrypt → access + refresh
Refresh : POST /api/auth/refresh → nouveau access + nouveau refresh (l'ancien est invalidé)
Déconnexion : POST /api/auth/logout → refresh token supprimé en BDD
```

**Rôles** : `user` (défaut), `admin`
- Rôle stocké dans la table `User` en BDD (source de vérité unique)
- Middleware vérifie le JWT access token sur les routes protégées
- Defense in depth : chaque route API vérifie aussi le rôle si nécessaire
- Si rôle absent ou inconnu → traiter comme `user` (moindre privilège)

**Tables auth** :
```
User { id, email, passwordHash, role, siret, companyName, createdAt, updatedAt }
RefreshToken { id, userId, tokenHash, expiresAt, createdAt }
```

---

## Multi-tenant

- Chaque tenant = un SIRET
- Toute requête est scopée par `siret` (WHERE siret = ...)
- Les données d'un tenant ne sont JAMAIS accessibles par un autre
- Index composites sur (siret, createdAt) pour les requêtes fréquentes

---

## Plateforme Agréée (PA)

**IMPORTANT : dans l'interface utilisateur, on dit TOUJOURS "Plateforme Agréée" ou "PA". Jamais le nom du prestataire sauf dans les paramètres de connexion.**

L'artisan voit :
- "Connecté à une Plateforme Agréée certifiée par l'État"
- "Vos factures sont transmises via votre PA"
- "Statut PA : connectée / en attente / erreur"

### PA retenue : Pennylane

| Critère | Valeur |
|---|---|
| Statut | PA immatriculée DGFiP |
| Certifications | NF 203 + ISO 27001 |
| Tarif | Gratuit et illimité |
| Marque | Grise (visible à l'inscription uniquement) |
| Webhooks | Non — polling changelogs |
| International | Access Point Peppol |

### Endpoints PA (API Company v2)

**Base URL** : `https://app.pennylane.com/api/external/v2/`
**Sandbox** : `https://sandbox.pennylane.com/api/external/v2/`
**Auth** : OAuth 2.0 (obligatoire en production)
**Rate limit** : 25 req / 5 sec par token

| Flux | Endpoint | Scope |
|---|---|---|
| Émission Factur-X | POST /v2/customer_invoices/e_invoices/imports | customer_invoices:all |
| Réception Factur-X | POST /v2/supplier_invoices/e_invoices/imports | supplier_invoices:write |
| Création structurée | POST /v2/customer_invoices | customer_invoices:all |
| Polling réception | GET /v2/changelogs/supplier_invoices | supplier_invoices:all |
| Statuts PA | Champ e_invoicing.status dans les réponses | — |
| Devis | POST /v2/quotes | quotes:all |

**⚠️ Endpoints dépréciés — NE PAS utiliser :**
- `POST /v2/e-invoices/imports` → remplacé par les endpoints spécifiques customer/supplier
- Reseller API → remplacée par Provisioning API

### Provisioning API (onboarding automatique)

**Base URL** : `/api/external/provisioning/v1/`
**Auth** : OAuth 2.0 `client_credentials`
**Scopes** : `users` + `companies:all`

```
1. POST /provisioning/v1/users        → crée l'utilisateur (email)
2. POST /provisioning/v1/companies    → crée l'entreprise (plan v1_freemium)
3. PUT  /provisioning/v1/companies/{id}/complete_registration → SIREN
4. L'utilisateur reçoit un email PA → onboarding (KBIS, signature mandat PA)
```

### Polling changelogs (pas de webhooks)

```typescript
// Job BullMQ toutes les 10 minutes
async function pollReceivedInvoices(tenant: Tenant) {
  // 1. GET /changelogs/supplier_invoices?start_date={lastSync}
  // 2. Paginer avec cursor (has_more + next_cursor)
  // 3. Batch fetch les factures complètes (filtre in)
  // 4. Upsert dans ReceivedInvoice (paInvoiceId comme clé unique)
  // 5. Gérer les deletes
  // 6. Sauver lastSync (processed_at du dernier changement)
}
```

### E-reporting

PA gère automatiquement le routage :
- Client B2B français (SIREN) → e-invoicing via PA/PPF
- Client B2C ou B2B international → e-reporting vers l'administration
- Invoquo envoie tout au format Factur-X, la PA dispatche

### Abstraction PA

```typescript
// src/modules/pa/lib/interface.ts
interface PlatformAdapter {
  // Auth
  getAuthUrl(redirectUri: string): string;
  exchangeCode(code: string): Promise<OAuthTokens>;
  refreshToken(refreshToken: string): Promise<OAuthTokens>;
  
  // Réception
  pollReceivedInvoices(since: Date): Promise<ReceivedInvoice[]>;
  
  // Émission
  importFacturX(file: Buffer): Promise<{ id: string }>;
  createInvoice(data: InvoicePayload): Promise<{ id: string }>;
  
  // Provisioning
  createUser(data: UserPayload): Promise<{ id: string }>;
  createCompany(data: CompanyPayload): Promise<{ id: string }>;
  completeRegistration(companyId: string, siren: string): Promise<void>;
  
  // Statuts
  getInvoiceStatus(id: string): Promise<string>;
}

// src/modules/pa/lib/pennylane.ts
class PennylaneAdapter implements PlatformAdapter { ... }
```

---

## Mentions obligatoires sur les factures

### Mentions existantes (Code de commerce L441-9 + CGI art. 242 nonies A)

Chaque facture générée par Invoquo DOIT contenir :

1. Date d'émission
2. Numéro unique (séquentiel, chronologique, sans rupture)
3. Date de la vente ou prestation
4. Identité émetteur (nom/raison sociale, adresse, SIRET, forme juridique + capital si société, mention "EI" si entrepreneur individuel)
5. Identité client (nom/raison sociale, adresse)
6. N° TVA intracommunautaire émetteur + client (si > 150€ HT)
7. N° bon de commande (si applicable)
8. Désignation précise des produits/prestations
9. Décompte détaillé (quantité, PU HT, taux TVA par ligne)
10. Total HT et TTC
11. Réductions éventuelles (rabais, ristourne, remise)
12. Date de règlement + conditions d'escompte (ou "néant")
13. Taux de pénalités de retard
14. Indemnité forfaitaire de recouvrement 40€

### 4 nouvelles mentions (réforme sept 2026)

15. **SIREN du client** (si entreprise) — obligatoire
16. **Adresse de livraison** (si différente de l'adresse client)
17. **Catégorie d'opération** : "Livraison de biens" / "Prestation de services" / "Mixte"
18. **"Option pour le paiement de la TVA d'après les débits"** (si applicable)

### Mentions spécifiques artisans (Code de l'artisanat L132-1)

19. Assurance professionnelle (n° contrat, coordonnées assureur, couverture géographique)

### Mentions conditionnelles

20. "Membre d'une association agréée, le règlement par chèque et carte bancaire est accepté"
21. "TVA non applicable, art. 293 B du CGI" (si franchise en base)
22. "Autoliquidation" (si reverse charge)

### Format obligatoire

23. Factur-X, UBL ou CII (PDF simple envoyé par email = NON CONFORME)
24. Transmission via PA obligatoire (pas d'envoi direct)

### Sanctions

- 500€ dès sept 2026 sans PA (puis 1 000€ tous les 3 mois)
- 15€ par facture non électronique
- 250€ par manquement e-reporting

---

## NF525 / Auto-certification ISCA

### Périmètre

La NF525 est obligatoire UNIQUEMENT si Invoquo enregistre des **encaissements B2C** (paiements de particuliers). La facturation B2B pure n'est PAS dans le périmètre.

**V1 (sept 2026)** : Mode Pont (réception uniquement) + création factures/devis → PAS d'encaissement → NF525 NON requise.

**V2+ (si on ajoute l'enregistrement des paiements)** : NF525 requise → activer la brique ISCA.

### Statut dans l'interface

Afficher dans l'espace Conformité :
- "Auto-certification ISCA — bientôt disponible"
- "Invoquo sécurise et archive vos données conformément à la réglementation."
- Pas de jargon technique visible par l'artisan

### Architecture ISCA (prête à implémenter)

4 piliers : Inaltérabilité, Sécurisation, Conservation, Archivage

**Inaltérabilité :**
- Chaînage HMAC-SHA256 double couche (SHA1(siret+publicKey) + HMAC secretKey)
- 5 tables signées séparément (commandes, articles, paiements, fermetures, tracabilite)
- RULES PostgreSQL no-UPDATE/no-DELETE sur les tables signées
- Numérotation séquentielle sans trou (pg_advisory_xact_lock)
- Corrections par avoir/remboursement uniquement

**Sécurisation :**
- JET (Journal Événements Techniques) chaîné en HMAC-SHA256
- Compteur impression/envoi par document
- Duplicatas avec mention "DUPLICATA"
- Rôle Comptable (admin fiscal, lecture seule)
- Outil vérification HMAC en ligne + hors ligne

**Conservation :**
- Clôtures automatiques Z (jour) / M (mois) / Y (année)
- Totaux perpétuels
- Rétention 7 ans
- Politique zéro purge

**Archivage :**
- Export CSV avec 4 champs de vérification (thehash, verifName, hashSource, validity)
- Archive ZIP avec Signatures.txt
- Format ouvert

**⚠️ BLOQUANT** : validation par avocat fiscaliste requise AVANT signature de la première attestation. Responsabilité pénale : 3 ans + 45 000€ si fausse attestation.

---

## Intégration dans les apps hôtes (embed)

### 3 couches d'intégration

**Couche 1 — API REST multi-tenant** (serveur → serveur)
- Auth par apiKey liée au SIRET
- Endpoints : /invoices, /quotes, /received-invoices, /clients, /stats
- Chaque app choisit les modules qu'elle consomme
- Format réponse : `{ success, data, error, timestamp }`

**Couche 2 — iframe embed** (portail par tenant)
- URL : `app.invoquo.fr/embed/{siret}/{module}?token={embedToken}`
- Theming via CSS variables (couleurs de l'app hôte)
- Mode headless : suppression sidebar/header Invoquo
- Communication parent ↔ iframe via postMessage

**Couche 3 — API headless** (données légères)
- Compteurs, badges, notifications
- Le frontend de l'app hôte appelle directement l'API

### Modèle de sécurité embed (3 niveaux)

**Niveau 1 — apiKey** (serveur → serveur)
- Stockée en DB côté app hôte (colonne chiffrée)
- JAMAIS exposée au navigateur
- Longue durée, révocable par tenant

**Niveau 2 — embedToken** (iframe, court terme)
- JWT signé par Invoquo, durée 1h
- Contient : siret, modules autorisés, expiration
- Généré par le backend de l'app hôte via l'apiKey : POST /api/v1/embed-tokens
- Passé à l'iframe en query param
- Refresh automatique via postMessage avant expiry

**Niveau 3 — Contrôle tenant** (isolation)
- Chaque requête vérifie que le SIRET de l'apiKey correspond au tenant demandé
- SIRET hardcodé dans le JWT
- Pas de cross-tenant possible

---

## Tarification

| Plan | Prix | Contenu |
|---|---|---|
| Essentiel | 19€/mois HT | Réception factures via PA uniquement |
| Pro | 49€/mois HT | Réception + création factures/devis/avoirs + relances + export + reporting |

- 1 mois gratuit sans CB
- Stripe pour les abonnements

---

## Pages de l'application

### Standalone (app complète avec sidebar)

1. **Tableau de bord** — CTA "Nouvelle facture" proéminent, KPIs (émises, reçues, CA, en retard), dernières factures, activité, factures reçues PA
2. **Factures** — liste complète, onglets par statut (Toutes/Brouillons/En attente/Transmises/Payées/En retard/Rejetées), recherche, filtres (période, client, tri), checkboxes pour actions en masse, actions au hover (voir, dupliquer, relancer, PDF), pagination
3. **Nouvelle facture** — formulaire complet : client (recherche + auto-fill SIRET/TVA Pappers), infos facture (numérotation auto, dates, conditions paiement, catégorie opération), lignes de facturation (désignation, qté, PU HT, TVA par ligne), totaux auto (HT, TVA ventilée, TTC), mentions légales auto-générées, aperçu live Factur-X à droite
4. **Factures reçues** — onglets (Toutes/À traiter/Validées), recherche, échéances colorées
5. **Devis** — liste, statuts (En attente/Accepté/Refusé), conversion devis → facture
6. **Clients** — liste avec SIRET, nb factures, impayés, CA total, filtre par source (Direct/Bativio/Klik&Go), fiche client détaillée
7. **Reporting** — CA mensuel (barres), donut statuts, top 5 clients, ventilation TVA (20%/10%/5,5%), sélecteur période, export PDF
8. **Export comptable** — FEC (obligatoire contrôle fiscal), CSV/Excel, rapport PDF mensuel, archive Factur-X ZIP, historique exports
9. **Conformité** — statut PA, stats (transmises, e-reporting, rejets), checklist conformité, ISCA "bientôt disponible"
10. **Paramètres** — 6 onglets :
    - Modèle de facture (5 templates : Classique, Moderne, Épuré, Latéral, Audacieux)
    - Mon entreprise (raison sociale, SIRET, TVA, adresse, forme juridique, assurance)
    - Mentions légales (obligatoires auto-cochées, conditionnelles, CGV)
    - Numérotation (format, préfixes factures/devis/avoirs, séquentiel auto)
    - Coordonnées bancaires (IBAN, BIC, affichage sur factures)
    - Emails (templates personnalisables avec variables, relances auto)

### Mode embed (dans Bativio, Klik&Go, etc.)

- Sidebar masquée
- Couleurs de l'app hôte via CSS variables
- Tag discret "Facturation par Invoquo"
- Mêmes pages, même logique, juste le chrome qui change

---

## Routes API internes (app standalone)

```
# Auth
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me

# Factures
GET    /api/invoices                    # liste avec filtres/pagination
POST   /api/invoices                    # créer (brouillon ou finalisée)
GET    /api/invoices/:id
PUT    /api/invoices/:id                # modifier brouillon
DELETE /api/invoices/:id                # supprimer brouillon uniquement
POST   /api/invoices/:id/finalize       # valider et transmettre PA
POST   /api/invoices/:id/duplicate
POST   /api/invoices/:id/send-email     # envoyer au client
GET    /api/invoices/:id/pdf            # télécharger PDF

# Factures reçues
GET    /api/received-invoices
GET    /api/received-invoices/:id
PUT    /api/received-invoices/:id       # valider / marquer traitée

# Devis
GET    /api/quotes
POST   /api/quotes
GET    /api/quotes/:id
PUT    /api/quotes/:id
POST   /api/quotes/:id/convert          # devis → facture
POST   /api/quotes/:id/send-email

# Clients
GET    /api/clients                      # liste avec filtres
POST   /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id
GET    /api/clients/:id/invoices         # factures du client

# Reporting
GET    /api/reporting/summary            # KPIs du mois
GET    /api/reporting/revenue            # CA mensuel
GET    /api/reporting/vat                # ventilation TVA
GET    /api/reporting/top-clients

# Export
POST   /api/exports/fec
POST   /api/exports/csv
POST   /api/exports/pdf-report
POST   /api/exports/facturx-archive

# PA
GET    /api/pa/status                    # statut connexion PA
POST   /api/pa/connect                   # initier OAuth PA
GET    /api/pa/callback                  # callback OAuth

# Settings
GET    /api/settings
PUT    /api/settings
POST   /api/settings/logo               # upload logo

# Webhooks entrants
POST   /api/webhooks/stripe
```

## Routes API externes (pour apps hôtes)

```
# Auth par apiKey (header X-Api-Key)
POST   /api/v1/embed-tokens             # générer un embedToken JWT
GET    /api/v1/invoices
POST   /api/v1/invoices
GET    /api/v1/received-invoices
GET    /api/v1/clients
GET    /api/v1/stats
POST   /api/v1/webhooks/subscribe       # s'abonner aux événements (nouvelle facture reçue, etc.)
```

---

## Schema Prisma (base)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// === AUTH ===

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          String    @default("user") // "user" | "admin"
  firstName     String?
  lastName      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  tenant        Tenant?   @relation(fields: [tenantId], references: [id])
  tenantId      String?

  refreshTokens RefreshToken[]
}

model RefreshToken {
  id         String   @id @default(cuid())
  tokenHash  String   @unique
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt  DateTime
  createdAt  DateTime @default(now())

  @@index([userId])
}

// === TENANT ===

model Tenant {
  id              String   @id @default(cuid())
  siret           String   @unique
  siren           String
  companyName     String
  legalForm       String?  // EI, EURL, SARL, SAS, SASU
  capital         String?
  address         String
  postalCode      String
  city            String
  country         String   @default("FR")
  vatNumber       String?  // TVA intracommunautaire
  apeCode         String?
  insuranceNumber String?  // assurance décennale
  insuranceProvider String?
  insuranceCoverage String?
  rcs             String?
  phone           String?
  email           String?
  website         String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // PA
  paProvider      String?  // "pennylane" | "seqino" | etc.
  paAccessToken   String?  // chiffré
  paRefreshToken  String?  // chiffré
  paTokenExpiresAt DateTime?
  paCompanyId     String?  // ID entreprise chez la PA
  paLastSync      DateTime?
  paStatus        String   @default("disconnected") // "connected" | "disconnected" | "error"

  // Settings
  invoicePrefix   String   @default("F-")
  quotePrefix     String   @default("D-")
  creditNotePrefix String  @default("AV-")
  nextInvoiceNum  Int      @default(1)
  nextQuoteNum    Int      @default(1)
  nextCreditNum   Int      @default(1)
  templateId      String   @default("classic") // classic, modern, minimal, lateral, bold
  accentColor     String   @default("#7c3aed")
  logoUrl         String?
  headerLine1     String?
  headerLine2     String?
  footerLine1     String?
  footerLine2     String?
  footerLine3     String?
  iban            String?
  bic             String?
  bankName        String?
  bankAccountHolder String?
  showBankOnInvoice Boolean @default(true)
  defaultPaymentTerms String @default("30_days") // a_reception, 30_days, 45_days_end_of_month, 60_days
  defaultLatePenaltyRate String @default("3x_legal_rate")
  defaultEarlyPaymentDiscount String @default("Néant")
  emailSubjectTemplate String?
  emailBodyTemplate String?
  reminderSubjectTemplate String?
  reminderBodyTemplate String?
  autoReminder    Boolean  @default(false)
  reminderDays    Int      @default(7)
  cgvText         String?
  attachCgv       Boolean  @default(false)
  vatOnDebits     Boolean  @default(false)
  isMemberAssociation Boolean @default(false)
  isVatExempt     Boolean  @default(false) // art. 293 B

  // Embed
  apiKey          String?  @unique // pour les apps hôtes
  apiKeyCreatedAt DateTime?

  users           User[]
  clients         Client[]
  invoices        Invoice[]
  receivedInvoices ReceivedInvoice[]
  quotes          Quote[]

  @@index([siren])
}

// === CLIENTS ===

model Client {
  id            String   @id @default(cuid())
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  type          String   @default("company") // "company" | "individual"
  companyName   String?
  firstName     String?
  lastName      String?
  siret         String?
  siren         String?
  vatNumber     String?
  email         String?
  phone         String?
  address       String?
  postalCode    String?
  city          String?
  country       String   @default("FR")
  deliveryAddress String? // si différente
  deliveryPostalCode String?
  deliveryCity  String?
  source        String   @default("direct") // "direct" | "bativio" | "klikgo"
  notes         String?
  paCustomerId  String?  // ID chez la PA
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  invoices      Invoice[]
  quotes        Quote[]

  @@unique([tenantId, siret])
  @@index([tenantId, createdAt])
}

// === FACTURES ===

model Invoice {
  id              String   @id @default(cuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id])
  invoiceNumber   String   // F-2026-001 (séquentiel, jamais modifiable)
  status          String   @default("draft") // draft, pending, sent, transmitted, accepted, paid, overdue, rejected
  type            String   @default("invoice") // invoice, credit_note, deposit
  date            DateTime
  dueDate         DateTime
  paymentTerms    String   // a_reception, 30_days, etc.
  operationCategory String // goods, services, mixed
  currency        String   @default("EUR")
  totalHT         Decimal  @db.Decimal(12, 2)
  totalVAT        Decimal  @db.Decimal(12, 2)
  totalTTC        Decimal  @db.Decimal(12, 2)
  discount        Decimal? @db.Decimal(12, 2)
  discountType    String?  // percentage, fixed
  notes           String?
  pdfUrl          String?  // Vercel Blob URL
  facturxUrl      String?  // Factur-X PDF URL
  paInvoiceId     String?  // ID chez la PA
  paStatus        String?  // statut PA (AFNOR)
  paSentAt        DateTime?
  paidAt          DateTime?
  sentAt          DateTime? // envoyé par email au client
  sendCount       Int      @default(0) // compteur d'envois
  linkedQuoteId   String?
  linkedCreditNoteId String?
  fromQuoteId     String?  // si converti depuis un devis
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  lines           InvoiceLine[]

  @@unique([tenantId, invoiceNumber])
  @@index([tenantId, status, createdAt])
  @@index([tenantId, clientId])
  @@index([paInvoiceId])
}

model InvoiceLine {
  id            String  @id @default(cuid())
  invoiceId     String
  invoice       Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  position      Int     // ordre d'affichage
  description   String
  quantity       Decimal @db.Decimal(10, 3)
  unitPriceHT    Decimal @db.Decimal(12, 2)
  vatRate        Decimal @db.Decimal(5, 2) // 20.00, 10.00, 5.50, 0.00
  totalHT        Decimal @db.Decimal(12, 2)
  totalVAT       Decimal @db.Decimal(12, 2)
  totalTTC       Decimal @db.Decimal(12, 2)
  unit           String? // piece, hour, m2, kg, etc.

  @@index([invoiceId])
}

// === FACTURES REÇUES (PA) ===

model ReceivedInvoice {
  id              String   @id @default(cuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  paInvoiceId     String   // ID chez la PA (clé unique pour upsert)
  supplierName    String
  supplierSiret   String?
  invoiceNumber   String?
  date            DateTime?
  dueDate         DateTime?
  totalHT         Decimal? @db.Decimal(12, 2)
  totalTTC        Decimal? @db.Decimal(12, 2)
  currency        String   @default("EUR")
  status          String   @default("pending") // pending, validated, rejected
  paStatus        String?  // statut PA
  pdfUrl          String?
  category        String?  // fournisseur classifié
  notes           String?
  receivedAt      DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([tenantId, paInvoiceId])
  @@index([tenantId, status, receivedAt])
}

// === DEVIS ===

model Quote {
  id              String   @id @default(cuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id])
  quoteNumber     String
  status          String   @default("draft") // draft, sent, accepted, rejected, expired
  date            DateTime
  validUntil      DateTime
  operationCategory String
  totalHT         Decimal  @db.Decimal(12, 2)
  totalVAT        Decimal  @db.Decimal(12, 2)
  totalTTC        Decimal  @db.Decimal(12, 2)
  notes           String?
  pdfUrl          String?
  convertedToInvoiceId String?
  sentAt          DateTime?
  acceptedAt      DateTime?
  rejectedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  lines           QuoteLine[]

  @@unique([tenantId, quoteNumber])
  @@index([tenantId, status, createdAt])
}

model QuoteLine {
  id            String  @id @default(cuid())
  quoteId       String
  quote         Quote   @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  position      Int
  description   String
  quantity       Decimal @db.Decimal(10, 3)
  unitPriceHT    Decimal @db.Decimal(12, 2)
  vatRate        Decimal @db.Decimal(5, 2)
  totalHT        Decimal @db.Decimal(12, 2)
  totalVAT       Decimal @db.Decimal(12, 2)
  totalTTC       Decimal @db.Decimal(12, 2)
  unit           String?

  @@index([quoteId])
}

// === EXPORTS ===

model Export {
  id          String   @id @default(cuid())
  tenantId    String
  type        String   // fec, csv, pdf_report, facturx_archive
  periodStart DateTime
  periodEnd   DateTime
  fileUrl     String?  // Vercel Blob URL
  fileName    String
  fileSize    Int?
  status      String   @default("pending") // pending, processing, completed, failed
  createdAt   DateTime @default(now())

  @@index([tenantId, createdAt])
}
```

---

## Conventions de code

### Général
- TypeScript strict partout
- Server Components par défaut, Client Components quand nécessaire (`"use client"`)
- Validation serveur avec Zod sur TOUTE mutation
- Prisma singleton (`lib/prisma.ts`)
- Pas de `new PrismaClient()` en dehors du singleton

### Nommage
- Fichiers : kebab-case (`invoice-list.tsx`, `create-invoice.ts`)
- Composants : PascalCase (`InvoiceList`, `CreateInvoiceForm`)
- Variables/fonctions : camelCase
- Tables Prisma : PascalCase
- Champs Prisma : camelCase
- Routes API : kebab-case (`/api/received-invoices`)
- Collections : pluriel anglais (`/invoices`, `/clients`, `/quotes`)

### Structure fichiers

```
invoquo/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # pages login/register (non protégées)
│   │   ├── (dashboard)/        # pages protégées (layout avec sidebar)
│   │   ├── embed/[siret]/      # routes embed (sans sidebar)
│   │   └── api/                # API Routes
│   ├── modules/                # modules métier (voir section Architecture)
│   ├── components/             # composants partagés (ui/, layout/)
│   ├── lib/                    # utilitaires (prisma.ts, auth.ts, utils.ts)
│   └── styles/                 # globals.css
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── next.config.ts
└── .env.local
```

### API Routes

- Format réponse : `{ success: boolean, data?: T, error?: string, timestamp: string }`
- Codes HTTP : 200, 201, 400, 401, 403, 404, 409, 422, 429, 500
- Pagination : `?page=1&limit=20` → réponse inclut `{ data, total, page, totalPages }`
- Filtres : query params (`?status=paid&clientId=xxx&from=2026-01-01&to=2026-03-31`)
- Tri : `?sort=createdAt&order=desc`

### Sécurité

- JWT access token dans header `Authorization: Bearer <token>`
- Refresh token dans httpOnly cookie
- Toute requête scopée par tenantId (multi-tenant)
- Rate limiting sur les endpoints publics
- HMAC signature sur les webhooks entrants (Stripe, PA)
- apiKey pour les apps hôtes dans header `X-Api-Key`
- embedToken JWT pour les iframes
- JAMAIS exposer les secrets côté client

---

## Variables d'environnement

```env
# Base de données
DATABASE_URL=postgresql://...

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=

# PA (Pennylane)
PA_CLIENT_ID=
PA_CLIENT_SECRET=
PA_REDIRECT_URI=
PA_SANDBOX=true

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend (emails)
RESEND_API_KEY=
FROM_EMAIL=facturation@invoquo.fr

# Pappers (SIRET)
PAPPERS_API_KEY=

# Vercel Blob (stockage PDF)
BLOB_READ_WRITE_TOKEN=

# Upstash Redis (BullMQ)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Sentry
SENTRY_DSN=

# Embed
EMBED_JWT_SECRET=

# ISCA (quand activé)
ISCA_SOFTWARE_PUBLIC_KEY=
# ISCA_SECRET_KEY est unique par tenant, stocké chiffré en BDD

# App
NEXT_PUBLIC_APP_URL=https://app.invoquo.fr
```

---

## Principes directeurs

1. **Simplicité** — L'artisan est non-tech. Chaque écran doit être compréhensible en 3 secondes.
2. **Conformité** — Chaque facture générée est conforme à la réforme. Pas d'option pour faire une facture non conforme.
3. **Modulaire** — Chaque module est indépendant. On peut brancher uniquement la PA dans Klik&Go sans le reste.
4. **Mobile-first** — L'artisan est sur chantier. Responsive obligatoire.
5. **PA invisible** — On dit "Plateforme Agréée", pas le nom du prestataire. Le nom apparaît uniquement dans les paramètres.
6. **Friendly** — Inspiré Tiime : explications simples, pas de jargon, messages chaleureux.
7. **Pas d'over-engineering** — On livre le Mode Pont d'abord (sept 2026), le Mode Clé en Main ensuite.

---

## Roadmap

### V1 — Mode Pont (sept 2026) — PRIORITÉ ABSOLUE
- Auth maison (register, login, refresh)
- Onboarding SIRET (Pappers auto-fill)
- Connexion PA (OAuth)
- Réception factures fournisseurs (polling changelogs)
- Dashboard
- Liste factures reçues
- Notifications (email + in-app)
- Stripe (abonnements Essentiel/Pro)

### V2 — Mode Clé en Main
- Création factures / devis / avoirs
- Génération PDF Factur-X
- Émission via PA
- Gestion clients
- Templates factures (5 modèles)
- Paramètres complets
- Reporting
- Export comptable (FEC, CSV)
- Conversion devis → facture
- Relances automatiques

### V3 — Intégration + Scale
- Routes embed + theming
- API externe (apiKey)
- embedToken JWT
- Branchement Bativio
- Branchement Klik&Go
- NF525/ISCA (si encaissements activés)
