import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const DEMO_EMAIL = "demo@invoquo.fr";
  const DEMO_PASSWORD = "invoquo2026";
  const DEMO_SIRET = "91234567800012";
  const DEMO_API_KEY = "inv_demo_key_2026_invoquo_test";

  const existingUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (existingUser) {
    console.log("Compte demo existe deja, skip.");
    return;
  }

  const tenant = await prisma.tenant.create({
    data: {
      siret: DEMO_SIRET,
      siren: "912345678",
      companyName: "Invoquo Demo",
      legalForm: "SAS",
      address: "15 rue de la Republique",
      postalCode: "73000",
      city: "Chambery",
      country: "FR",
      vatNumber: "FR 91 912345678",
      apeCode: "6201Z",
      phone: "06 00 00 00 00",
      email: DEMO_EMAIL,
      apiKey: DEMO_API_KEY,
      apiKeyCreatedAt: new Date(),
      paStatus: "disconnected",
      nextInvoiceNum: 26,
      nextQuoteNum: 8,
      nextCreditNum: 2,
      templateId: "classic",
      accentColor: "#7c3aed",
      headerLine1: "Invoquo Demo — Electricien",
      footerLine1: "Invoquo Demo · SIRET 912 345 678 00012 · APE 6201Z",
      footerLine2: "TVA FR 91 912345678 · RCS Chambery",
      iban: "FR76 1234 5678 9012 3456 7890 123",
      bic: "BNPAFRPP",
      bankName: "BNP Paribas",
      bankAccountHolder: "Invoquo Demo",
      showBankOnInvoice: true,
    },
  });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash,
      role: "user",
      firstName: "Demo",
      lastName: "Invoquo",
      tenantId: tenant.id,
    },
  });

  console.log("Compte demo cree:");
  console.log(`  Email    : ${DEMO_EMAIL}`);
  console.log(`  Password : ${DEMO_PASSWORD}`);
  console.log(`  SIRET    : ${DEMO_SIRET}`);
  console.log(`  ApiKey   : ${DEMO_API_KEY}`);

  // Clients fictifs
  const clientsData = [
    { companyName: "Boulangerie Martin", siret: "82345678900012", siren: "823456789", email: "contact@martin-boulangerie.fr", address: "12 rue des Boulangers", postalCode: "73000", city: "Chambery" },
    { companyName: "Restaurant Le Savoyard", siret: "91234567800013", siren: "912345670", email: "contact@le-savoyard.fr", address: "5 place du marche", postalCode: "73000", city: "Chambery" },
    { companyName: "Garage Dupont", siret: "45678912300014", siren: "456789123", email: "garage.dupont@email.fr", address: "8 avenue de Turin", postalCode: "73000", city: "Chambery" },
    { companyName: "Pharmacie Leclerc", siret: "67891234500015", siren: "678912345", email: "pharmacie.leclerc@email.fr", address: "22 boulevard de la Colonne", postalCode: "73000", city: "Chambery" },
    { companyName: "SCI Les Alpes", siret: "34567891200016", siren: "345678912", email: "sci.alpes@email.fr", address: "1 chemin des Cimes", postalCode: "73000", city: "Chambery" },
  ];

  for (const c of clientsData) {
    await prisma.client.create({
      data: {
        tenantId: tenant.id,
        type: "company",
        companyName: c.companyName,
        siret: c.siret,
        siren: c.siren,
        email: c.email,
        address: c.address,
        postalCode: c.postalCode,
        city: c.city,
        country: "FR",
        source: "direct",
      },
    });
  }
  console.log(`${clientsData.length} clients fictifs crees`);

  // Factures fictives
  const clients = await prisma.client.findMany({ where: { tenantId: tenant.id } });
  const invoices = [
    { idx: 0, number: "F-2026-025", status: "paid", totalHT: 1215, totalVAT: 243, totalTTC: 1458, daysAgo: 1 },
    { idx: 1, number: "F-2026-024", status: "transmitted", totalHT: 3400, totalVAT: 680, totalTTC: 4080, daysAgo: 3 },
    { idx: 2, number: "F-2026-023", status: "pending", totalHT: 890, totalVAT: 178, totalTTC: 1068, daysAgo: 5 },
    { idx: 3, number: "F-2026-022", status: "paid", totalHT: 2100, totalVAT: 420, totalTTC: 2520, daysAgo: 10 },
    { idx: 4, number: "F-2026-021", status: "overdue", totalHT: 780, totalVAT: 156, totalTTC: 936, daysAgo: 25 },
  ];

  for (const inv of invoices) {
    const date = new Date();
    date.setDate(date.getDate() - inv.daysAgo);
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 30);

    await prisma.invoice.create({
      data: {
        tenantId: tenant.id,
        clientId: clients[inv.idx].id,
        invoiceNumber: inv.number,
        status: inv.status,
        type: "invoice",
        date,
        dueDate,
        paymentTerms: "30_days",
        operationCategory: "services",
        currency: "EUR",
        totalHT: inv.totalHT,
        totalVAT: inv.totalVAT,
        totalTTC: inv.totalTTC,
        paidAt: inv.status === "paid" ? new Date() : null,
      },
    });
  }
  console.log(`${invoices.length} factures fictives crees`);

  console.log("");
  console.log("Seed termine !");
  console.log("ApiKey demo : inv_demo_key_2026_invoquo_test");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
