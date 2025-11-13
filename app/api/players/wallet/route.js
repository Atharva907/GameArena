import { connectDB } from '@/lib/databaseConnection';
import Player from '@/models/Player';
import { NextResponse } from 'next/server';

// Get player's wallet balance
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const player = await Player.findOne({ email });
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      walletBalance: player.walletBalance,
      transactions: player.transactions
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}

// Add funds to player's wallet
export async function POST(request) {
  try {
    await connectDB();

    const { email, amount, description } = await request.json();

    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email and amount are required' },
        { status: 400 }
      );
    }

    const player = await Player.findOne({ email });
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const updatedPlayer = await Player.findByIdAndUpdate(
      player._id,
      {
        $inc: { walletBalance: amount },
        $push: {
          transactions: {
            type: amount > 0 ? 'deposit' : 'withdrawal',
            amount,
            description: description || 'Wallet update',
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    return NextResponse.json({
      walletBalance: updatedPlayer.walletBalance,
      transaction: updatedPlayer.transactions[updatedPlayer.transactions.length - 1]
    });
  } catch (error) {
    console.error('Error updating wallet:', error);
    return NextResponse.json(
      { error: 'Failed to update wallet' },
      { status: 500 }
    );
  }
}
