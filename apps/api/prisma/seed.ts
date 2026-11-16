import "dotenv/config";
// apps/api/prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seed...");

  // 1. Créer le mot de passe haché
  const hashedPassword = await bcrypt.hash("owner123", 10);

  // 2. Créer le premier utilisateur (Propriétaire)
  const owner = await prisma.user.create({
    data: {
      email: "owner@bizpilot.rw",
      fullName: "Jean Propriétaire",
      passwordHash: hashedPassword,
      phone: "+250780000001",
    },
  });
  console.log("✅ Utilisateur créé:", owner.email);

  // 3. Créer la première entreprise
  const company = await prisma.company.create({
    data: {
      name: "Boutique Kigali",
      currency: "RWF",
      timezone: "Africa/Kigali",
    },
  });
  console.log("✅ Entreprise créée:", company.name);

  // 4. Lier l'utilisateur à l'entreprise avec le rôle OWNER
  await prisma.companyMember.create({
    data: {
      userId: owner.id,
      companyId: company.id,
      role: "OWNER",
    },
  });
  console.log("✅ Lien Owner-Entreprise créé");

  console.log("🎉 Seed terminé !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });