import express from 'express';
import { body } from 'express-validator';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Toutes les routes sont protégées
router.use(protect);

// @route   GET /api/products
// @desc    Récupérer tous les produits de l'utilisateur
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { search, lowStock } = req.query;

    let query = { user: req.user._id };

    // Recherche textuelle
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    // Filtrer les produits en stock faible
    let filteredProducts = products;
    if (lowStock === 'true') {
      filteredProducts = products.filter(p => p.isLowStock());
    }

    res.json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits',
      error: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Récupérer un produit par ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit',
      error: error.message
    });
  }
});

// @route   POST /api/products
// @desc    Créer un nouveau produit
// @access  Private
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Le nom du produit est requis'),
    body('buyPrice').isFloat({ min: 0 }).withMessage('Le prix d\'achat doit être >= 0'),
    body('sellPrice').isFloat({ min: 0 }).withMessage('Le prix de vente doit être >= 0'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Le stock doit être >= 0'),
    body('alertThreshold').optional().isInt({ min: 0 }).withMessage('Le seuil d\'alerte doit être >= 0')
  ],
  validate,
  async (req, res) => {
    try {
      const productData = {
        ...req.body,
        user: req.user._id
      };

      // Vérifier si un produit avec ce code-barres existe déjà
      if (req.body.barcode) {
        const existingProduct = await Product.findOne({
          barcode: req.body.barcode,
          user: req.user._id
        });

        if (existingProduct) {
          return res.status(400).json({
            success: false,
            message: 'Un produit avec ce code-barres existe déjà'
          });
        }
      }

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du produit',
        error: error.message
      });
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Mettre à jour un produit
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier si le code-barres est déjà utilisé par un autre produit
    if (req.body.barcode && req.body.barcode !== product.barcode) {
      const existingProduct = await Product.findOne({
        barcode: req.body.barcode,
        user: req.user._id,
        _id: { $ne: req.params.id }
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Un autre produit utilise déjà ce code-barres'
        });
      }
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du produit',
      error: error.message
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Supprimer un produit
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du produit',
      error: error.message
    });
  }
});

// @route   GET /api/products/barcode/:code
// @desc    Rechercher un produit par code-barres
// @access  Private
router.get('/barcode/:code', async (req, res) => {
  try {
    const product = await Product.findOne({
      barcode: req.params.code,
      user: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Aucun produit trouvé avec ce code-barres'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      error: error.message
    });
  }
});

export default router;
