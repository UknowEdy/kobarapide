import express from 'express';
import { body } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Créer un nouveau compte
// @access  Public
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Le nom est requis'),
    body('phone').trim().notEmpty().withMessage('Le téléphone est requis'),
    body('pin').isLength({ min: 4, max: 6 }).withMessage('Le PIN doit contenir 4-6 chiffres'),
    body('businessName').optional().trim()
  ],
  validate,
  async (req, res) => {
    try {
      const { name, phone, pin, businessName } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const userExists = await User.findOne({ phone });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'Ce numéro de téléphone est déjà utilisé'
        });
      }

      // Créer l'utilisateur
      const user = await User.create({
        name,
        phone,
        pin,
        businessName
      });

      res.status(201).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          businessName: user.businessName,
          token: generateToken(user._id)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du compte',
        error: error.message
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Connexion utilisateur
// @access  Public
router.post(
  '/login',
  [
    body('phone').trim().notEmpty().withMessage('Le téléphone est requis'),
    body('pin').notEmpty().withMessage('Le PIN est requis')
  ],
  validate,
  async (req, res) => {
    try {
      const { phone, pin } = req.body;

      // Vérifier l'utilisateur
      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Téléphone ou PIN incorrect'
        });
      }

      // Vérifier le PIN
      const isMatch = await user.matchPin(pin);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Téléphone ou PIN incorrect'
        });
      }

      res.json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          businessName: user.businessName,
          token: generateToken(user._id)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la connexion',
        error: error.message
      });
    }
  }
);

export default router;
