import React, { useState, useEffect } from 'react';
import { 
  FaShoppingCart, 
  FaCreditCard, 
  FaBox, 
  FaChartLine, 
  FaCog, 
  FaBell, 
  FaSearch, 
  FaFilter,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import apiService from './services/api';



// API-based pagination hook
const useApiPagination = (fetchFunction, pageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: pageSize,
    total: 0
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFunction(page, pageSize);
      setData(response.data || []);
      setPagination({
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
        per_page: response.per_page || pageSize,
        total: response.total || 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const nextPage = () => {
    if (currentPage < pagination.last_page) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return {
    data,
    loading,
    error,
    nextPage,
    prevPage,
    hasNext: currentPage < pagination.last_page,
    hasPrev: currentPage > 1,
    currentPage,
    totalPages: pagination.last_page,
    total: pagination.total,
    refresh: () => fetchData(currentPage)
  };
};

// Metric Card Component
const MetricCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6 flex items-center">
    <div className={`p-3 rounded-full ${color} text-white mr-4`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    processing: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [rateLimit, setRateLimit] = useState(100); // Default rate limit
  const [rateLimitRemaining, setRateLimitRemaining] = useState(100); // Simulated remaining requests
  
  // State for real data
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    successfulPayments: 0,
    failedPayments: 0
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  
  // Search state
  const [orderSearch, setOrderSearch] = useState('');
  
  // Initialize pagination for different data sets
  const paymentsPagination = useApiPagination(apiService.getPayments);
  const productsPagination = useApiPagination(apiService.getProducts);
  
  // Custom orders pagination with search
  const [ordersData, setOrdersData] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [ordersPagination, setOrdersPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  
  const fetchOrders = async (page = 1, search = '') => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const response = await apiService.getOrders(page, 10, search);
      setOrdersData(response.data || []);
      setOrdersPagination({
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
        per_page: response.per_page || 10,
        total: response.total || 0
      });
    } catch (err) {
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  };
  
  // Fetch orders when page or search changes
  useEffect(() => {
    fetchOrders(currentOrdersPage, orderSearch);
  }, [currentOrdersPage, orderSearch]);
  
  const ordersNextPage = () => {
    if (currentOrdersPage < ordersPagination.last_page) {
      setCurrentOrdersPage(prev => prev + 1);
    }
  };
  
  const ordersPrevPage = () => {
    if (currentOrdersPage > 1) {
      setCurrentOrdersPage(prev => prev - 1);
    }
  };

  // Fetch dashboard metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      setMetricsLoading(true);
      try {
        console.log('Fetching dashboard metrics...');
        const metricsData = await apiService.getDashboardMetrics();
        console.log('Metrics data received:', metricsData);
        setMetrics(metricsData);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
        // Set default values if API fails
        setMetrics({
          totalRevenue: 0,
          totalOrders: 0,
          successfulPayments: 0,
          failedPayments: 0
        });
      } finally {
        setMetricsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Real charge request
  const handleChargeRequest = async (orderId) => {
    console.log(`Attempting to charge order ${orderId}. Rate limit remaining: ${rateLimitRemaining}`);
    
    if (rateLimitRemaining > 0) {
      // Decrement rate limit immediately
      setRateLimitRemaining(prev => {
        const newLimit = prev - 1;
        console.log(`Rate limit decremented from ${prev} to ${newLimit}`);
        return newLimit;
      });
      
      try {
        const result = await apiService.chargePayment(orderId);
        
        // Handle consistent response format
        const paymentId = result.payment.id;
        const paymentStatus = result.payment.status;
        const message = result.message || 'Payment processed successfully';
        
        alert(`${message}\nPayment ID: ${paymentId}\nStatus: ${paymentStatus}`);
        
        // Refresh payments data
        paymentsPagination.refresh();
        // Refresh orders data to show updated status
        fetchOrders(currentOrdersPage, orderSearch);
      } catch (err) {
        // If the request failed, we could optionally restore the rate limit
        // But for now, we'll keep it decremented as the request was attempted
        console.error('Charge request failed:', err);
        
        // Try to extract a user-friendly error message
        let errorMessage = 'Charge failed';
        if (err.message) {
          errorMessage = err.message;
        }
        
        alert(`Charge failed: ${errorMessage}`);
      }
    } else {
      alert('Rate limit exceeded! Please try again later or reset the limit.');
    }
  };

  // Reset rate limit (simulates time-based reset)
  const resetRateLimit = () => {
    console.log(`Resetting rate limit from ${rateLimitRemaining} to ${rateLimit}`);
    setRateLimitRemaining(rateLimit);
  };
  
  // Test rate limiting (for debugging)
  const testRateLimit = () => {
    console.log(`Testing rate limit. Current: ${rateLimitRemaining}`);
    if (rateLimitRemaining > 0) {
      setRateLimitRemaining(prev => {
        const newLimit = prev - 1;
        console.log(`Test: Rate limit decremented from ${prev} to ${newLimit}`);
        return newLimit;
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white">
        <div className="p-4 text-2xl font-bold">Payment System</div>
        <nav className="mt-6">
          <div className="px-4 py-2 text-sm uppercase text-blue-300">Main Navigation</div>
          <button 
            className={`flex items-center w-full px-4 py-3 ${activeTab === 'overview' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine className="mr-3" />
            Overview
          </button>
          <button 
            className={`flex items-center w-full px-4 py-3 ${activeTab === 'orders' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaShoppingCart className="mr-3" />
            Orders
          </button>
          <button 
            className={`flex items-center w-full px-4 py-3 ${activeTab === 'payments' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
            onClick={() => setActiveTab('payments')}
          >
            <FaCreditCard className="mr-3" />
            Payments
          </button>
          <button 
            className={`flex items-center w-full px-4 py-3 ${activeTab === 'products' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
            onClick={() => setActiveTab('products')}
          >
            <FaBox className="mr-3" />
            Products
          </button>
          <button 
            className={`flex items-center w-full px-4 py-3 ${activeTab === 'settings' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog className="mr-3" />
            Settings
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <FaBell className="text-xl" />
              </button>
              <div className="ml-4 relative">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  AD
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Dashboard Overview</h2>
              
              {/* Metrics Cards */}
              {metricsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6 flex items-center">
                    <div className="animate-pulse bg-gray-200 rounded-full w-12 h-12 mr-4"></div>
                    <div>
                      <div className="animate-pulse bg-gray-200 h-4 w-24 mb-2"></div>
                      <div className="animate-pulse bg-gray-200 h-8 w-16"></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 flex items-center">
                    <div className="animate-pulse bg-gray-200 rounded-full w-12 h-12 mr-4"></div>
                    <div>
                      <div className="animate-pulse bg-gray-200 h-4 w-24 mb-2"></div>
                      <div className="animate-pulse bg-gray-200 h-8 w-16"></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 flex items-center">
                    <div className="animate-pulse bg-gray-200 rounded-full w-12 h-12 mr-4"></div>
                    <div>
                      <div className="animate-pulse bg-gray-200 h-4 w-24 mb-2"></div>
                      <div className="animate-pulse bg-gray-200 h-8 w-16"></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 flex items-center">
                    <div className="animate-pulse bg-gray-200 rounded-full w-12 h-12 mr-4"></div>
                    <div>
                      <div className="animate-pulse bg-gray-200 h-4 w-24 mb-2"></div>
                      <div className="animate-pulse bg-gray-200 h-8 w-16"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <MetricCard 
                    title="Total Revenue" 
                    value={`$${metrics.totalRevenue ? metrics.totalRevenue.toLocaleString() : '0'}`} 
                    icon={<FaCreditCard />} 
                    color="bg-blue-500" 
                  />
                  <MetricCard 
                    title="Total Orders" 
                    value={metrics.totalOrders || 0} 
                    icon={<FaShoppingCart />} 
                    color="bg-green-500" 
                  />
                  <MetricCard 
                    title="Successful Payments" 
                    value={metrics.successfulPayments || 0} 
                    icon={<FaCreditCard />} 
                    color="bg-teal-500" 
                  />
                  <MetricCard 
                    title="Failed Payments" 
                    value={metrics.failedPayments || 0} 
                    icon={<FaCreditCard />} 
                    color="bg-red-500" 
                  />
                </div>
              )}

              {/* Rate Limiting Card */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg font-medium mb-4">Rate Limiting Status</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Charge endpoint requests remaining</p>
                    <div className="w-64 bg-gray-200 rounded-full h-4 mt-2">
                      <div 
                        className={`h-4 rounded-full transition-all duration-300 ${
                          rateLimitRemaining > rateLimit * 0.5 
                            ? 'bg-green-500' 
                            : rateLimitRemaining > rateLimit * 0.2 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${(rateLimitRemaining / rateLimit) * 100}%` }}
                      ></div>
                    </div>
                    <p className={`text-sm mt-2 font-medium ${
                      rateLimitRemaining > rateLimit * 0.5 
                        ? 'text-green-600' 
                        : rateLimitRemaining > rateLimit * 0.2 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {rateLimitRemaining} / {rateLimit} requests remaining
                    </p>
                    {rateLimitRemaining === 0 && (
                      <p className="text-xs text-red-500 mt-1">Rate limit exceeded! Reset to continue.</p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={resetRateLimit}
                      className={`px-4 py-2 rounded font-medium ${
                        rateLimitRemaining === 0
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {rateLimitRemaining === 0 ? 'Reset Limit' : 'Reset Limit (Simulate)'}
                    </button>
                    <button 
                      onClick={testRateLimit}
                      className="px-4 py-2 rounded font-medium bg-gray-500 hover:bg-gray-600 text-white text-sm"
                    >
                      Test Decrement
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
                {ordersLoading ? (
                  <div className="text-center py-4">Loading orders...</div>
                ) : ordersError ? (
                  <div className="text-center py-4 text-red-600">Error loading orders: {ordersError}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ordersData.slice(0, 5).map(order => (
                          <tr key={order.id}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">${order.total_amount}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                              <button 
                                onClick={() => handleChargeRequest(order.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Charge
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Order Management</h2>
              
              {/* Search and Filter Bar */}
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={orderSearch}
                    onChange={(e) => {
                      setOrderSearch(e.target.value);
                      setCurrentOrdersPage(1); // Reset to first page when searching
                    }}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                    placeholder="Search orders..." 
                  />
                </div>
                <button 
                  onClick={() => {
                    setOrderSearch('');
                    setCurrentOrdersPage(1);
                  }}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
              
              {/* Orders Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {ordersLoading ? (
                  <div className="text-center py-8">Loading orders...</div>
                ) : ordersError ? (
                  <div className="text-center py-8 text-red-600">Error loading orders: {ordersError}</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                        {ordersData.map(order => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${order.total_amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <button 
                              onClick={() => handleChargeRequest(order.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Charge
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                
                {/* Pagination Controls */}
                <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{currentOrdersPage}</span> of{' '}
                        <span className="font-medium">{ordersPagination.last_page}</span> pages
                        {orderSearch && (
                          <span className="ml-2 text-gray-500">
                            (filtered by "{orderSearch}")
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={ordersPrevPage}
                          disabled={currentOrdersPage <= 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentOrdersPage > 1 ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                        >
                          <FaChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={ordersNextPage}
                          disabled={currentOrdersPage >= ordersPagination.last_page}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentOrdersPage < ordersPagination.last_page ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                        >
                          <FaChevronRight className="h-4 w-4" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Payment Management</h2>
              
              {/* Test Charge Button */}
              <div className="mb-6">
                <button 
                  onClick={() => {
                    const orderId = prompt('Enter Order ID to charge:');
                    if (orderId) {
                      handleChargeRequest(orderId);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Test Charge Endpoint
                </button>
                <p className="text-sm text-gray-600 mt-2">Enter an Order ID to test the charge endpoint</p>
              </div>
              
              {/* Payments Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {paymentsPagination.loading ? (
                  <div className="text-center py-8">Loading payments...</div>
                ) : paymentsPagination.error ? (
                  <div className="text-center py-8 text-red-600">Error loading payments: {paymentsPagination.error}</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentsPagination.data.map(payment => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.order_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${payment.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <StatusBadge status={payment.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                
                {/* Pagination Controls */}
                <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{paymentsPagination.currentPage}</span> of{' '}
                        <span className="font-medium">{paymentsPagination.totalPages}</span> pages
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={paymentsPagination.prevPage}
                          disabled={!paymentsPagination.hasPrev}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${paymentsPagination.hasPrev ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                        >
                          <FaChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={paymentsPagination.nextPage}
                          disabled={!paymentsPagination.hasNext}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${paymentsPagination.hasNext ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                        >
                          <FaChevronRight className="h-4 w-4" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Product Management</h2>
              
              {/* Products Grid */}
              {productsPagination.loading ? (
                <div className="text-center py-8">Loading products...</div>
              ) : productsPagination.error ? (
                <div className="text-center py-8 text-red-600">Error loading products: {productsPagination.error}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productsPagination.data.map(product => (
                    <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">ID: {product.id}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Available
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-6 py-3 flex justify-end">
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination Controls */}
              <div className="bg-white px-6 py-4 mt-6 rounded-lg shadow flex items-center justify-between">
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{productsPagination.currentPage}</span> of{' '}
                      <span className="font-medium">{productsPagination.totalPages}</span> pages
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={productsPagination.prevPage}
                        disabled={!productsPagination.hasPrev}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${productsPagination.hasPrev ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                      >
                        <FaChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={productsPagination.nextPage}
                        disabled={!productsPagination.hasNext}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${productsPagination.hasNext ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                      >
                        <FaChevronRight className="h-4 w-4" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">System Settings</h2>
              
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-medium mb-4">Rate Limiting Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="rateLimit" className="block text-sm font-medium text-gray-700 mb-2">
                      Requests per minute
                    </label>
                    <input
                      type="number"
                      id="rateLimit"
                      value={rateLimit}
                      onChange={(e) => setRateLimit(parseInt(e.target.value) || 100)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="currentLimit" className="block text-sm font-medium text-gray-700 mb-2">
                      Current remaining requests
                    </label>
                    <input
                      type="number"
                      id="currentLimit"
                      value={rateLimitRemaining}
                      readOnly
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={resetRateLimit}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Apply Changes
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">System Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600">Total Revenue</h4>
                    <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600">Total Orders</h4>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600">Successful Payments</h4>
                    <p className="text-2xl font-bold text-gray-900">{metrics.successfulPayments}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;