import React from 'react';
import { Product } from '@/types';
import { Package, AlertTriangle } from 'lucide-react';
import Card from './Card';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const isLowStock = product.stock <= product.alertThreshold;
  const margin = product.sellPrice - product.buyPrice;
  const marginPercent = product.buyPrice > 0
    ? ((margin / product.buyPrice) * 100).toFixed(1)
    : '0';

  return (
    <Card onClick={onClick}>
      <div className="flex items-start gap-3">
        {/* Icon/Image */}
        <div className="flex-shrink-0">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>

          {product.barcode && (
            <p className="text-xs text-gray-500">Code: {product.barcode}</p>
          )}

          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-primary-600">
              {product.sellPrice.toLocaleString()} FCFA
            </span>
            <span className="text-xs text-gray-500">
              (Marge: {marginPercent}%)
            </span>
          </div>

          {/* Stock */}
          <div className="mt-2 flex items-center gap-2">
            {isLowStock ? (
              <div className="flex items-center gap-1 text-orange-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Stock faible: {product.stock}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-600">
                Stock: {product.stock}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
