import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createCompany = async (name: string, userId: string, currency = "RWF") => {
  const company = await prisma.company.create({
    data: {
      name,
      currency,
      timezone: "Africa/Kigali",
      members: { create: { userId, role: "OWNER" } },
    },
    include: { members: { include: { user: true } } },
  });
  return company;
};

export const getUserCompanies = async (userId: string) => {
  return prisma.company.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { include: { user: true } },
      _count: { select: { products: true, sales: true } },
    },
  });
};

export const getCompanyById = async (companyId: string, userId: string) => {
  return prisma.company.findFirst({
    where: { id: companyId, members: { some: { userId } } },
    include: { products: { where: { isActive: true } } },
  });
};