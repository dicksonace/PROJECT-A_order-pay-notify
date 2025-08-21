<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use SoftDeletes;

    protected $fillable = ['order_id', 'recipient', 'provider_msg_id', 'status'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}

