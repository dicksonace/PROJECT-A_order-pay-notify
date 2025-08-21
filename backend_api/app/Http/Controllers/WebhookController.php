<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Order;
use App\Jobs\SendConfirmationMessage; 

class WebhookController extends Controller
{
    // public function handleMomo(Request $request)
    // {
    //     $signature = $request->header('X-Signature');
    //     $payload = $request->getContent();

    //     // Verify HMAC signature
    //     $secret = env('WEBHOOK_SECRET');
    //     $computedSignature = hash_hmac('sha256', $payload, $secret);

    //     if (!hash_equals($computedSignature, $signature)) {
    //         return response()->json(['error' => 'Invalid signature'], 400);
    //     }

    //     // Extract payment info from payload
    //     $data = json_decode($payload, true);

    //     if (!isset($data['payment']['id'])) {
    //         return response()->json(['error' => 'Invalid payload'], 400);
    //     }

    //     $payment = Payment::find($data['payment']['id']);
    //     if (!$payment) {
    //         return response()->json(['error' => 'Payment not found'], 404);
    //     }

    //     // Update payment status to success
    //     $payment->status = 'success';
    //     $payment->save();

    //     return response()->json(['message' => 'Payment verified successfully'], 200);
    // }

    public function handleMomo(Request $request)
{
    $signature = $request->header('X-Signature');
    
    // Get the raw JSON payload (before Laravel parses it)
    // $payload = $request->getContent();

    $payload = array(
        "payment" => array(
                'order_id' => $request->order_id,
                'amount' => $request->amount,
                'status' => $request->status,
                'idempotency_key' => $request->idempotency_key,
                'id' => $request->id
        )
    );

    $payload = json_encode($payload, JSON_UNESCAPED_SLASHES);
    
    // Verify HMAC signature
    $secret = env('WEBHOOK_SECRET');
    $computedSignature = hash_hmac('sha256', $payload, $secret);

    if (!hash_equals($computedSignature, $signature)) {
        \Log::error('Signature mismatch', [
            'computed' => $computedSignature,
            'received' => $signature,
            'payload' => $payload
        ]);
        return response()->json(['error' => 'Invalid signature',"what i sent" => $signature, "what ii get" => $computedSignature,'payload' => $payload], 400);
    }

    // Now parse the JSON
    $data = json_decode($payload, true);

    if (!isset($data['payment']['id'])) {
        return response()->json(['error' => 'Invalid payload'], 400);
    }

    $payment = Payment::find($data['payment']['id']);
    if (!$payment) {
        return response()->json(['error' => 'Payment not found'], 404);
    }

       if ($payment->status === 'success') {
         
            return response()->json([
                'message' => 'Payment already processed successfully',
                'payment_id' => $payment->id,
                'status' => $payment->status
            ], 200);
        }

    // Update payment status to success
    $payment->status = 'success';
    $payment->save();

    $order = Order::find($data["payment"]["order_id"]);
    if ($order) {
        $order->status = 'paid';
        $order->save();

         SendConfirmationMessage::dispatch($order->id, "233000000000")
                ->onQueue('messages');
    } else {
        return response()->json(['error' => 'Order not found'], 404);
    }
    

    return response()->json(['message' => 'Payment verified successfully', 'payload' => $payload], 200);
}
}
