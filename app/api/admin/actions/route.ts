// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.uid) {
      return NextResponse.json({ error: 'Missing identifiers' }, { status: 400 });
    }

    const { uid, email } = body;
    const cleanEmail = email.trim().toLowerCase();
    const cleanUid = uid.trim();

    // Default fallback
    let assignedRole = 'student'; 

    // HARDCODED ADMIN BACKUP SAFETY NET: 
    // If it's your primary email, force it to admin instantly regardless of database connection status!
    if (cleanEmail === "o68halabi@gmail.com" || cleanUid === "YUAgwW55qdZnrw4yX2KfDAlajVg2") {
      assignedRole = 'admin';
      console.log(`🛡️ Admin Backup Safety Net triggered for: ${cleanEmail}`);
    } else {
      // Otherwise, lookup normal users in Firestore
      try {
        const userDocRef = doc(db, 'users', cleanUid);
        const userSnapshot = await getDoc(userDocRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          assignedRole = userData.role || 'student';
        }
      } catch (firestoreError) {
        console.error("Firestore read error, defaulting to student:", firestoreError);
      }
    }

    // Serialize session response block
    const response = NextResponse.json({ success: true, role: assignedRole });
    
    response.cookies.set('portal_session', JSON.stringify({ uid: cleanUid, email: cleanEmail, role: assignedRole }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7200, // 2 Hours
      path: '/',
    });

    return response;

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}