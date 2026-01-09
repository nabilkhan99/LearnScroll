import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // User is logged in, redirect to feed
    redirect('/feed');
  } else {
    // Not logged in, redirect to onboarding
    redirect('/onboarding');
  }
}
