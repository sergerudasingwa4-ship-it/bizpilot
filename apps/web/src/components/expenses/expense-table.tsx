import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Expense {
  id: string;
  category: string;
  amount: number;
  description?: string;
  occurredAt: string;
}

interface ExpenseTableProps {
  expenses: Expense[];
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  const formatRWF = (amount: number) => {
    return new Intl.NumberFormat("fr-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const categoryColors: Record<string, string> = {
    Loyer: "bg-purple-100 text-purple-700",
    Électricité: "bg-yellow-100 text-yellow-700",
    Transport: "bg-blue-100 text-blue-700",
    Salaires: "bg-green-100 text-green-700",
    Fournitures: "bg-orange-100 text-orange-700",
    Autres: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Catégorie</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>
                <Badge className={categoryColors[expense.category] || categoryColors.Autres}>
                  {expense.category}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold text-red-600">
                {formatRWF(expense.amount)}
              </TableCell>
              <TableCell className="text-slate-600">
                {expense.description || "—"}
              </TableCell>
              <TableCell className="text-slate-500">
                {formatDate(expense.occurredAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}