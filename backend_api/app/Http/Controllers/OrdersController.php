<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrdersController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $order = Order::create(['status' => 'pending', 'total_amount' => 0]);

            $total = 0;
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                if (!$product) {
                    DB::rollBack();
                    return response()->json([
                        'error' => 'Product not found',
                        'message' => "Product with ID {$item['product_id']} does not exist in our system."
                    ], 404);
                }
                
                $subtotal = $product->price * $item['quantity'];
                $total += $subtotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'subtotal' => $subtotal
                ]);
            }

            $order->total_amount = $total;
            $order->save();

            DB::commit();
            return response()->json($order->load('items'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Order creation failed',
                'message' => 'An error occurred while creating the order. Please try again.'
            ], 500);
        }
    }

   public function show($id)
    {
        // Load order with items and payment relationship
        $order = Order::with(['items', 'payment'])->find($id);
        if (!$order) {
            return response()->json([
                'error' => 'Order not found',
                'message' => "Order with ID {$id} does not exist in our system."
            ], 404);
        }
        return response()->json($order);
    }

    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search', '');
        
        $query = Order::with(['items', 'payment']);
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('id', 'LIKE', "%{$search}%")
                  ->orWhere('status', 'LIKE', "%{$search}%")
                  ->orWhere('total_amount', 'LIKE', "%{$search}%");
            });
        }
        
        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json($orders);
    }

    public function getMetrics()
    {
        // Count revenue from orders with 'paid' or 'completed' status
        $totalRevenue = Order::whereIn('status', ['paid', 'completed'])->sum('total_amount');
        $totalOrders = Order::count();
        $successfulPayments = Payment::whereIn('status', ['success', 'completed'])->count();
        $failedPayments = Payment::whereIn('status', ['failed', 'declined'])->count();

        return response()->json([
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $totalOrders,
            'successfulPayments' => $successfulPayments,
            'failedPayments' => $failedPayments
        ]);
    }
}
