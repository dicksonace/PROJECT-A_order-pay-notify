const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Use the message field if available, otherwise fall back to error field
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Dashboard metrics
  getDashboardMetrics = async () => {
    return this.request('/dashboard/metrics');
  }

  // Orders
  getOrders = async (page = 1, perPage = 10, search = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });
    
    if (search) {
      params.append('search', search);
    }
    
    return this.request(`/orders?${params.toString()}`);
  }

  getOrder = async (id) => {
    return this.request(`/orders/${id}`);
  }

  createOrder = async (orderData) => {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Payments
  getPayments = async (page = 1, perPage = 10) => {
    return this.request(`/payments?page=${page}&per_page=${perPage}`);
  }

  chargePayment = async (orderId) => {
    const idempotencyKey = `charge:${orderId}`;
    return this.request('/payments/charge', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    });
  }

  // Products
  getProducts = async (page = 1, perPage = 10) => {
    return this.request(`/products?page=${page}&per_page=${perPage}`);
  }
}

export default new ApiService();
