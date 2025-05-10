import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/db/Order';
import Game from '@/db/Game';
import { verifyPayment } from '@/services/paymentService';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }
  
  try {
    await dbConnect();
    
    // Find the order by payment session ID
    const order = await Order.findOne({ paymentId: sessionId });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Get the game details for this order
    const game = await Game.findById(order.game);
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Find the package details
    const packageDetails = game.packages.find(
      pkg => pkg._id.toString() === order.package.toString()
    );
    
    // Verify payment status from the payment service
    const paymentDetails = await verifyPayment(sessionId);
    
    // Update the order status if needed
    if (order.status !== paymentDetails.status && paymentDetails.status === 'completed') {
      order.status = 'completed';
      await order.save();
    }
    
    return NextResponse.json({
      success: true,
      order: {
        _id: order._id,
        status: order.status,
        amount: order.amount,
        userId: order.userId,
        serverId: order.serverId,
        createdAt: order.createdAt,
        gameName: game.name,
        packageName: packageDetails ? packageDetails.name : 'Unknown Package'
      }
    });
  } catch (error) {
    console.error('Error verifying order:', error);
    return NextResponse.json(
      { error: 'Failed to verify order' },
      { status: 500 }
    );
  }
}