import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  buyPrice: {
    type: Number,
    required: [true, 'Le prix d\'achat est requis'],
    min: 0
  },
  sellPrice: {
    type: Number,
    required: [true, 'Le prix de vente est requis'],
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  alertThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  category: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index pour recherche rapide
productSchema.index({ name: 'text', barcode: 'text' });

// Virtuel pour calculer la marge
productSchema.virtual('margin').get(function() {
  return this.sellPrice - this.buyPrice;
});

// Virtuel pour calculer le pourcentage de marge
productSchema.virtual('marginPercent').get(function() {
  if (this.buyPrice === 0) return 0;
  return ((this.sellPrice - this.buyPrice) / this.buyPrice * 100).toFixed(2);
});

// Méthode pour vérifier si le stock est bas
productSchema.methods.isLowStock = function() {
  return this.stock <= this.alertThreshold;
};

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
