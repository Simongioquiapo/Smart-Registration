import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const userNameDisplay = document.getElementById('userNameDisplay');
  const logoutBtn = document.getElementById('logoutBtn');

  // 1. Ask Supabase for the current user session
  const { data: { session }, error } = await supabase.auth.getSession();

  // 2. Protect route: redirect to login if no active session
  if (!session) {
    window.location.href = 'index.html';
    return;
  }

  // 3. Display user's name (pulled from the metadata we saved during registration)
  const user = session.user;
  const name = user.user_metadata?.full_name || user.email.split('@')[0];
  userNameDisplay.textContent = name;

  // 4. Handle Logout
  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  });
});