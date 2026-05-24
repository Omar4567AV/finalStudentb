// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    // 1. Extract the UID and email passed from the login screen
    const { uid, email } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: 'Missing account identifiers' }, { status: 400 });
    }

    console.log(`Looking up database document for UID: ${uid}`);

    // 2. READ FROM FIRESTORE: Connect to the 'users' collection using the UID as the Document ID
    const userDocRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);
    
    let assignedRole = 'student'; // Fallback default if the document isn't found

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      // Extract the role field ('admin' or 'student')
      assignedRole = userData.role || 'student';
      console.log(`Firestore Match Found! Role is set to: ${assignedRole}`);
    } else {
      console.warn(`No user document found for UID ${uid}. Defaulting to student permission.`);
    }

    // 3. Serialize the payload into the secure httpOnly cookie
    const response = NextResponse.json({ success: true, role: assignedRole });
    
    response.cookies.set('portal_session', JSON.stringify({ uid, email, role: assignedRole }), {
      httpOnly: true, // Invisible to JavaScript, visible to our app/page.tsx Server Component
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7200, // 2 hours
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('CRITICAL FIRESTORE ROUTE READ CRASH:', err);
    return NextResponse.json({ error: 'Internal server error processing identity rules', details: err.message }, { status: 500 });
  }
}