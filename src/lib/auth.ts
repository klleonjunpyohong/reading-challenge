import { supabase } from './supabase';

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      scopes: 'https://www.googleapis.com/auth/calendar.events',
    },
  });
}

export async function signInWithKakao() {
  return supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, nickname?: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname: nickname || '' } },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
