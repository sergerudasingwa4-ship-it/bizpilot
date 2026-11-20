import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createExpense = async (
  companyId: string,
  data: {
    category: string;
    amount: number;
    description?: string;
    occurredAt?: Date;
  }
) => {
  const expense = await prisma.expense.create({
    data: {
      companyId,
      category: data.category,
      amount: data.amount,
      description: data.description,
      occurredAt: data.occurredAt || new Date(),
    },
  });

  // Créer automatiquement un mouvement de caisse SORTANT
  await prisma.cashMovement.create({
    data: {
      companyId,
      type: "OUT",
      amount: data.amount,
      description: `Dépense: ${data.category} - ${data.description || "Sans description"}`,
      expenseId: expense.id,
    },
  });

  return expense;
};

export const getCompanyExpenses = async (companyId: string) => {
  return prisma.expense.findMany({
    where: { companyId },
    orderBy: { occurredAt: "desc" },
  });
};

export const getExpensesByCategory = async (companyId: string) => {
  return prisma.expense.groupBy({
    by: ["category"],
    where: { companyId },
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: "desc" } },
  });
};