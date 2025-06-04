// DressForPleasure API Hooks
// Datei: src/hooks/useApi.ts

import { useState, useEffect, useCallback } from 'react';
import { apiClient, Product, Category, Collection } from '../services/api';

// Generic API Hook
function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  fallbackData?: T
) {
  const [data, setData] = useState<T | null>(fallbackData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
          setError(errorMessage);
          console.warn('API call failed, using fallback data:', errorMessage);
          
          // Fallback auf Mock-Daten wenn verfügbar
          if (fallbackData && !data) {
            setData(fallbackData);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, dependencies);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    
    apiCall()
      .then(setData)
      .catch(err => {
        const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
        setError(errorMessage);
        if (fallbackData) {
          setData(fallbackData);
        }
      })
      .finally(() => setLoading(false));
  }, [apiCall, fallbackData]);

  return { data, loading, error, refetch };
}

// Produkte Hook
export function useProducts(filters?: {
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}) {
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Atlanta Street Shirt',
      description: 'Urbanes Shirt mit Atlanta-Street-Style. Perfekt für den lässigen Alltag.',
      price: 39.99,
      originalPrice: 49.99,
      images: ['/images/products/shirt-1.jpg'],
      category: 'shirts',
      collection: 'atlanta-collection',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Schwarz', 'Weiß', 'Grau'],
      material: '100% Bio-Baumwolle',
      inStock: true,
      stockCount: 15,
      label: 'Neu',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Berlin Urban Dress',
      description: 'Elegantes Kleid mit Berlin-urbanem Flair. Für besondere Anlässe.',
      price: 129.99,
      originalPrice: 159.99,
      images: ['/images/products/dress-1.jpg'],
      category: 'dresses',
      collection: 'berlin-collection',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Schwarz', 'Navy', 'Bordeaux'],
      material: 'Premium Polyester-Mix',
      inStock: true,
      stockCount: 8,
      label: 'Neu',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Premium Urban Jacket',
      description: 'Hochwertige Jacke für den urbanen Lifestyle. Berlin meets Atlanta.',
      price: 199.99,
      images: ['/images/products/jacket-1.jpg'],
      category: 'jackets',
      collection: 'premium-collection',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Schwarz', 'Khaki', 'Navy'],
      material: 'Wasserdichte Softshell',
      inStock: true,
      stockCount: 12,
      label: 'Bestseller',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  const { data, loading, error, refetch } = useApiCall(
    () => apiClient.getProducts(filters),
    [filters],
    { products: mockProducts, total: mockProducts.length, page: 1 }
  );

  return {
    products: data?.products || [],
    total: data?.total || 0,
    loading,
    error,
    refetch
  };
}

// Einzelnes Produkt Hook
export function useProduct(id: string) {
  const mockProduct: Product = {
    id: id,
    name: 'Mock Produkt',
    description: 'Dies ist ein Mock-Produkt für die Entwicklung.',
    price: 99.99,
    images: ['/images/products/placeholder.jpg'],
    category: 'general',
    sizes: ['S', 'M', 'L'],
    colors: ['Schwarz', 'Weiß'],
    material: 'Baumwolle',
    inStock: true,
    stockCount: 10,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const { data, loading, error, refetch } = useApiCall(
    () => apiClient.getProduct(id),
    [id],
    mockProduct
  );

  return {
    product: data,
    loading,
    error,
    refetch
  };
}

// Kategorien Hook
export function useCategories() {
  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'Shirts',
      slug: 'shirts',
      description: 'Urbane Shirts für jeden Anlass',
      image: '/images/categories/shirts.jpg'
    },
    {
      id: '2',
      name: 'Kleider',
      slug: 'dresses',
      description: 'Elegante Kleider mit urbanem Flair',
      image: '/images/categories/dresses.jpg'
    },
    {
      id: '3',
      name: 'Jacken',
      slug: 'jackets',
      description: 'Premium Jacken für den Urban-Style',
      image: '/images/categories/jackets.jpg'
    }
  ];

  const { data, loading, error, refetch } = useApiCall(
    () => apiClient.getCategories(),
    [],
    mockCategories
  );

  return {
    categories: data || [],
    loading,
    error,
    refetch
  };
}

// Kollektionen Hook
export function useCollections() {
  const mockCollections: Collection[] = [
    {
      id: '1',
      name: 'Berlin Collection',
      slug: 'berlin-collection',
      description: 'Urbaner Style aus der Hauptstadt',
      image: '/images/collections/berlin.jpg',
      products: []
    },
    {
      id: '2',
      name: 'Atlanta Collection',
      slug: 'atlanta-collection',
      description: 'Street-Style aus dem Süden der USA',
      image: '/images/collections/atlanta.jpg',
      products: []
    }
  ];

  const { data, loading, error, refetch } = useApiCall(
    () => apiClient.getCollections(),
    [],
    mockCollections
  );

  return {
    collections: data || [],
    loading,
    error,
    refetch
  };
}

// Produktsuche Hook
export function useProductSearch(query: string) {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.searchProducts(searchQuery);
      setSearchResults(result.products);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Suchfehler';
      setError(errorMessage);
      console.warn('Search failed:', errorMessage);
      
      // Fallback: Mock-Suche
      const mockProducts = [
        {
          id: '1',
          name: 'Atlanta Street Shirt',
          description: 'Mock-Suchergebnis',
          price: 39.99,
          images: ['/images/products/shirt-1.jpg'],
          category: 'shirts',
          sizes: ['S', 'M', 'L'],
          colors: ['Schwarz'],
          material: 'Baumwolle',
          inStock: true,
          stockCount: 10,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];
      
      const filtered = mockProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(filtered);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        search(query);
      } else {
        setSearchResults([]);
      }
    }, 300); // Debounce für 300ms

    return () => clearTimeout(timeoutId);
  }, [query, search]);

  return {
    searchResults,
    loading,
    error,
    search
  };
}

// Health Check Hook
export function useApiHealth() {
  const { data, loading, error, refetch } = useApiCall(
    () => apiClient.healthCheck(),
    [],
    { status: 'mock', database: 'disconnected' }
  );

  const isConnected = data?.status === 'ok' && data?.database === 'connected';

  return {
    health: data,
    isConnected,
    loading,
    error,
    checkHealth: refetch
  };
}

// Bestellung Hook
export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState(null);

  const createOrder = useCallback(async (orderData: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.createOrder(orderData);
      setOrder(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bestellfehler';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createOrder,
    order,
    loading,
    error
  };
}

// Newsletter Hook
export function useNewsletter() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await apiClient.subscribeNewsletter(email);
      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Newsletter-Fehler';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    subscribe,
    loading,
    success,
    error
  };
}
