const STORAGE_KEY = 'passport-app-state-v1';
const DEMO_CREDENTIALS = {
  email: 'hire-me@anshumat.org',
  password: 'HireMe@2025!'
};

const ROUTES = {
  home: '/homepage',
  login: '/login',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  form: '/form',
  documents: '/documents',
  appointment: '/appointment',
  confirmation: '/confirmation',
  receipt: '/receipt',
  architecture: '/design-decisions'
};

const PATH_TO_SCREEN = {
  '/': 'home',
  '/home': 'home',
  '/homepage': 'home',
  '/login': 'login',
  '/onboarding': 'onboarding',
  '/dashboard': 'dashboard',
  '/form': 'form',
  '/application': 'form',
  '/documents': 'documents',
  '/document-upload': 'documents',
  '/appointment': 'appointment',
  '/confirmation': 'confirmation',
  '/receipt': 'receipt',
  '/design-decisions': 'architecture'
};

const FORM_STEPS = [
  {
    key: 'personal',
    label: 'Personal',
    title: 'Personal details',
    copy: 'Capture the citizen basics first so the form feels familiar instead of overwhelming.',
    fields: [
      { name: 'fullName', label: 'Full name', type: 'text', autocomplete: 'name', required: true },
      { name: 'gender', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other'] },
      { name: 'birthPlace', label: 'Place of birth', type: 'text', required: true }
    ]
  },
  {
    key: 'address',
    label: 'Address',
    title: 'Address details',
    copy: 'Address proof and present address stay together so applicants do not need to mentally map policy language.',
    fields: [
      { name: 'addressLine1', label: 'Address line 1', type: 'text', autocomplete: 'street-address', required: true },
      { name: 'state', label: 'State', type: 'text', autocomplete: 'address-level1', required: true },
      { name: 'postalCode', label: 'PIN code', type: 'text', inputmode: 'numeric', required: true }
    ]
  },
  {
    key: 'background',
    label: 'Background',
    title: 'Background details',
    copy: 'Simple yes or no choices reduce the anxiety of legal and history questions.',
    fields: [
      { name: 'maritalStatus', label: 'Marital status', type: 'select', required: true, options: ['Single', 'Married', 'Divorced', 'Widowed'] },
      { name: 'employmentType', label: 'Employment type', type: 'select', required: true, options: ['Student', 'Private', 'Government', 'Self-employed', 'Other'] },
      { name: 'hasPreviousPassport', label: 'Previous passport issued', type: 'select', required: true, options: ['No', 'Yes'] }
    ]
  },
  {
    key: 'emergency',
    label: 'Emergency',
    title: 'Emergency contact',
    copy: 'Finish with a short support contact section before moving to document readiness.',
    fields: [
      { name: 'contactName', label: 'Emergency contact name', type: 'text', required: true },
      { name: 'relationship', label: 'Relationship', type: 'text', required: true },
      { name: 'phone', label: 'Emergency phone', type: 'tel', inputmode: 'tel', required: true }
    ]
  }
];

const DOCUMENT_BLUEPRINT = [
  {
    key: 'identity',
    title: 'Identity proof',
    purpose: 'Confirms who the applicant is at the appointment counter.',
    suggestedFile: 'aadhaar-card.pdf'
  },
  {
    key: 'address',
    title: 'Address proof',
    purpose: 'Supports the current residential address used for service jurisdiction.',
    suggestedFile: 'bank-statement.pdf'
  },
  {
    key: 'dob',
    title: 'Date of birth proof',
    purpose: 'Validates age and date of birth for passport records.',
    suggestedFile: 'birth-certificate.pdf'
  }
];

const LOCATION_RESULTS = {
  '600001': ['Chennai Regional Passport Office', 'Tambaram POPSK'],
  '560001': ['Bengaluru Passport Seva Kendra', 'Mysuru POPSK'],
  '500001': ['Hyderabad Passport Seva Kendra', 'Secunderabad POPSK']
};
const RECEIPT_PDF_PATH = '/assets/PPT-2026-10482-receipt.pdf';

function createInitialState() {
  return {
    user: null,
    applicationId: 'PPT-2026-10482',
    fee: 'INR 1,500',
    lastSaved: '',
    activity: [],
    profile: {
      name: '',
      dob: '',
      city: '',
      email: DEMO_CREDENTIALS.email
    },
    formStepIndex: 0,
    formData: {
      personal: {
        fullName: '',
        gender: 'Male',
        birthPlace: ''
      },
      address: {
        addressLine1: '',
        state: '',
        postalCode: ''
      },
      background: {
        maritalStatus: 'Single',
        employmentType: 'Student',
        hasPreviousPassport: 'No'
      },
      emergency: {
        contactName: '',
        relationship: '',
        phone: ''
      }
    },
    documents: DOCUMENT_BLUEPRINT.map(item => ({
      ...item,
      uploaded: false,
      fileName: ''
    })),
    appointment: null
  };
}

function mergeState(savedState) {
  const state = createInitialState();
  if (!savedState || typeof savedState !== 'object') {
    return state;
  }

  Object.assign(state, savedState);
  state.profile = { ...state.profile, ...(savedState.profile || {}) };
  state.formData = {
    personal: { ...state.formData.personal, ...(savedState.formData?.personal || {}) },
    address: { ...state.formData.address, ...(savedState.formData?.address || {}) },
    background: { ...state.formData.background, ...(savedState.formData?.background || {}) },
    emergency: { ...state.formData.emergency, ...(savedState.formData?.emergency || {}) }
  };
  state.documents = DOCUMENT_BLUEPRINT.map(item => {
    const savedDoc = Array.isArray(savedState.documents)
      ? savedState.documents.find(entry => entry.key === item.key)
      : null;
    return {
      ...item,
      uploaded: savedDoc?.uploaded || false,
      fileName: savedDoc?.fileName || ''
    };
  });
  state.activity = Array.isArray(savedState.activity) ? savedState.activity.slice(0, 8) : [];
  state.formStepIndex = Number.isInteger(savedState.formStepIndex) ? savedState.formStepIndex : 0;
  return state;
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return mergeState(raw ? JSON.parse(raw) : null);
  } catch (error) {
    return createInitialState();
  }
}

const state = loadState();
const screenRoot = document.getElementById('screen-root');

function saveState(note) {
  state.lastSaved = new Date().toISOString();
  if (note) {
    addActivity(note);
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function addActivity(note) {
  state.activity.unshift({
    note,
    at: new Date().toISOString()
  });
  state.activity = state.activity.slice(0, 8);
}

function formatDateTime(value) {
  if (!value) {
    return 'Not saved yet';
  }
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function formatDateOnly(value) {
  if (!value) {
    return 'Pending';
  }
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

function getCurrentScreen() {
  return PATH_TO_SCREEN[window.location.pathname] || 'home';
}

function navigate(screen, options = {}) {
  const path = ROUTES[screen] || ROUTES.home;
  const method = options.replace ? 'replaceState' : 'pushState';
  window.history[method]({}, '', path);
  render();
}

function cloneTemplate(screen) {
  const template = document.getElementById(`${screen}-template`);
  return template ? template.content.cloneNode(true) : null;
}

function getCompletedFormSteps() {
  return FORM_STEPS.filter(step =>
    step.fields.every(field => String(state.formData[step.key][field.name] || '').trim())
  ).length;
}

function getUploadedDocumentCount() {
  return state.documents.filter(doc => doc.uploaded).length;
}

function getProgress() {
  let progress = 8;
  if (state.user) {
    progress += 12;
  }
  progress += Math.round((getCompletedFormSteps() / FORM_STEPS.length) * 45);
  progress += Math.round((getUploadedDocumentCount() / state.documents.length) * 20);
  if (state.appointment) {
    progress += 15;
  }
  return Math.min(progress, 100);
}

function getStatusText() {
  if (state.appointment) {
    return 'Appointment booked';
  }
  if (getUploadedDocumentCount() === state.documents.length) {
    return 'Ready for appointment booking';
  }
  if (getCompletedFormSteps() === FORM_STEPS.length) {
    return 'Documents pending';
  }
  if (state.user) {
    return 'Application in progress';
  }
  return 'Login required';
}

function getNextActionCopy() {
  if (!state.user) {
    return 'Use the seeded demo login to unlock the guided flow and continue the assignment journey.';
  }
  if (getCompletedFormSteps() < FORM_STEPS.length) {
    return 'Continue the guided application form and save the remaining sections.';
  }
  if (getUploadedDocumentCount() < state.documents.length) {
    return 'Upload the remaining proof documents so the booking step opens with confidence.';
  }
  if (!state.appointment) {
    return 'Choose a passport office and slot to generate the acknowledgment receipt.';
  }
  return 'Carry original documents, keep the receipt ready, and arrive a little early for verification.';
}

function getTrackingItems() {
  return [
    { label: 'Application started', status: state.user ? 'Done' : 'Pending' },
    { label: 'Form completed', status: getCompletedFormSteps() === FORM_STEPS.length ? 'Done' : 'Pending' },
    { label: 'Documents uploaded', status: getUploadedDocumentCount() === state.documents.length ? 'Done' : 'Pending' },
    { label: 'Appointment booked', status: state.appointment ? 'Done' : 'Pending' },
    { label: 'In-person verification', status: state.appointment ? 'Upcoming' : 'Locked' }
  ];
}

function getReceiptDetails() {
  const name = state.profile.name || state.user?.name || 'Demo Evaluator';
  const appointmentLabel = state.appointment
    ? `${formatDateOnly(state.appointment.date)} | ${state.appointment.time}`
    : 'Book an appointment to finalize the receipt';

  return {
    name,
    id: state.applicationId,
    office: state.appointment?.passportOffice || 'Pending appointment selection',
    appointment: appointmentLabel,
    fee: state.fee,
    issuedAt: formatDateTime(state.lastSaved || new Date().toISOString()),
    downloadUrl: RECEIPT_PDF_PATH,
    note: state.appointment
      ? 'This acknowledgment is ready to carry to the Passport Seva Kendra.'
      : 'A sample acknowledgment is shown below. Booking an appointment will finalize the office and time slot.'
  };
}

function createFieldMarkup(step, field) {
  const value = state.formData[step.key][field.name] || '';
  if (field.type === 'select') {
    return `
      <label>${field.label}
        <select data-step="${step.key}" data-field="${field.name}" ${field.required ? 'required' : ''}>
          ${field.options.map(option => `
            <option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>
          `).join('')}
        </select>
      </label>
    `;
  }

  return `
    <label>${field.label}
      <input
        type="${field.type}"
        data-step="${step.key}"
        data-field="${field.name}"
        value="${value}"
        ${field.autocomplete ? `autocomplete="${field.autocomplete}"` : ''}
        ${field.inputmode ? `inputmode="${field.inputmode}"` : ''}
        ${field.required ? 'required' : ''}
      />
    </label>
  `;
}

function createSummaryMarkup() {
  const receipt = getReceiptDetails();
  return `
    <div class="summary-grid">
      <div class="summary-block"><span>Applicant</span><strong>${state.profile.name || 'Pending'}</strong></div>
      <div class="summary-block"><span>Application ID</span><strong>${state.applicationId}</strong></div>
      <div class="summary-block"><span>Current status</span><strong>${getStatusText()}</strong></div>
      <div class="summary-block"><span>Receipt state</span><strong>${receipt.note}</strong></div>
    </div>
  `;
}

function createDocumentMarkup(doc) {
  return `
    <article class="document-card ${doc.uploaded ? 'is-ready' : ''}">
      <div>
        <p class="eyebrow">${doc.title}</p>
        <p class="muted">${doc.purpose}</p>
      </div>
      <div class="document-meta">
        <strong>${doc.uploaded ? 'Uploaded' : 'Pending'}</strong>
        <span>${doc.fileName || doc.suggestedFile}</span>
      </div>
      <div class="actions compact-actions">
        <label class="secondary-btn file-button" for="doc-${doc.key}">${doc.uploaded ? 'Replace file' : 'Upload file'}</label>
        <input id="doc-${doc.key}" data-doc-key="${doc.key}" type="file" class="visually-hidden" />
        <button class="primary-btn doc-toggle-btn" type="button" data-doc-key="${doc.key}">
          ${doc.uploaded ? 'Keep uploaded' : 'Mark as ready'}
        </button>
      </div>
    </article>
  `;
}

function updateActiveNav(screen) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const targetScreen = link.dataset.screen;
    link.classList.toggle('active', targetScreen === screen);
  });
}

function wireCommonInteractions() {
  document.querySelectorAll('[data-screen]').forEach(button => {
    button.addEventListener('click', () => navigate(button.dataset.screen));
  });

  document.querySelectorAll('a[href^="/"]').forEach(link => {
    link.addEventListener('click', event => {
      const screen = PATH_TO_SCREEN[new URL(link.href, window.location.origin).pathname];
      if (!screen) {
        return;
      }
      event.preventDefault();
      navigate(screen);
    });
  });
}

function renderHome() {
  const dateNode = document.getElementById('portal-datetime');
  const updateClock = () => {
    const now = new Date();
    const datePart = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: '2-digit',
      year: 'numeric'
    }).format(now);
    const timePart = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    }).format(now);
    dateNode.textContent = `${datePart} | ${timePart}`;
  };
  updateClock();

  const input = document.getElementById('location-search-input');
  const results = document.getElementById('location-results');
  const runSearch = () => {
    const value = input.value.trim();
    const matches = LOCATION_RESULTS[value] || ['No exact location found. Use the nearest Regional Passport Office helpline for support.'];
    results.innerHTML = matches.map(item => `<div class="result-chip">${item}</div>`).join('');
  };
  document.getElementById('location-search-btn').addEventListener('click', runSearch);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      runSearch();
    }
  });
}

function renderLogin() {
  const form = document.getElementById('login-form');
  const errorNode = document.getElementById('login-error');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const payload = new FormData(form);
    const email = String(payload.get('email') || '').trim();
    const password = String(payload.get('password') || '');

    if (email !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      errorNode.textContent = 'Use the seeded demo credentials shown on the form.';
      return;
    }

    state.user = {
      name: state.profile.name || 'Demo Evaluator',
      email
    };
    saveState('Logged in with seeded demo account');
    navigate('onboarding');
  });
}

function renderOnboarding() {
  const form = document.getElementById('onboarding-form');
  form.elements.name.value = state.profile.name || '';
  form.elements.dob.value = state.profile.dob || '';
  form.elements.city.value = state.profile.city || '';

  form.addEventListener('submit', event => {
    event.preventDefault();
    const payload = new FormData(form);
    state.profile.name = String(payload.get('name') || '').trim();
    state.profile.dob = String(payload.get('dob') || '');
    state.profile.city = String(payload.get('city') || '').trim();
    state.formData.personal.fullName = state.profile.name;
    state.user = {
      name: state.profile.name,
      email: DEMO_CREDENTIALS.email
    };
    saveState('Completed onboarding details');
    navigate('dashboard');
  });
}

function renderDashboard() {
  document.getElementById('dashboard-title').textContent = state.profile.name
    ? `${state.profile.name}, here is your application at a glance`
    : 'Your application at a glance';
  document.getElementById('status-text').textContent = getStatusText();
  document.getElementById('application-id').textContent = state.applicationId;
  document.getElementById('last-saved').textContent = formatDateTime(state.lastSaved);
  document.getElementById('progress-label').textContent = `${getProgress()}%`;
  document.getElementById('progress-bar').style.width = `${getProgress()}%`;
  document.getElementById('next-action-copy').textContent = getNextActionCopy();

  const activityList = document.getElementById('activity-list');
  const activityItems = state.activity.length
    ? state.activity
    : [{ note: 'No saved activity yet. Start with the demo login and onboarding flow.', at: new Date().toISOString() }];
  activityList.innerHTML = activityItems
    .map(item => `<li><strong>${item.note}</strong><span class="muted inline-time">${formatDateTime(item.at)}</span></li>`)
    .join('');

  document.getElementById('timeline-list').innerHTML = getTrackingItems()
    .map(item => `<div class="timeline-item"><strong>${item.label}</strong><span>${item.status}</span></div>`)
    .join('');

  document.getElementById('tracking-list').innerHTML = getTrackingItems()
    .map(item => `<div class="tracking-card"><span>${item.label}</span><strong>${item.status}</strong></div>`)
    .join('');

  const exportActions = document.getElementById('export-actions');
  exportActions.innerHTML = `
    <button id="download-summary-btn" class="secondary-btn" type="button">Download summary</button>
    <button id="copy-id-btn" class="secondary-btn" type="button">Copy application ID</button>
    <button id="go-receipt-btn" class="secondary-btn" type="button">Open receipt</button>
  `;

  document.getElementById('download-summary-btn').addEventListener('click', () => {
    const summary = [
      'Passport Application Summary',
      `Applicant: ${state.profile.name || 'Pending'}`,
      `Application ID: ${state.applicationId}`,
      `Status: ${getStatusText()}`,
      `Progress: ${getProgress()}%`,
      `Appointment: ${state.appointment ? `${state.appointment.passportOffice} | ${formatDateOnly(state.appointment.date)} | ${state.appointment.time}` : 'Pending'}`
    ].join('\n');
    downloadTextFile('passport-summary.txt', summary);
  });

  document.getElementById('copy-id-btn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(state.applicationId);
    } catch (error) {
      window.prompt('Copy the application ID:', state.applicationId);
    }
  });

  document.getElementById('go-receipt-btn').addEventListener('click', () => navigate('receipt'));
}

function renderForm() {
  const stepList = document.getElementById('step-list');
  const stepTitle = document.getElementById('form-step-title');
  const stepCopy = document.getElementById('form-step-copy');
  const stageRoot = document.getElementById('form-stage-root');
  const feedback = document.getElementById('form-feedback');
  const savePill = document.getElementById('save-pill');
  const backButton = document.getElementById('back-step-btn');
  const nextButton = document.getElementById('save-next-btn');

  const syncStep = () => {
    stepList.innerHTML = FORM_STEPS.map((step, index) => `
      <div class="step-item ${index === state.formStepIndex ? 'active' : ''}">
        <span>${index + 1}</span>
        <div>
          <strong>${step.label}</strong>
          <small>${step.title}</small>
        </div>
      </div>
    `).join('');

    const step = FORM_STEPS[state.formStepIndex];
    stepTitle.textContent = step.title;
    stepCopy.textContent = step.copy;
    stageRoot.innerHTML = `
      <div class="stack">
        ${step.fields.map(field => createFieldMarkup(step, field)).join('')}
        ${state.formStepIndex === FORM_STEPS.length - 1 ? createSummaryMarkup() : ''}
      </div>
    `;
    backButton.disabled = state.formStepIndex === 0;
    nextButton.textContent = state.formStepIndex === FORM_STEPS.length - 1 ? 'Continue to documents' : 'Save and continue';
  };

  stageRoot.addEventListener('input', event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const stepKey = target.dataset.step;
    const field = target.dataset.field;
    if (!stepKey || !field) {
      return;
    }

    state.formData[stepKey][field] = target.value;
    if (stepKey === 'personal' && field === 'fullName') {
      state.profile.name = target.value;
      if (state.user) {
        state.user.name = target.value;
      }
    }
    saveState();
    savePill.textContent = `Autosaved ${formatDateTime(state.lastSaved)}`;
    feedback.textContent = 'Draft saved automatically.';
  });

  backButton.addEventListener('click', () => {
    state.formStepIndex = Math.max(0, state.formStepIndex - 1);
    saveState();
    syncStep();
  });

  nextButton.addEventListener('click', () => {
    const step = FORM_STEPS[state.formStepIndex];
    const missingField = step.fields.find(field => !String(state.formData[step.key][field.name] || '').trim());
    if (missingField) {
      feedback.textContent = `Please complete ${missingField.label.toLowerCase()} before continuing.`;
      return;
    }

    feedback.textContent = 'Section saved.';
    if (state.formStepIndex === FORM_STEPS.length - 1) {
      saveState('Completed application form');
      navigate('documents');
      return;
    }

    state.formStepIndex += 1;
    saveState();
    syncStep();
  });

  syncStep();
}

function renderDocuments() {
  const list = document.getElementById('document-list');
  const feedback = document.getElementById('document-feedback');
  const continueButton = document.getElementById('docs-to-appointment-btn');

  const syncDocuments = () => {
    list.innerHTML = state.documents.map(createDocumentMarkup).join('');

    list.querySelectorAll('.doc-toggle-btn').forEach(button => {
      button.addEventListener('click', () => {
        const doc = state.documents.find(item => item.key === button.dataset.docKey);
        if (!doc) {
          return;
        }
        doc.uploaded = true;
        doc.fileName = doc.fileName || doc.suggestedFile;
        saveState(`Updated ${doc.title.toLowerCase()}`);
        feedback.textContent = `${doc.title} marked as uploaded.`;
        syncDocuments();
      });
    });

    list.querySelectorAll('input[type="file"]').forEach(input => {
      input.addEventListener('change', event => {
        const target = event.target;
        const doc = state.documents.find(item => item.key === target.dataset.docKey);
        if (!doc) {
          return;
        }
        doc.uploaded = true;
        doc.fileName = target.files?.[0]?.name || doc.suggestedFile;
        saveState(`Uploaded ${doc.title.toLowerCase()}`);
        feedback.textContent = `${doc.title} saved successfully.`;
        syncDocuments();
      });
    });
  };

  continueButton.addEventListener('click', () => {
    if (getUploadedDocumentCount() < state.documents.length) {
      feedback.textContent = 'Upload or mark all required documents before booking an appointment.';
      return;
    }
    navigate('appointment');
  });

  syncDocuments();
}

function renderAppointment() {
  const form = document.getElementById('appointment-form');
  const feedback = document.getElementById('appointment-feedback');
  const nextAvailableDate = new Date();
  nextAvailableDate.setDate(nextAvailableDate.getDate() + 5);

  form.elements.date.min = nextAvailableDate.toISOString().slice(0, 10);
  if (state.appointment) {
    form.elements.passportOffice.value = state.appointment.passportOffice;
    form.elements.date.value = state.appointment.date;
    form.elements.time.value = state.appointment.time;
  } else {
    form.elements.date.value = nextAvailableDate.toISOString().slice(0, 10);
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const payload = new FormData(form);
    state.appointment = {
      passportOffice: String(payload.get('passportOffice') || ''),
      date: String(payload.get('date') || ''),
      time: String(payload.get('time') || '')
    };

    if (!state.appointment.passportOffice || !state.appointment.date || !state.appointment.time) {
      feedback.textContent = 'Choose an office, date, and time slot to continue.';
      return;
    }

    saveState('Booked passport appointment');
    navigate('confirmation');
  });
}

function renderConfirmation() {
  const receipt = getReceiptDetails();
  document.getElementById('confirmation-copy').textContent = `Visit ${receipt.office} on ${receipt.appointment}.`;
  document.getElementById('confirmation-id').textContent = receipt.id;
  document.getElementById('confirmation-slot').textContent = receipt.appointment;
  document.getElementById('confirmation-fee').textContent = receipt.fee;
}

function renderReceipt() {
  const receipt = getReceiptDetails();
  document.getElementById('receipt-status-note').textContent = receipt.note;
  document.getElementById('receipt-name').textContent = receipt.name;
  document.getElementById('receipt-id').textContent = receipt.id;
  document.getElementById('receipt-office').textContent = receipt.office;
  document.getElementById('receipt-slot').textContent = receipt.appointment;
  document.getElementById('receipt-fee').textContent = receipt.fee;
  document.getElementById('receipt-issued').textContent = receipt.issuedAt;

  document.getElementById('download-receipt-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = receipt.downloadUrl;
    link.download = 'PPT-2026-10482-receipt.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
}

function downloadTextFile(fileName, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function render() {
  const screen = getCurrentScreen();
  const fragment = cloneTemplate(screen);
  if (!fragment) {
    screenRoot.innerHTML = '<section class="single"><article class="card"><h3>Screen not found</h3></article></section>';
    return;
  }

  screenRoot.replaceChildren(fragment);
  updateActiveNav(screen);
  wireCommonInteractions();

  if (screen === 'home') {
    renderHome();
  } else if (screen === 'login') {
    renderLogin();
  } else if (screen === 'onboarding') {
    renderOnboarding();
  } else if (screen === 'dashboard') {
    renderDashboard();
  } else if (screen === 'form') {
    renderForm();
  } else if (screen === 'documents') {
    renderDocuments();
  } else if (screen === 'appointment') {
    renderAppointment();
  } else if (screen === 'confirmation') {
    renderConfirmation();
  } else if (screen === 'receipt') {
    renderReceipt();
  }
}

window.addEventListener('popstate', render);
window.addEventListener('DOMContentLoaded', () => {
  if (!state.lastSaved) {
    saveState();
  }
  render();
});
