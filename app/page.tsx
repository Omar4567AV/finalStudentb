import { redirect } from 'next/navigation';

export default function Home() {
  // Bypasses the template and forces the browser directly into your secure app flow
  redirect('/login');
}