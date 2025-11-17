import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import { useApp } from '@/context/AppContext';
import { Sale } from '@/types';
import { TrendingUp, DollarSign, Calendar, Package } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Reports: React.FC = () => {
  const { sales, refreshSales, loadingSales } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    refreshSales();
  }, []);

  // Filtrer les ventes par période
  const filterSalesByPeriod = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return sales.filter((sale) => {
      const saleDate = new Date(sale.saleDate);

      if (selectedPeriod === 'today') {
        return saleDate >= today;
      } else if (selectedPeriod === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return saleDate >= weekAgo;
      } else if (selectedPeriod === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return saleDate >= monthAgo;
      }
      return true;
    });
  };

  const filteredSales = filterSalesByPeriod();

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalCost = filteredSales.reduce((sum, sale) => sum + sale.totalCost, 0);

  // Produits les plus vendus
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();

  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      const existing = productSales.get(item.product);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
      } else {
        productSales.set(item.product, {
          name: item.productName,
          quantity: item.quantity,
          revenue: item.subtotal
        });
      }
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-600">Analyse de votre activité</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('today')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              selectedPeriod === 'today'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              selectedPeriod === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            7 jours
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              selectedPeriod === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            30 jours
          </button>
        </div>

        {loadingSales ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">FCFA</p>
                  </div>
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Bénéfice net</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {totalProfit.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">FCFA</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Coût total</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {totalCost.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">FCFA</p>
                  </div>
                  <DollarSign className="w-5 h-5 text-gray-600" />
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Transactions</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {filteredSales.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">ventes</p>
                  </div>
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </Card>
            </div>

            {/* Top Products */}
            {topProducts.length > 0 && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Produits les plus vendus
                </h3>
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-primary-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            {product.quantity} vendus
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-primary-600">
                        {product.revenue.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Sales */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Ventes récentes</h3>
              {filteredSales.length === 0 ? (
                <Card>
                  <p className="text-center text-gray-500 py-6">Aucune vente</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredSales.slice(0, 10).map((sale) => (
                    <Card key={sale._id}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Reçu #{sale.receiptNumber}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {sale.items.length} article(s)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(sale.saleDate), 'PPp', { locale: fr })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary-600">
                            {sale.total.toLocaleString()} FCFA
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            +{sale.profit.toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
