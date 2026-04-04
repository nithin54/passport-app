const DEMO_LOGIN = Object.freeze({
  email: 'hire-me@anshumat.org',
  password: 'HireMe@2025!'
});

function createLoginFormState(overrides = {}) {
  return {
    email: overrides.email ?? DEMO_LOGIN.email,
    password: overrides.password ?? DEMO_LOGIN.password,
    error: overrides.error ?? ''
  };
}

function validateLoginForm(formState) {
  const email = String(formState?.email || '').trim();
  const password = String(formState?.password || '');

  if (!email || !password) {
    return {
      ok: false,
      error: 'Email and password are required.'
    };
  }

  if (email !== DEMO_LOGIN.email || password !== DEMO_LOGIN.password) {
    return {
      ok: false,
      error: 'Use the seeded demo credentials for the assignment portal.'
    };
  }

  return {
    ok: true,
    error: ''
  };
}

function createLoginPageViewModel(overrides = {}) {
  const state = createLoginFormState(overrides);
  return {
    title: 'Sign In',
    description: 'Use the seeded demo login to continue through onboarding and the passport portal flow.',
    helperText: `Demo credentials: ${DEMO_LOGIN.email} / ${DEMO_LOGIN.password}`,
    submitLabel: 'Continue',
    ...state
  };
}

module.exports = {
  DEMO_LOGIN,
  createLoginFormState,
  validateLoginForm,
  createLoginPageViewModel
};
