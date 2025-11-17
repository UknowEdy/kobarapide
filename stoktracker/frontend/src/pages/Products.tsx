import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useApp } from '@/context/AppContext';
import { Product } from '@/types';
import { Plus, Search, X } from 'lucide-react';

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { products, loadingProducts, refreshProducts, addProduct, updateProduct, deleteProduct } = useApp();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    buyPrice: '',
    sellPrice: '',
    stock: '',
    alertThreshold: '5',
    category: '',
    description: ''
  });

  useEffect(() => {
    refreshProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      barcode: formData.barcode || undefined,
      buyPrice: parseFloat(formData.buyPrice),
      sellPrice: parseFloat(formData.sellPrice),
      stock: parseInt(formData.stock),
      alertThreshold: parseInt(formData.alertThreshold),
      category: formData.category || undefined,
      description: formData.description || undefined
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, productData);
      } else {
        await addProduct(productData);
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      barcode: product.barcode || '',
      buyPrice: product.buyPrice.toString(),
      sellPrice: product.sellPrice.toString(),
      stock: product.stock.toString(),
      alertThreshold: product.alertThreshold.toString(),
      category: product.category || '',
      description: product.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Supprimer "${product.name}" ?`)) {
      try {
        await deleteProduct(product._id);
      } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de supprimer ce produit');
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      barcode: '',
      buyPrice: '',
      sellPrice: '',
      stock: '',
      alertThreshold: '5',
      category: '',
      description: ''
    });
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  // Filtrage des produits
  const filter = searchParams.get('filter');
  let filteredProducts = products;

  if (search) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search))
    );
  }

  if (filter === 'lowStock') {
    filteredProducts = filteredProducts.filter(
      (p) => p.stock <= p.alertThreshold
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
            <p className="text-gray-600">{products.length} produit(s)</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par nom ou code-barres..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            fullWidth
          />
        </div>

        {/* Products List */}
        {loadingProducts ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun produit trouvé</p>
            <Button className="mt-4" onClick={() => setShowModal(true)}>
              Ajouter un produit
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div key={product._id} className="relative">
                <ProductCard product={product} onClick={() => handleEdit(product)} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(product);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <Input
                label="Nom du produit *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
              />

              <Input
                label="Code-barres"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                fullWidth
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prix d'achat (FCFA) *"
                  name="buyPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.buyPrice}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <Input
                  label="Prix de vente (FCFA) *"
                  name="sellPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.sellPrice}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Stock *"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <Input
                  label="Seuil d'alerte *"
                  name="alertThreshold"
                  type="number"
                  min="0"
                  value={formData.alertThreshold}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </div>

              <Input
                label="Catégorie"
                name="category"
                value={formData.category}
                onChange={handleChange}
                fullWidth
              />

              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={closeModal} fullWidth>
                  Annuler
                </Button>
                <Button type="submit" fullWidth>
                  {editingProduct ? 'Mettre à jour' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Products;
