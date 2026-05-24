// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Force Next.js to treat this route as dynamically executed on every request
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Safely parse incoming payload body parameters
    const body = await request.json().catch(() => null);
    
    if (!body || !body.uid) {
      console.error("❌ Session API Error: Missing user identifier object body.");
      return NextResponse.json({ error: 'Missing account identifiers' }, { status: 400 });
    }

    const { uid, email } = body;
    console.log(`🔍 [Session API] Checking Firestore collection for UID: ${uid}`);

    let assignedRole = 'student'; // Balanced fallback default

    // 2. Safe Firestore execution wrapper block
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        assignedRole = userData.role || 'student';
        console.log(`✅ [Session API] Found user role document match: ${assignedRole}`);
      } else {
        console.warn(`⚠️ [Session API] Document not found for UID: ${uid}. Defaulting to student permission states.`);
      }
    } catch (firestoreError: any) {
      console.error("❌ [Session API] Firestore connection or query failed:", firestoreError.message);
      // We fall back gracefully to avoid triggering a hard 500 error screen crash
      assignedRole = 'student'; 
    }

    // 3. Serialize our verified parameters straight onto our secure httpOnly cookie session context
    const response = NextResponse.json({ success: true, role: assignedRole });
    
    response.cookies.set('portal_session', JSON.stringify({ uid, email, role: assignedRole }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7200, // 2 Hours active duration session frame matrix
      path: '/',
    });

    return response;

  } catch (err: any) {
    console.error('❌ [Session API] CRITICAL TOP-LEVEL ROUTE EXCEPTION CRASH:', err);
    return NextResponse.json({ 
      error: 'Internal service system routing evaluation failure.', 
      details: err.message 
    }, { status: 500 });
  }
}