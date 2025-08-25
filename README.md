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



## API Endpoints
The backend is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative React dev server)


### products
- `GET /api/products` - List all products (paginated)

### orders
- `POST /api/orders` - Create new order
  ### Example Request Body

```json
{
  "items": [
    { "product_id": 5, "quantity": 535 },
    { "product_id": 4, "quantity": 515 }
  ]
}

```



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










