import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  costPrice: number;
  currentStock: number;
  lowStockThreshold: number;
}

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  const formatRWF = (amount: number) => {
    return new Intl.NumberFormat("fr-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Prix vente</TableHead>
            <TableHead>Prix achat</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Seuil</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isLowStock = product.currentStock < product.lowStockThreshold;
            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-slate-600">{product.sku}</TableCell>
                <TableCell>{formatRWF(product.unitPrice)}</TableCell>
                <TableCell>{formatRWF(product.costPrice)}</TableCell>
                <TableCell>{product.currentStock}</TableCell>
                <TableCell>{product.lowStockThreshold}</TableCell>
                <TableCell>
                  {isLowStock ? (
                    <Badge variant="destructive">Stock bas</Badge>
                  ) : (
                    <Badge variant="secondary">En stock</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}