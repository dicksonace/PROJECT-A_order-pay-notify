<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;


class PaymentController extends Controller
{
    public function charge(Request $request)
    {
        $idempotencyKey = $request->header('Idempotency-Key');
        if (!$idempotencyKey) {
            return response()->json(['error' => 'Idempotency-Key header required'], 400);
        }

        // Check if payment already exists (idempotency)
        $existing = Payment::where('idempotency_key', $idempotencyKey)->first();
        if ($existing) {
            return response()->json([
                'payment' => [
                    'id' => $existing->id,
                    'order_id' => $existing->order_id,
                    'amount' => $existing->amount,
                    'status' => $existing->status,
                    'idempotency_key' => $existing->idempotency_key
                ],
                'message' => 'Payment already exists (idempotency)'
            ], 200);
        }

        // Extract order_id from Idempotency-Key: "charge:{order_id}"
        if (!str_starts_with($idempotencyKey, 'charge:')) {
            return response()->json(['error' => 'Invalid Idempotency-Key format'], 400);
        }
        $orderId = (int) explode(':', $idempotencyKey)[1];

        $order = Order::find($orderId);
        if (!$order) {
            return response()->json([
                'error' => 'Order not found',
                'message' => 'The specified order ID does not exist in our system.'
            ], 404);
        }

        // Create payment using the order's total_amount
        $payment = Payment::create([
            'order_id' => $order->id,
            'amount' => $order->total_amount,
            'status' => 'initiated',
            'idempotency_key' => $idempotencyKey
        ]);

        

        // Build a custom payload with only the fields you want
        $payloadArray = [
            'payment' => [
                'order_id' => $payment->order_id,
                'amount' => $payment->amount,
                'status' => $payment->status,
                'idempotency_key' => $payment->idempotency_key,
                'id' => $payment->id
            ]
        ];

        $payload = json_encode($payloadArray, JSON_UNESCAPED_SLASHES);

        // Generate signature
        $secret = env("WEBHOOK_SECRET");
        $xSignature = hash_hmac('sha256', $payload, $secret);

        return response()->json([
            'payment' => $payloadArray['payment'],
            'x_signature' => $xSignature,
            'payload' => $payload,
            'message' => 'Payment created successfully'
        ], 201);
    }

    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $payments = Payment::with('order')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        return response()->json($payments);
    }
}
