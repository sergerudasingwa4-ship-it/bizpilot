import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface CashMovement {
  id: string;
  type: "IN" | "OUT";
  amount: number;
  description: string;
  createdAt: string;
}

interface CashMovementsTableProps {
  movements: CashMovement[];
}

export function CashMovementsTable({ movements }: CashMovementsTableProps) {
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

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>
                {movement.type === "IN" ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <ArrowDownCircle className="w-4 h-4" />
                    <Badge className="bg-green-100 text-green-700">Entrée</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <ArrowUpCircle className="w-4 h-4" />
                    <Badge className="bg-red-100 text-red-700">Sortie</Badge>
                  </div>
                )}
              </TableCell>
              <TableCell
                className={`font-semibold ${
                  movement.type === "IN" ? "text-green-600" : "text-red-600"
                }`}
              >
                {movement.type === "IN" ? "+" : "−"}
                {formatRWF(movement.amount)}
              </TableCell>
              <TableCell className="text-slate-600">{movement.description}</TableCell>
              <TableCell className="text-slate-500">{formatDate(movement.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}