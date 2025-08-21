<?php


use App\Http\Controllers\OrdersController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\ProductController;

Route::post('/orders', [OrdersController::class, 'store']);
Route::get('/orders', [OrdersController::class, 'index']);
Route::get('/orders/{id}', [OrdersController::class, 'show']);

Route::post('/payments/charge', [PaymentController::class, 'charge']);
Route::get('/payments', [PaymentController::class, 'index']);

Route::post('/x-generate', [WebhookController::class, 'generateSignature']);
Route::post('/webhooks/momo', [WebhookController::class, 'handleMomo']);

Route::get('/products', [ProductController::class, 'index']);

// Dashboard metrics endpoint
Route::get('/dashboard/metrics', [OrdersController::class, 'getMetrics']);

