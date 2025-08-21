<?php
namespace App\Jobs;

use App\Models\Message;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendConfirmationMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $orderId;
    protected $recipient;

    public $tries = 3; // retry 3 times

    public function __construct(int $orderId, string $recipient)
    {
        $this->orderId = $orderId;
        $this->recipient = $recipient;

    }

    public function handle()
    {

         $order = Order::find($this->orderId);

        // Idempotency: skip if message already exists
        if (Message::where('order_id', $order->id)->exists()) {
            return;
        }

        // Simulate sending message
        
        $providerMsgId = 'MSG-' . uniqid();

        Message::create([
            'order_id' => $order->id,
            'recipient' => $this->recipient,
            'provider_msg_id' => $providerMsgId,
            'status' => 'sent'
        ]);

        \Log::info("SEND_MSG to {$this->recipient}, provider_msg_id: {$providerMsgId}");
    }
}
