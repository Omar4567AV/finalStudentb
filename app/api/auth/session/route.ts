import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { createSessionToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const { uid, email } = await request.json();

    const userSnapshot = await getDoc(doc(db, 'users', uid));
    if (!userSnapshot.exists()) {
      return NextResponse.json({ error: 'Access denied. No profile role entry exists.' }, { status: 403 });
    }

    const assignedRole = userSnapshot.data().role; 
    const sessionJWT = await createSessionToken({ uid, email, role: assignedRole });

    const response = NextResponse.json({ success: true, role: assignedRole });
    response.cookies.set('portal_session', sessionJWT, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7200, // 2 Hours
      path: '/',
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: 'Internal system validation exception' }, { status: 500 });
  }
}