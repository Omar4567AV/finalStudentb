import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, collection, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const adminEmail = request.headers.get('x-user-email') || 'Unknown Admin';
    const { studentId, name, email, major } = await request.json();

    if (!studentId || !name || !email || !major) {
      return NextResponse.json({ error: 'Missing required profile values.' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    await setDoc(doc(db, 'students', studentId), { name, email, major, createdAt: timestamp });
    await setDoc(doc(db, 'users', studentId), { email, role: 'student' });
    await addDoc(collection(db, 'logs'), {
      action: `PROVISION_STUDENT: Added ${name} (${studentId})`,
      performedBy: adminEmail,
      timestamp,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal data mutation fault.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminEmail = request.headers.get('x-user-email') || 'Unknown Admin';
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('id');

    if (!targetId) {
      return NextResponse.json({ error: 'Missing ID reference parameter.' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    
    await deleteDoc(doc(db, 'users', targetId));
    await addDoc(collection(db, 'logs'), {
      action: `REVOKE_STUDENT: Deleted reference ${targetId}`,
      performedBy: adminEmail,
      timestamp,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal data mutation fault.' }, { status: 500 });
  }
}