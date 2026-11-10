import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const regName = document.getElementById('regName');
  const regEmail = document.getElementById('regEmail');
  const regPassword = document.getElementById('regPassword');
  const regConfirmPassword = document.getElementById('regConfirmPassword');
  const toggleRegPassword = document.getElementById('toggleRegPassword');
  const toggleRegConfirmPassword = document.getElementById('toggleRegConfirmPassword');
  const toast = document.getElementById('toast');
  const successModal = document.getElementById('successModal');
  const modalContinueBtn = document.getElementById('modalContinueBtn');

  // Error containers
  const regNameError = document.getElementById('regNameError');
  const regEmailError = document.getElementById('regEmailError');
  const regPasswordError = document.getElementById('regPasswordError');
  const regConfirmPasswordError = document.getElementById('regConfirmPasswordError');

  // Password strength elements
  const passwordStrength = document.getElementById('passwordStrength');
  const strengthBars = passwordStrength.querySelectorAll('.bar');
  const strengthLabel = document.getElementById('strengthLabel');

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

  setupPasswordToggle(toggleRegPassword, regPassword);
  setupPasswordToggle(toggleRegConfirmPassword, regConfirmPassword);

  function showToast(msg, type = 'error') {
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
  }

  function showSuccessModal() {
    successModal.classList.remove('hidden');
    setTimeout(() => modalContinueBtn.focus(), 50);
  }

  function goToLogin() {
    window.location.href = 'index.html';
  }

  modalContinueBtn.addEventListener('click', goToLogin);
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) goToLogin();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !successModal.classList.contains('hidden')) goToLogin();
  });

  // ===== Validation helpers =====
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const NAME_REGEX = /^[a-zA-ZÀ-ÿ' -]{2,60}$/;

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

  // ===== Field validators =====
  function validateName(showError = true) {
    const value = regName.value.trim();
    if (!value) {
      if (showError) setFieldError(regName, regNameError, 'Full name is required.');
      return false;
    }
    if (value.length < 2) {
      if (showError) setFieldError(regName, regNameError, 'Name must be at least 2 characters.');
      return false;
    }
    if (value.length > 60) {
      if (showError) setFieldError(regName, regNameError, 'Name must be 60 characters or fewer.');
      return false;
    }
    if (!NAME_REGEX.test(value)) {
      if (showError) setFieldError(regName, regNameError, 'Name may only contain letters, spaces, hyphens and apostrophes.');
      return false;
    }
    clearFieldError(regName, regNameError);
    return true;
  }

  function validateEmail(showError = true) {
    const value = regEmail.value.trim();
    if (!value) {
      if (showError) setFieldError(regEmail, regEmailError, 'Email address is required.');
      return false;
    }
    if (!EMAIL_REGEX.test(value)) {
      if (showError) setFieldError(regEmail, regEmailError, 'Please enter a valid email address.');
      return false;
    }
    clearFieldError(regEmail, regEmailError);
    return true;
  }

  function validatePassword(showError = true) {
    const value = regPassword.value;
    if (!value) {
      if (showError) setFieldError(regPassword, regPasswordError, 'Password is required.');
      return false;
    }
    if (value.length < 8) {
      if (showError) setFieldError(regPassword, regPasswordError, 'Password must be at least 8 characters.');
      return false;
    }
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
      if (showError) setFieldError(regPassword, regPasswordError, 'Password must contain at least one letter and one number.');
      return false;
    }
    clearFieldError(regPassword, regPasswordError);
    return true;
  }

  function validateConfirmPassword(showError = true) {
    const value = regConfirmPassword.value;
    if (!value) {
      if (showError) setFieldError(regConfirmPassword, regConfirmPasswordError, 'Please confirm your password.');
      return false;
    }
    if (value !== regPassword.value) {
      if (showError) setFieldError(regConfirmPassword, regConfirmPasswordError, 'Passwords do not match.');
      return false;
    }
    clearFieldError(regConfirmPassword, regConfirmPasswordError);
    return true;
  }

  // ===== Password strength meter =====
  function getPasswordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    // Normalize to 1–4
    if (score <= 1) return 1;
    if (score === 2) return 2;
    if (score === 3) return 3;
    return 4;
  }

  function updatePasswordStrength() {
    const pw = regPassword.value;
    if (!pw) {
      passwordStrength.classList.remove('visible');
      strengthBars.forEach(bar => bar.removeAttribute('data-active'));
      strengthLabel.textContent = '';
      return;
    }
    passwordStrength.classList.add('visible');
    const level = getPasswordStrength(pw);
    const labels = { 1: 'Weak', 2: 'Fair', 3: 'Good', 4: 'Strong' };
    strengthBars.forEach((bar, i) => {
      if (i < level) bar.setAttribute('data-active', 'true');
      else bar.removeAttribute('data-active');
    });
    strengthLabel.textContent = labels[level];
    strengthLabel.setAttribute('data-level', level);
  }

  regPassword.addEventListener('input', () => {
    updatePasswordStrength();
    // Re-validate confirm password if it has a value, since the match may change
    if (regConfirmPassword.value) validateConfirmPassword(false);
  });

  // ===== Live validation on blur =====
  regName.addEventListener('blur', () => validateName());
  regEmail.addEventListener('blur', () => validateEmail());
  regPassword.addEventListener('blur', () => validatePassword());
  regConfirmPassword.addEventListener('blur', () => validateConfirmPassword());

  // Clear/revalidate as the user types once a field has been marked invalid
  regName.addEventListener('input', () => {
    if (regName.classList.contains('invalid')) validateName();
  });
  regEmail.addEventListener('input', () => {
    if (regEmail.classList.contains('invalid')) validateEmail();
  });
  regPassword.addEventListener('input', () => {
    if (regPassword.classList.contains('invalid')) validatePassword();
  });
  regConfirmPassword.addEventListener('input', () => {
    if (regConfirmPassword.classList.contains('invalid')) validateConfirmPassword();
  });

  registerForm.addEventListener('submit', async (e) => { // <-- Note the 'async'
    e.preventDefault();
    toast.classList.add('hidden');

    const validations = [
      { fn: validateName, input: regName },
      { fn: validateEmail, input: regEmail },
      { fn: validatePassword, input: regPassword },
      { fn: validateConfirmPassword, input: regConfirmPassword },
    ];

    let firstInvalid = null;
    let allValid = true;
    validations.forEach(({ fn, input }) => {
      if (!fn()) {
        allValid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (!allValid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const name = regName.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value;

    // 1. Create the user in Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name // This triggers the SQL trigger we ran in Step 2!
        }
      }
    });

    if (error) {
      // If Supabase returns an error (e.g., email already exists)
      setFieldError(regEmail, regEmailError, error.message);
      regEmail.focus();
      return;
    }

    // 2. Success! Trigger Vibration (Android support)
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]); 
    }

    // 3. Call Edge Function for Email Notification
    await supabase.functions.invoke('notify-admin', { body: { name, email } });

    // 4. Show the success modal
    showSuccessModal();
  });
});