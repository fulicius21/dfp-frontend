import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShoppingBag, Star, Truck, RotateCcw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

// Types
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount: number;
  category: string;
  collection: string;
  images: string[];
  sizes: string[];
  colors: Array<{ name: string; value: string; code: string }>;
  variants: Array<{
    id: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
    price: number;
  }>;
  tags: string[];
  material: string;
  careInstructions: string;
  sustainabilityInfo: string;
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const { addItem, getItemQuantity } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch('/data/products.json');
        const products = await response.json();
        const foundProduct = products.find((p: Product) => p.id === id);
        
        if (foundProduct) {
          setProduct(foundProduct);
          // Set default selections
          if (foundProduct.colors.length > 0) {
            setSelectedColor(foundProduct.colors[0].code);
          }
          if (foundProduct.sizes.length > 0) {
            setSelectedSize(foundProduct.sizes[0]);
          }
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const getSelectedVariant = () => {
    if (!product) return null;
    return product.variants.find(
      variant => variant.size === selectedSize && variant.color === selectedColor
    );
  };

  const getMaxStock = () => {
    const variant = getSelectedVariant();
    return variant ? variant.stock : 0;
  };

  const isInStock = () => {
    return getMaxStock() > 0;
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize || !selectedColor) {
      toast({
        title: "Auswahl erforderlich",
        description: "Bitte wählen Sie Größe und Farbe aus.",
        variant: "destructive",
      });
      return;
    }

    const variant = getSelectedVariant();
    if (!variant) {
      toast({
        title: "Variante nicht verfügbar",
        description: "Die gewählte Kombination ist nicht verfügbar.",
        variant: "destructive",
      });
      return;
    }

    const selectedColorObj = product.colors.find(c => c.code === selectedColor);
    
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColorObj?.name || selectedColor,
      image: product.images[0],
      maxStock: variant.stock,
    });

    toast({
      title: "Zum Warenkorb hinzugefügt",
      description: `${product.name} (${selectedSize}, ${selectedColorObj?.name}) wurde hinzugefügt.`,
    });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Von Wunschliste entfernt" : "Zur Wunschliste hinzugefügt",
      description: product?.name,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link kopiert",
        description: "Der Produktlink wurde in die Zwischenablage kopiert.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Produkt nicht gefunden</h2>
          <p className="text-gray-600 mb-8">Das gesuchte Produkt konnte nicht gefunden werden.</p>
          <Button asChild>
            <Link to="/produkte">Zurück zu den Produkten</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentVariantStock = getItemQuantity(getSelectedVariant()?.id || '');

  return (
    <div className="min-h-screen bg-white">
      {/* ...dein kompletter UI Code bleibt hier, wie oben... */}
    </div>
  );
};

export default ProductDetailPage;
