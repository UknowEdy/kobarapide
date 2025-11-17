import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import { useApp } from '@/context/AppContext';
import api from '@/services/api';
import { DashboardStats } from '@/types';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Package,
  ArrowRight
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { products, isOnline } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [isOnline]);

  const loadStats = async () => {
    if (!isOnline) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockProducts = products.filter(
    (p) => p.stock <= p.alertThreshold
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">Aperçu de votre activité</p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stats ? (
          <>
            {/* Aujourd'hui */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Aujourd'hui
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Ventes</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {stats.today.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.today.count} transaction(s)
                      </p>
                    </div>
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Bénéfice</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {stats.today.totalProfit.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">FCFA</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Cette semaine */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Cette semaine
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Ventes</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">
                        {stats.week.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </div>
                </Card>

                <Card>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Bénéfice</p>
                      <p className="text-xl font-bold text-green-600 mt-1">
                        {stats.week.totalProfit.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </Card>
              </div>
            </div>

            {/* Ce mois */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ventes du mois</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.month.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Bénéfice: {stats.month.totalProfit.toLocaleString()} FCFA
                  </p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <DollarSign className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </Card>
          </>
        ) : null}

        {/* Alertes stock */}
        {lowStockProducts.length > 0 && (
          <Card
            className="border-l-4 border-orange-500"
            onClick={() => navigate('/products?filter=lowStock')}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Alerte stock faible
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {lowStockProducts.length} produit(s) à réapprovisionner
                  </p>
                  <div className="mt-2 space-y-1">
                    {lowStockProducts.slice(0, 3).map((product) => (
                      <div
                        key={product._id}
                        className="text-xs text-gray-500 flex items-center gap-2"
                      >
                        <Package className="w-3 h-3" />
                        <span>
                          {product.name}: {product.stock} restant(s)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        )}

        {/* Valeur du stock */}
        {stats && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Valeur du stock</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Coût d'achat</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.stockValue.totalBuyValue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">FCFA</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Valeur de vente</p>
                <p className="text-lg font-bold text-primary-600">
                  {stats.stockValue.totalSellValue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">FCFA</p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card onClick={() => navigate('/sell')}>
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-2">
                <ShoppingBag className="w-6 h-6 text-primary-600" />
              </div>
              <p className="font-medium text-gray-900">Nouvelle vente</p>
            </div>
          </Card>

          <Card onClick={() => navigate('/products')}>
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-medium text-gray-900">Gérer produits</p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
