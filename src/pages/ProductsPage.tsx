import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, Grid, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useProducts } from '../hooks/useApi';

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
  tags: string[];
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface Filters {
  category: string[];
  collection: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  tags: string[];
  inStock: boolean;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  const [filters, setFilters] = useState<Filters>({
    category: [],
    collection: [],
    priceRange: [0, 300],
    sizes: [],
    colors: [],
    tags: [],
    inStock: false,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load products
        const productsResponse = await fetch('/data/products.json');
        const productsData = await productsResponse.json();
        setProducts(productsData);
        setFilteredProducts(productsData);

        // Load categories
        const categoriesResponse = await fetch('/data/categories.json');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(product => filters.category.includes(product.category));
    }

    // Collection filter
    if (filters.collection.length > 0) {
      filtered = filtered.filter(product => filters.collection.includes(product.collection));
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Size filter
    if (filters.sizes.length > 0) {
      filtered = filtered.filter(product =>
        filters.sizes.some(size => product.sizes.includes(size))
      );
    }

    // Color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter(product =>
        filters.colors.some(color => product.colors.some(c => c.code === color))
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(product =>
        filters.tags.some(tag => product.tags.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return b.newArrival ? 1 : -1;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, filters, searchTerm, sortBy]);

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value)
        ? (prev[key] as string[]).filter(item => item !== value)
        : [...(prev[key] as string[]), value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      collection: [],
      priceRange: [0, 300],
      sizes: [],
      colors: [],
      tags: [],
      inStock: false,
    });
    setSearchTerm('');
  };

  const allCollections = [...new Set(products.map(p => p.collection))];
  const allSizes = [...new Set(products.flatMap(p => p.sizes))];
  const allColors = [...new Set(products.flatMap(p => p.colors.map(c => c.code)))];
  const allTags = [...new Set(products.flatMap(p => p.tags))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Alle Produkte</h1>
          <p className="text-gray-600">
            Entdecken Sie unsere komplette Kollektion nachhaltiger Urban Fashion
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Produkte suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sortieren nach" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Preis aufsteigend</SelectItem>
                <SelectItem value="price-high">Preis absteigend</SelectItem>
                <SelectItem value="newest">Neueste zuerst</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border border-gray-200 rounded-md overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Filter</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Zurücksetzen
                    </Button>
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Kategorien</h4>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={filters.category.includes(category.name)}
                            onCheckedChange={() => toggleArrayFilter('category', category.name)}
                          />
                          <label
                            htmlFor={`category-${category.id}`}
                            className="text-sm flex-1 cursor-pointer"
                          >
                            {category.name} ({category.productCount})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Collections */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Kollektionen</h4>
                    <div className="space-y-2">
                      {allCollections.map(collection => (
                        <div key={collection} className="flex items-center space-x-2">
                          <Checkbox
                            id={`collection-${collection}`}
                            checked={filters.collection.includes(collection)}
                            onCheckedChange={() => toggleArrayFilter('collection', collection)}
                          />
                          <label
                            htmlFor={`collection-${collection}`}
                            className="text-sm flex-1 cursor-pointer"
                          >
                            {collection}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Preisbereich</h4>
                    <div className="space-y-4">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                        max={300}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>€{filters.priceRange[0]}</span>
                        <span>€{filters.priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Größen</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {allSizes.map(size => (
                        <Button
                          key={size}
                          variant={filters.sizes.includes(size) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleArrayFilter('sizes', size)}
                          className="text-xs"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <Badge
                          key={tag}
                          variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleArrayFilter('tags', tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                {filteredProducts.length} Produkte gefunden
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <Link key={product.id} to={`/produkte/${product.id}`} className="group">
                    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {product.newArrival && (
                            <Badge className="bg-green-500 text-white">Neu</Badge>
                          )}
                          {product.bestseller && (
                            <Badge className="bg-blue-500 text-white">Bestseller</Badge>
                          )}
                          {product.discount > 0 && (
                            <Badge className="bg-red-500 text-white">-{product.discount}%</Badge>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-1 group-hover:text-gray-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold">€{product.price}</span>
                            {product.originalPrice && (
                              <span className="text-gray-500 line-through text-sm">
                                €{product.originalPrice}
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            {product.colors.slice(0, 3).map(color => (
                              <div
                                key={color.code}
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <Link key={product.id} to={`/produkte/${product.id}`} className="group">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="flex">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-48 h-32 object-cover"
                        />
                        <CardContent className="flex-1 p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg mb-2 group-hover:text-gray-600 transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-gray-600 mb-4">
                                {product.description}
                              </p>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-lg">€{product.price}</span>
                                  {product.originalPrice && (
                                    <span className="text-gray-500 line-through">
                                      €{product.originalPrice}
                                    </span>
                                  )}
                                </div>
                                <div className="flex space-x-1">
                                  {product.colors.map(color => (
                                    <div
                                      key={color.code}
                                      className="w-5 h-5 rounded-full border border-gray-300"
                                      style={{ backgroundColor: color.value }}
                                      title={color.name}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              {product.newArrival && (
                                <Badge className="bg-green-500 text-white">Neu</Badge>
                              )}
                              {product.bestseller && (
                                <Badge className="bg-blue-500 text-white">Bestseller</Badge>
                              )}
                              {product.discount > 0 && (
                                <Badge className="bg-red-500 text-white">-{product.discount}%</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">
                  Keine Produkte gefunden. Versuchen Sie, die Filter anzupassen.
                </p>
                <Button className="mt-4" onClick={clearFilters}>
                  Filter zurücksetzen
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
