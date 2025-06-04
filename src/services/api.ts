// DressForPleasure API Client
// Datei: src/services/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  collection?: string;
  sizes: string[];
  colors: string[];
  material: string;
  inStock: boolean;
  stockCount: number;
  label?: 'Neu' | 'Bestseller' | 'Sale';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  products: Product[];
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  size: string;
  color: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  customerInfo: {
    email: string;
    name: string;
    address: string;
  };
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('🔗 API Client initialized with URL:', this.baseURL);
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // Für Cookies/Sessions
      ...options,
    };

    try {
      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ API Response successful for ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`❌ API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; database: string }> {
    return this.request('/health');
  }

  // Produktabfragen
  async getProducts(params?: {
    category?: string;
    collection?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number; page: number }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request(`/products/${id}`);
  }

  async searchProducts(query: string): Promise<{ products: Product[]; total: number }> {
    return this.request(`/products/search?q=${encodeURIComponent(query)}`);
  }

  // Kategorien
  async getCategories(): Promise<Category[]> {
    return this.request('/categories');
  }

  async getCategory(slug: string): Promise<Category> {
    return this.request(`/categories/${slug}`);
  }

  // Kollektionen
  async getCollections(): Promise<Collection[]> {
    return this.request('/collections');
  }

  async getCollection(slug: string): Promise<Collection> {
    return this.request(`/collections/${slug}`);
  }

  // Warenkorb & Bestellungen
  async createOrder(orderData: {
    items: CartItem[];
    customerInfo: {
      email: string;
      name: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
    };
    paymentMethod: string;
  }): Promise<Order> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(id: string): Promise<Order> {
    return this.request(`/orders/${id}`);
  }

  // Stripe-Zahlungen
  async createPaymentIntent(data: {
    amount: number;
    currency?: string;
    orderId?: string;
  }): Promise<{ clientSecret: string; paymentIntentId: string }> {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmPayment(paymentIntentId: string): Promise<{ status: string }> {
    return this.request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  // Newsletter & Kontakt
  async subscribeNewsletter(email: string): Promise<{ success: boolean }> {
    return this.request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async sendContactMessage(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean }> {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();

// Default Export für einfachen Import
export default apiClient;
