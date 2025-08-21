<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $products = [
            ['name' => 'T-shirt', 'price' => 50],
            ['name' => 'Cap', 'price' => 20],
            ['name' => 'Jeans', 'price' => 80],
            ['name' => 'Sneakers', 'price' => 120],
            ['name' => 'Jacket', 'price' => 150],
            ['name' => 'Socks', 'price' => 10],
            ['name' => 'Belt', 'price' => 25],
            ['name' => 'Hoodie', 'price' => 90],
            ['name' => 'Watch', 'price' => 200],
            ['name' => 'Backpack', 'price' => 70],
            ['name' => 'Sunglasses', 'price' => 60],
            ['name' => 'Wallet', 'price' => 40],
            ['name' => 'Scarf', 'price' => 30],
            ['name' => 'Gloves', 'price' => 15],
            ['name' => 'Hat', 'price' => 35],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
