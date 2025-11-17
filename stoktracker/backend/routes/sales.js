import express from 'express';
import { body } from 'express-validator';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Toutes les routes sont protégées
router.use(protect);

// @route   GET /api/sales
// @desc    Récupérer toutes les ventes de l'utilisateur
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;

    let query = { user: req.user._id };

    // Filtrer par date
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query)
      .sort({ saleDate: -1 })
      .limit(parseInt(limit))
      .populate('items.product', 'name');

    res.json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des ventes',
      error: error.message
    });
  }
});

// @route   GET /api/sales/:id
// @desc    Récupérer une vente par ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product', 'name barcode');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Vente non trouvée'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la vente',
      error: error.message
    });
  }
});

// @route   POST /api/sales
// @desc    Créer une nouvelle vente
// @access  Private
router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('Au moins un article est requis'),
    body('items.*.product').notEmpty().withMessage('ID produit requis'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantité doit être >= 1'),
    body('paymentMethod').optional().isIn(['cash', 'mobile_money', 'card', 'credit'])
  ],
  validate,
  async (req, res) => {
    try {
      const { items, paymentMethod, customerName, customerPhone, notes } = req.body;

      let total = 0;
      let totalCost = 0;
      const processedItems = [];

      // Traiter chaque article
      for (const item of items) {
        const product = await Product.findOne({
          _id: item.product,
          user: req.user._id
        });

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Produit ${item.product} non trouvé`
          });
        }

        // Vérifier le stock
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}`
          });
        }

        const subtotal = product.sellPrice * item.quantity;
        const cost = product.buyPrice * item.quantity;

        processedItems.push({
          product: product._id,
          productName: product.name,
          quantity: item.quantity,
          buyPrice: product.buyPrice,
          sellPrice: product.sellPrice,
          subtotal
        });

        total += subtotal;
        totalCost += cost;

        // Déduire le stock
        product.stock -= item.quantity;
        await product.save();
      }

      const profit = total - totalCost;

      // Générer le numéro de reçu
      const receiptNumber = await Sale.generateReceiptNumber();

      // Créer la vente
      const sale = await Sale.create({
        items: processedItems,
        total,
        totalCost,
        profit,
        paymentMethod: paymentMethod || 'cash',
        customerName,
        customerPhone,
        notes,
        receiptNumber,
        user: req.user._id
      });

      res.status(201).json({
        success: true,
        data: sale
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la vente',
        error: error.message
      });
    }
  }
);

// @route   DELETE /api/sales/:id
// @desc    Annuler une vente (restaurer le stock)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Vente non trouvée'
      });
    }

    // Restaurer le stock pour chaque article
    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await Sale.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vente annulée et stock restauré'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la vente',
      error: error.message
    });
  }
});

export default router;
