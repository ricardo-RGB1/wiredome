import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

// Do not cache endpoint result
export const revalidate = 0;




/**
 * GET handler for generating LiveKit access tokens
 * 
 * This endpoint generates access tokens that allow users to connect to LiveKit rooms.
 * It requires room name and username parameters and returns a JWT token that grants
 * access to the specified room.
 *
 * @param req - Next.js request object containing query parameters
 * @returns NextResponse with either:
 *  - Success: JSON containing access token
 *  - Error: JSON with error message and appropriate status code
 *
 * Query Parameters:
 * @param {string} room - Name of the LiveKit room to generate token for
 * @param {string} username - Identity of the user connecting to the room
 *
 * Environment Variables Required:
 * - LIVEKIT_API_KEY - API key for LiveKit
 * - LIVEKIT_API_SECRET - API secret for LiveKit
 * - LIVEKIT_URL - WebSocket URL for LiveKit server
 */
export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get('room');
  const username = req.nextUrl.searchParams.get('username');
  if (!room) {
    return NextResponse.json({ error: 'Missing "room" query parameter' }, { status: 400 });
  } else if (!username) {
    return NextResponse.json({ error: 'Missing "username" query parameter' }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // Create access token with the user's identity
  const at = new AccessToken(apiKey, apiSecret, { identity: username });
  
  // Add permissions for the specific room
  at.addGrant({ 
    room,
    roomJoin: true,    // Allow joining the room
    canPublish: true,  // Allow publishing tracks
    canSubscribe: true // Allow subscribing to other participants
  });

  // Return JWT token with cache control headers to prevent caching
  return NextResponse.json(
    { token: await at.toJwt() },
    { headers: { "Cache-Control": "no-store" } },
  );
}