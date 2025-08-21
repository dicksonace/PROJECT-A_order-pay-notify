<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    // Get paginated products
    public function index(Request $request)
    {
        // You can pass ?per_page=10 in query string to control items per page
        $perPage = $request->get('per_page', 10);

        $products = Product::paginate($perPage);

        return response()->json($products);
    }
}
