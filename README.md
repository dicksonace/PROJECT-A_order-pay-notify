# Payment System Admin Dashboard

This is a complete payment system with a React admin dashboard and Laravel backend API.

## Project Structure

- `admin-ui/` - React frontend application
- `backend_api/` - Laravel backend API

## Features

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

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend_api
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Generate application key:
   ```bash
   php artisan key:generate
   ```

5. Configure your database in `.env` file

6. Run migrations:
   ```bash
   php artisan migrate
   ```

7. Seed the database (optional):
   ```bash
   php artisan db:seed
   ```

8. Start the Laravel development server:
   ```bash
   php artisan serve
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the admin UI directory:
   ```bash
   cd admin-ui
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

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

## CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative React dev server)

## Environment Variables

### Backend (.env)
```
APP_NAME="Payment System"
APP_ENV=local
APP_KEY=your-app-key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=payment_system
DB_USERNAME=root
DB_PASSWORD=

WEBHOOK_SECRET=your-webhook-secret
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Ensure the backend is running on port 8000
2. Check that the frontend is running on port 5173
3. Verify the CORS configuration in `backend_api/config/cors.php`

### Database Issues
1. Make sure your database is running
2. Check your `.env` configuration
3. Run `php artisan migrate:fresh` to reset the database

### API Connection Issues
1. Verify the backend is running: `http://localhost:8000`
2. Check the API base URL in `admin-ui/src/services/api.js`
3. Ensure all required endpoints are available

## Development

### Adding New Features
1. **Backend**: Add new routes in `routes/api.php` and controllers in `app/Http/Controllers/`
2. **Frontend**: Add new API methods in `src/services/api.js` and update the UI components

### Styling
The frontend uses Tailwind CSS for styling. All components are responsive and follow modern design patterns.

## License

This project is open source and available under the MIT License.
