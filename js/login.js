import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginEmailError = document.getElementById('loginEmailError');
  const loginPasswordError = document.getElementById('loginPasswordError');
  const toggleLoginPassword = document.getElementById('toggleLoginPassword');
  const toast = document.getElementById('toast');

  // Toggle Password Visibility helper
  function setupPasswordToggle(toggleBtn, input) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      const eyeOpen = toggleBtn.querySelector('.eye-open');
      const eyeClosed = toggleBtn.querySelector('.eye-closed');

      if (isPassword) {
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
        toggleBtn.classList.add('active');
      } else {
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
        toggleBtn.classList.remove('active');
      }
    });
  }

  setupPasswordToggle(toggleLoginPassword, loginPassword);

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
  }

  function clearToast() {
    toast.classList.add('hidden');
  }

  // ----- Field-level validation -----
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldError(input, errorEl, message) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
    input.classList.add('invalid');
  }

  function clearFieldError(input, errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
    input.classList.remove('invalid');
  }

  function validateEmail(showError = true) {
    const value = loginEmail.value.trim();
    if (!value) {
      if (showError) setFieldError(loginEmail, loginEmailError, 'Email address is required.');
      return false;
    }
    if (!EMAIL_REGEX.test(value)) {
      if (showError) setFieldError(loginEmail, loginEmailError, 'Please enter a valid email address.');
      return false;
    }
    clearFieldError(loginEmail, loginEmailError);
    return true;
  }

  function validatePassword(showError = true) {
    const value = loginPassword.value;
    if (!value) {
      if (showError) setFieldError(loginPassword, loginPasswordError, 'Password is required.');
      return false;
    }
    clearFieldError(loginPassword, loginPasswordError);
    return true;
  }

  // Live validation on blur
  loginEmail.addEventListener('blur', () => validateEmail());
  loginPassword.addEventListener('blur', () => validatePassword());

  // Clear errors as the user types
  loginEmail.addEventListener('input', () => {
    if (loginEmail.classList.contains('invalid')) validateEmail();
  });
  loginPassword.addEventListener('input', () => {
    if (loginPassword.classList.contains('invalid')) validatePassword();
  });

  loginForm.addEventListener('submit', async (e) => { // <-- Note the 'async'
    e.preventDefault();
    clearToast();

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      if (!isEmailValid) loginEmail.focus();
      else if (!isPasswordValid) loginPassword.focus();
      return;
    }

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    // 1. Log in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      showToast('Invalid email or password.');
      loginEmail.classList.add('invalid');
      loginPassword.classList.add('invalid');
    } else {
      // 2. Success! Redirect to dashboard
      window.location.href = 'home.html';
    }
  });
});