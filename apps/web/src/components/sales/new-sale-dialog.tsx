"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";

interface NewSaleDialogProps {
  companyId: string;
  token: string;
  onSaleCreated: () => void;
}

interface Product {
  id: string;
  name: string;
  unitPrice: number;
  currentStock: number;
}

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export function NewSaleDialog({ companyId, token, onSaleCreated }: NewSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  // Charger les produits à l'ouverture du modal
  useEffect(() => {
    if (open && token) {
      fetch(`http://localhost:4000/products/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : (data.data || []);
          setProducts(list);
        })
        .catch(console.error);
    }
  }, [open, companyId, token]);

  const addToCart = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const qty = parseInt(quantity);
    const price = parseFloat(unitPrice) || product.unitPrice;

    if (qty <= 0 || qty > product.currentStock) {
      alert(`Quantité invalide (stock disponible: ${product.currentStock})`);
      return;
    }

    setCart([
      ...cart,
      {
        productId: product.id,
        productName: product.name,
        quantity: qty,
        unitPrice: price,
      },
    ]);

    setSelectedProductId("");
    setQuantity("");
    setUnitPrice("");
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      alert("Ajoutez au moins un produit au panier");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId,
          paymentMethod,
          notes,
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la vente");
      }

      setCart([]);
      setNotes("");
      setOpen(false);
      onSaleCreated();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Nouvelle vente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle vente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ajout de produit au panier */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-sm">Ajouter un produit</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Produit</Label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((x) => x.id === e.target.value);
                    if (p) setUnitPrice(p.unitPrice.toString());
                  }}
                  className="w-full h-9 px-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="">-- Sélectionner --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (stock: {p.currentStock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">Quantité</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  min="1"
                />
              </div>
              <div>
                <Label className="text-xs">Prix unitaire (RWF)</Label>
                <Input
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={addToCart} className="w-full" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>
          </div>

          {/* Panier */}
          {cart.length > 0 && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-2">Produit</th>
                    <th className="text-right p-2">Qté</th>
                    <th className="text-right p-2">Prix</th>
                    <th className="text-right p-2">Total</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{item.productName}</td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2 text-right">{item.unitPrice.toLocaleString()}</td>
                      <td className="p-2 text-right font-medium">
                        {(item.quantity * item.unitPrice).toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        <button onClick={() => removeFromCart(i)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-slate-50 p-3 flex justify-between font-semibold border-t">
                <span>Total :</span>
                <span>{total.toLocaleString()} RWF</span>
              </div>
            </div>
          )}

          {/* Méthode de paiement */}
          <div>
            <Label>Méthode de paiement</Label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-9 px-2 border border-slate-300 rounded-md mt-1"
            >
              <option value="cash">Espèces</option>
              <option value="mobile">Mobile Money</option>
              <option value="card">Carte</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (optionnel)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Vente client fidèle"
            />
          </div>

          {/* Bouton valider */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={loading || cart.length === 0}>
              {loading ? "Enregistrement..." : `Valider la vente (${total.toLocaleString()} RWF)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}