import express from 'express';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes sont protégées
router.use(protect);

// @route   GET /api/reports/dashboard
// @desc    Récupérer les statistiques du tableau de bord
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Ventes du jour
    const todaySales = await Sale.aggregate([
      {
        $match: {
          user: req.user._id,
          saleDate: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalProfit: { $sum: '$profit' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Ventes de la semaine
    const weekSales = await Sale.aggregate([
      {
        $match: {
          user: req.user._id,
          saleDate: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalProfit: { $sum: '$profit' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Ventes du mois
    const monthSales = await Sale.aggregate([
      {
        $match: {
          user: req.user._id,
          saleDate: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalProfit: { $sum: '$profit' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Produits en stock faible
    const lowStockProducts = await Product.find({
      user: req.user._id
    });

    const lowStock = lowStockProducts.filter(p => p.isLowStock());

    // Valeur totale du stock
    const stockValue = await Product.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $group: {
          _id: null,
          totalBuyValue: { $sum: { $multiply: ['$buyPrice', '$stock'] } },
          totalSellValue: { $sum: { $multiply: ['$sellPrice', '$stock'] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        today: todaySales[0] || { totalRevenue: 0, totalProfit: 0, count: 0 },
        week: weekSales[0] || { totalRevenue: 0, totalProfit: 0, count: 0 },
        month: monthSales[0] || { totalRevenue: 0, totalProfit: 0, count: 0 },
        lowStockCount: lowStock.length,
        lowStockProducts: lowStock.slice(0, 10),
        stockValue: stockValue[0] || { totalBuyValue: 0, totalSellValue: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

// @route   GET /api/reports/sales-by-period
// @desc    Récupérer les ventes par période
// @access  Private
router.get('/sales-by-period', async (req, res) => {
  try {
    const { period = 'week' } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate;
    let groupFormat;

    if (period === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } };
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } };
    } else if (period === 'year') {
      startDate = new Date(today.getFullYear(), 0, 1);
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$saleDate' } };
    }

    const sales = await Sale.aggregate([
      {
        $match: {
          user: req.user._id,
          saleDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupFormat,
          totalRevenue: { $sum: '$total' },
          totalProfit: { $sum: '$profit' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des ventes par période',
      error: error.message
    });
  }
});

// @route   GET /api/reports/top-products
// @desc    Récupérer les produits les plus vendus
// @access  Private
router.get('/top-products', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await Sale.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits populaires',
      error: error.message
    });
  }
});

export default router;
