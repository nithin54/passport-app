const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const projectRoot = __dirname;
const port = 3101;
const baseUrl = `http://127.0.0.1:${port}`;

async function waitForHealth(timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) {
        return;
      }
    } catch (error) {
      // Keep retrying until timeout.
    }

    await new Promise(resolve => setTimeout(resolve, 250));
  }

  throw new Error('Timed out waiting for the test server to become healthy.');
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  return { response, payload };
}

async function main() {
  const applicationFormModule = require(path.join(projectRoot, 'frontend', 'src', 'pages', 'ApplicationForm.jsx'));
  const dashboardModule = require(path.join(projectRoot, 'frontend', 'src', 'pages', 'Dashboard.jsx'));
  const formWizardModule = require(path.join(projectRoot, 'frontend', 'src', 'pages', 'FormWizard.jsx'));
  const loginModule = require(path.join(projectRoot, 'frontend', 'src', 'pages', 'Login.jsx'));

  const loginPageSource = fs.readFileSync(path.join(projectRoot, 'frontend', 'src', 'pages', 'Login.jsx'), 'utf8');
  assert.match(loginPageSource, /validateLoginForm/);
  assert.match(loginPageSource, /hire-me@anshumat\.org/);
  console.log('PASS login page module');

  const validDraft = applicationFormModule.validateApplicationDraft({
    passportType: 'Fresh Passport',
    address: 'Chennai, Tamil Nadu',
    emergencyContact: '9876543210'
  });
  assert.equal(validDraft.ok, true);
  assert.equal(applicationFormModule.createApplicationSummary(validDraft.value).passportType, 'Fresh Passport');
  console.log('PASS application form module');

  const dashboardView = dashboardModule.createDashboardViewModel({
    progressPercent: 48,
    currentStatus: 'Application in progress'
  });
  assert.equal(dashboardView.metrics.progressPercent, 48);
  assert.match(dashboardView.nextAction, /Continue/i);
  console.log('PASS dashboard module');

  const wizardState = formWizardModule.createWizardState(2, ['personal', 'address']);
  assert.equal(wizardState.currentStep.key, 'background');
  assert.equal(wizardState.steps[0].completed, true);
  assert.equal(formWizardModule.clampStepIndex(99), 3);
  console.log('PASS form wizard module');

  const loginValidation = loginModule.validateLoginForm({
    email: 'hire-me@anshumat.org',
    password: 'HireMe@2025!'
  });
  assert.equal(loginValidation.ok, true);
  console.log('PASS login validation');

  const backendModule = await import(pathToFileURL(path.join(projectRoot, 'backend', 'server.js')).href);
  const server = await backendModule.startServer(port, { log: false });

  try {
    await waitForHealth();

    const routes = [
      '/homepage',
      '/login',
      '/dashboard',
      '/form',
      '/documents',
      '/appointment',
      '/confirmation',
      '/receipt',
      '/design-decisions'
    ];

    for (const route of routes) {
      const response = await fetch(`${baseUrl}${route}`);
      const html = await response.text();
      assert.equal(response.status, 200, `Expected ${route} to return 200.`);
      assert.match(html, /Passport/i, `Expected ${route} to render the portal shell.`);
    }
    console.log('PASS page routes');

    const health = await fetch(`${baseUrl}/health`).then(res => res.json());
    assert.equal(health.ok, true);
    assert.equal(health.port, port);
    console.log('PASS health endpoint');

    const loginResult = await requestJson(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hire-me@anshumat.org',
        password: 'HireMe@2025!'
      })
    });
    assert.equal(loginResult.response.status, 200);
    assert.equal(loginResult.payload.user.email, 'hire-me@anshumat.org');
    assert.equal(loginResult.payload.user._id, 'demo');
    console.log('PASS demo login');

    const bootstrapResult = await requestJson(`${baseUrl}/api/bootstrap`);
    assert.equal(bootstrapResult.response.status, 200);
    assert.equal(bootstrapResult.payload.user.email, 'hire-me@anshumat.org');
    assert.equal(bootstrapResult.payload.application.userId, 'demo');
    console.log('PASS bootstrap data');

    const onboardingResult = await requestJson(`${baseUrl}/api/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hire-me@anshumat.org',
        name: 'Nithi Passport',
        dob: '2000-01-15',
        city: 'Chennai'
      })
    });
    assert.equal(onboardingResult.response.status, 200);
    assert.equal(onboardingResult.payload.user.name, 'Nithi Passport');
    assert.equal(onboardingResult.payload.application.onboarding.city, 'Chennai');
    console.log('PASS onboarding save');

    const applicationResult = await requestJson(`${baseUrl}/api/application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'demo',
        passportType: 'Fresh Passport',
        address: 'Chennai, Tamil Nadu',
        emergencyContact: '9876543210'
      })
    });
    assert.equal(applicationResult.response.status, 200);
    assert.equal(applicationResult.payload.application.draft.address, 'Chennai, Tamil Nadu');
    console.log('PASS application draft save');

    const documentResult = await requestJson(`${baseUrl}/api/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'demo',
        key: 'identity',
        fileName: 'passport-proof.pdf'
      })
    });
    assert.equal(documentResult.response.status, 200);
    assert.equal(documentResult.payload.application.documents.identity.fileName, 'passport-proof.pdf');
    console.log('PASS document upload');

    const appointmentResult = await requestJson(`${baseUrl}/api/appointment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'demo',
        passportOffice: 'Chennai Regional Passport Office',
        date: '2026-04-10',
        time: '09:30 AM'
      })
    });
    assert.equal(appointmentResult.response.status, 200);
    assert.equal(appointmentResult.payload.appointment.passportOffice, 'Chennai Regional Passport Office');
    console.log('PASS appointment booking');

    const exportResult = await requestJson(`${baseUrl}/api/export?userId=demo`);
    assert.equal(exportResult.response.status, 200);
    assert.equal(exportResult.payload.receipt.applicationId, 'PPT-2026-10482');
    assert.equal(exportResult.payload.user.name, 'Nithi Passport');
    assert.equal(exportResult.payload.receipt.downloadUrl, '/assets/PPT-2026-10482-receipt.pdf');
    console.log('PASS export data');

    const receiptPdfResponse = await fetch(`${baseUrl}/assets/PPT-2026-10482-receipt.pdf`);
    assert.equal(receiptPdfResponse.status, 200);
    assert.equal(receiptPdfResponse.headers.get('content-type'), 'application/pdf');
    console.log('PASS receipt pdf download');

    const statusResult = await requestJson(`${baseUrl}/api/status?userId=demo`);
    assert.equal(statusResult.response.status, 200);
    assert.equal(statusResult.payload.appointmentBooked, true);
    assert.equal(statusResult.payload.status, 'appointment-booked');
    console.log('PASS final booked state');

    console.log('All portal smoke tests passed.');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
