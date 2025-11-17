import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import BarcodeScanner from '@/components/BarcodeScanner';
import { useApp } from '@/context/AppContext';
import { Product } from '@/types';
import { Camera, Search, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';

const Sell: React.FC = () => {
  const { products, cart, addToCart, updateCartQuantity, removeFromCart, clearCart, cartTotal, createSale } = useApp();

  const [showScanner, setShowScanner] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (value: string) => {
    setSearch(value);

    if (value.trim()) {
      const results = products.filter(
        (p) =>
          p.name.toLowerCase().includes(value.toLowerCase()) ||
          (p.barcode && p.barcode.includes(value))
      );
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleScan = (code: string) => {
    const product = products.find((p) => p.barcode === code);

    if (product) {
      addToCart(product, 1);
      setSearch('');
      setShowResults(false);
    } else {
      alert(`Aucun produit trouvé avec le code: ${code}`);
    }
  };

  const handleSelectProduct = (product: Product) => {
    addToCart(product, 1);
    setSearch('');
    setShowResults(false);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Le panier est vide');
      return;
    }

    if (loading) return;

    const confirmSale = confirm(
      `Confirmer la vente de ${cartTotal.toLocaleString()} FCFA ?`
    );

    if (!confirmSale) return;

    setLoading(true);

    try {
      const saleData = {
        items: cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity
        })),
        paymentMethod: 'cash'
      };

      await createSale(saleData);

      alert('Vente enregistrée avec succès!');
      clearCart();
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle vente</h1>
          <p className="text-gray-600">Ajoutez des produits au panier</p>
        </div>

        {/* Search & Scanner */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              fullWidth
            />

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-10">
                {searchResults.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      {product.sellPrice.toLocaleString()} FCFA - Stock: {product.stock}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button onClick={() => setShowScanner(true)}>
            <Camera className="w-5 h-5" />
          </Button>
        </div>

        {/* Cart */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Panier ({cart.length})
          </h2>

          {cart.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Panier vide</p>
                <p className="text-sm text-gray-400 mt-1">
                  Recherchez ou scannez des produits
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <Card key={item.product._id}>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.product.sellPrice.toLocaleString()} FCFA x {item.quantity}
                      </p>
                      <p className="text-lg font-bold text-primary-600 mt-1">
                        {(item.product.sellPrice * item.quantity).toLocaleString()} FCFA
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateCartQuantity(item.product._id, item.quantity - 1)
                        }
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateCartQuantity(item.product._id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.product.stock}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Total & Checkout */}
        {cart.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold text-gray-700">Total:</span>
                <span className="text-2xl font-bold text-primary-600">
                  {cartTotal.toLocaleString()} FCFA
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={clearCart}
                  disabled={loading}
                  className="flex-1"
                >
                  Vider
                </Button>
                <Button
                  onClick={handleCheckout}
                  loading={loading}
                  className="flex-[2]"
                >
                  Valider la vente
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </Layout>
  );
};

export default Sell;
