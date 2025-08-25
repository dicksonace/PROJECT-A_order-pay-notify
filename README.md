# PROJECT A - ORDER-PAY-NOTIFY

## Setup Instructions

### project Setup

3. run this:
   ```bash
   docker compose up --build
   ```

- The backend will be available at `http://localhost:8000`
- The frontend will be available at `http://localhost:5173`



## Project Structure

- `admin-ui/` - React frontend application
- `backend_api/` - Laravel backend API
  

## steps

### Backend API (Laravel)
- **Orders Management**: Create and view orders
- **Payment Processing**: Charge payments with idempotency
- **Product Management**: List products
- **Dashboard Metrics**: Real-time statistics
- **Webhook Support**: Handle payment webhooks

### Frontend Dashboard (React)
- **Real-time Dashboard**: Live metrics and statistics
- **Order Management**: View and manage orders
- **Payment Processing**: Charge payments directly from UI
- **Product Catalog**: Browse available products
- **Rate Limiting**: Built-in rate limiting simulation
- **Responsive Design**: Modern, mobile-friendly UI

## API Endpoints
The backend is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative React dev server)

### Orders
- `GET /api/orders` - List all orders (paginated)
- `GET /api/orders/{id}` - Get specific order
- `POST /api/orders` - Create new order

### Payments
- `GET /api/payments` - List all payments (paginated)
- `POST /api/payments/charge` - Charge a payment (requires Idempotency-Key)

### Products
- `GET /api/products` - List all products (paginated)

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard statistics





## Usage

1. Open your browser and go to `http://localhost:5173`
2. The dashboard will automatically load real data from the backend
3. Navigate between different tabs:
   - **Overview**: Dashboard metrics and recent orders
   - **Orders**: Manage and view all orders
   - **Payments**: View payment history and test charge endpoint
   - **Products**: Browse available products
   - **Settings**: Configure system settings

## Testing the Payment System

1. **Create an Order**: Use the backend API to create an order
2. **Charge Payment**: Click the "Charge" button next to any order in the UI
3. **View Results**: Check the Payments tab to see the processed payment

## Rate Limiting

The system includes a simulated rate limiting feature:
- Default limit: 100 requests per minute
- Visual indicator shows remaining requests
- Reset button to simulate time-based reset




