import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Sale {
  id: string;
  saleNumber: string;
  totalAmount: number;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

interface SaleTableProps {
  sales: Sale[];
}

export function SaleTable({ sales }: SaleTableProps) {
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
            <TableHead>N° Vente</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Paiement</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">{sale.saleNumber}</TableCell>
              <TableCell>{formatDate(sale.createdAt)}</TableCell>
              <TableCell className="font-semibold text-green-600">
                {formatRWF(sale.totalAmount)}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {sale.paymentMethod === "cash" ? "Espèces" : sale.paymentMethod}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-500 text-sm">
                {sale.notes || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}