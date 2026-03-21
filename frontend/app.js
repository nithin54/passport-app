const root = document.getElementById("screen-root");
const navButtons = Array.from(document.querySelectorAll(".nav-link"));
const LOCAL_APP_URL = "http://localhost:3000";
const API_BASE = (() => {
  const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (window.location.protocol === "file:") return LOCAL_APP_URL;
  if (isLocalhost && window.location.port && window.location.port !== "3000") {
    return LOCAL_APP_URL;
  }
  return "";
})();

if (window.location.protocol === "file:") {
  window.location.replace(LOCAL_APP_URL);
}

const FORM_STEPS = [
  {
    key: "personalDetails",
    title: "Personal details",
    copy: "Start with identity details and basic passport preferences.",
    stepNumber: 1,
    fields: [
      { name: "givenName", label: "Given Name", type: "text" },
      { name: "surname", label: "Surname", type: "text" },
      { name: "gender", label: "Gender", type: "select", options: ["Female", "Male", "Prefer not to say"] },
      { name: "nationality", label: "Nationality", type: "text" },
      { name: "birthPlace", label: "Place of Birth", type: "text" },
      { name: "maritalStatus", label: "Marital Status", type: "select", options: ["Single", "Married"] },
      { name: "education", label: "Education", type: "select", options: ["Undergraduate", "Graduate", "Postgraduate"] },
      { name: "employmentType", label: "Employment Type", type: "select", options: ["Student", "Private sector", "Government", "Self employed"] },
      { name: "placeOfIssuePreference", label: "Preferred Passport Office City", type: "text" }
    ]
  },
  {
    key: "address",
    title: "Address details",
    copy: "Capture residence proof information in one clean section.",
    stepNumber: 2,
    fields: [
      { name: "line1", label: "Address Line 1", type: "text" },
      { name: "line2", label: "Address Line 2", type: "text" },
      { name: "city", label: "City", type: "text" },
      { name: "state", label: "State", type: "text" },
      { name: "pincode", label: "Pincode", type: "text" },
      { name: "residenceType", label: "Residence Type", type: "select", options: ["Owned", "Rented", "With parents", "Hostel"] },
      { name: "yearsAtAddress", label: "Years at this address", type: "text" }
    ]
  },
  {
    key: "background",
    title: "Background and eligibility",
    copy: "Ask a few important policy questions in plain language.",
    stepNumber: 3,
    fields: [
      { name: "citizenshipBy", label: "Citizenship By", type: "select", options: ["Birth", "Descent", "Registration", "Naturalization"] },
      { name: "previousPassport", label: "Previously held a passport?", type: "select", options: ["No", "Yes"] },
      { name: "criminalRecord", label: "Any pending criminal case?", type: "select", options: ["No", "Yes"] },
      { name: "emigrationCheckRequired", label: "Emigration check required?", type: "select", options: ["No", "Yes"] }
    ]
  },
  {
    key: "emergency",
    title: "Emergency contact",
    copy: "Add one person the system can reference if needed.",
    stepNumber: 4,
    fields: [
      { name: "contactName", label: "Contact Name", type: "text" },
      { name: "relationship", label: "Relationship", type: "text" },
      { name: "phone", label: "Phone Number", type: "text" },
      { name: "city", label: "City", type: "text" }
    ]
  },
  {
    key: "review",
    title: "Review your application",
    copy: "Check every section before moving to document upload.",
    stepNumber: 5
  }
];

const LOCATION_DIRECTORY = [
  {
    pin: "517507",
    office: "PSK Tirupati",
    address: "KVC Arcade, 13/1, Vani Nagar, RC Road, Tirupati 517507"
  },
  {
    pin: "411021",
    office: "Passport Seva Kendra Pune",
    address: "Mont Claire, Baner-Pashan Link Road, Pashan, Pune 411021"
  },
  {
    pin: "600006",
    office: "Chennai Regional Passport Office",
    address: "Rayala Towers, Anna Salai, Chennai 600006"
  },
  {
    pin: "560001",
    office: "Bengaluru Passport Seva Kendra",
    address: "Lalbagh Road, Bengaluru 560001"
  },
  {
    pin: "500001",
    office: "Hyderabad Passport Seva Kendra",
    address: "Nampally Station Road, Hyderabad 500001"
  }
];

const ROUTE_TO_SCREEN = {
  "/": "home",
  "/home": "home",
  "/homepage": "home",
  "/onboarding": "onboarding",
  "/dashboard": "dashboard",
  "/application": "form",
  "/multi-step-form": "form",
  "/review": "form",
  "/documents": "documents",
  "/document-upload": "documents",
  "/appointment": "appointment",
  "/confirmation": "confirmation",
  "/receipt": "receipt",
  "/design-decisions": "architecture"
};

const SCREEN_TO_ROUTE = {
  home: "/homepage",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  form: "/application",
  documents: "/documents",
  appointment: "/appointment",
  confirmation: "/confirmation",
  receipt: "/receipt",
  architecture: "/design-decisions",
  login: "/login"
};

const state = {
  token: "",
  user: null,
  application: null,
  activity: [],
  timeline: [],
  exportInfo: null,
  currentFormStep: 0
};

const screens = {
  home: "home-template",
  login: "login-template",
  onboarding: "onboarding-template",
  dashboard: "dashboard-template",
  form: "form-template",
  documents: "documents-template",
  appointment: "appointment-template",
  confirmation: "confirmation-template",
  receipt: "receipt-template",
  architecture: "architecture-template"
};

function formatDateTime(value) {
  if (!value) return "Not saved yet";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function activateNav(screen) {
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === screen);
  });
}

function cloneTemplate(id) {
  return document.getElementById(id).content.cloneNode(true);
}

function render(screen) {
  activateNav(screen);
  const targetRoute = SCREEN_TO_ROUTE[screen];
  if (targetRoute && window.location.pathname !== targetRoute) {
    window.history.pushState({}, "", targetRoute);
  }
  root.innerHTML = "";
  root.appendChild(cloneTemplate(screens[screen]));
  bindSharedActions();
  if (screen === "home") fillHome();
  if (screen === "login") bindLogin();
  if (screen === "onboarding") bindOnboarding();
  if (screen === "dashboard") fillDashboard();
  if (screen === "form") renderFormStep();
  if (screen === "documents") fillDocuments();
  if (screen === "appointment") bindAppointment();
  if (screen === "confirmation") fillConfirmation();
  if (screen === "receipt") fillReceipt();
}

function fillHome() {
  const dateEl = document.getElementById("portal-datetime");
  if (!dateEl) return;

  const now = new Date();
  dateEl.textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  }).format(now);

  const input = document.getElementById("location-search-input");
  const button = document.getElementById("location-search-btn");
  const results = document.getElementById("location-results");

  function renderResults(matches, query) {
    results.innerHTML = "";
    if (!query) return;

    if (!matches.length) {
      results.innerHTML =
        '<div class="location-card"><strong>No matching location found</strong><span>Try a PIN like 517507, 411021, or 600006.</span></div>';
      return;
    }

    matches.forEach((match) => {
      const card = document.createElement("div");
      card.className = "location-card";
      card.innerHTML = `<strong>${match.office}</strong><span>PIN: ${match.pin}</span><p>${match.address}</p>`;
      results.appendChild(card);
    });
  }

  function handleSearch() {
    const query = input.value.trim();
    const matches = LOCATION_DIRECTORY.filter((item) => item.pin.startsWith(query));
    renderResults(matches, query);
  }

  button.addEventListener("click", handleSearch);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  });
}

function syncFormStepFromApplication() {
  if (!state.application) return;
  const serverStep = Number(state.application.currentStep || 1);
  const mappedStep = Math.min(Math.max(serverStep, 1), FORM_STEPS.length);
  state.currentFormStep = mappedStep - 1;
}

function bindSharedActions() {
  document.querySelectorAll("[data-screen]").forEach((item) => {
    item.addEventListener("click", () => {
      const secure = ["dashboard", "form", "documents", "appointment", "receipt"];
      if (secure.includes(item.dataset.screen) && !state.token) {
        render("login");
        return;
      }
      render(item.dataset.screen);
    });
  });

  document.querySelectorAll("[data-action='go-login']").forEach((item) => {
    item.addEventListener("click", () => render("login"));
  });
}

function getInitialScreen() {
  const cleanPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const routeScreen = ROUTE_TO_SCREEN[cleanPath] || "home";
  if (cleanPath === "/review") {
    state.currentFormStep = FORM_STEPS.length - 1;
  }
  const secure = ["onboarding", "dashboard", "form", "documents", "appointment", "receipt"];
  if (secure.includes(routeScreen) && !state.token) {
    return "login";
  }
  return routeScreen;
}

async function api(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
        ...(options.headers || {})
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Something went wrong");
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Cannot reach the backend. Start `run-local.cmd` and open http://localhost:3000."
      );
    }
    throw error;
  }
}

async function bootstrap() {
  const data = await api("/api/bootstrap");
  state.user = data.user;
  state.application = data.application;
  state.activity = data.activity;
  state.timeline = data.timeline || [];
  state.exportInfo = await api("/api/export");
  syncFormStepFromApplication();
}

function bindLogin() {
  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("login-error");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorEl.textContent = "";
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const data = await api("/api/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      state.token = data.token;
      window.localStorage.setItem("passport-demo-token", data.token);
      await bootstrap();
      render("onboarding");
    } catch (error) {
      errorEl.textContent = error.message;
    }
  });
}

function bindOnboarding() {
  const form = document.getElementById("onboarding-form");
  if (state.user) {
    form.elements.name.value = state.user.name || "";
    form.elements.dob.value = state.user.dob || "";
    form.elements.city.value = state.user.city || "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    await api("/api/onboarding", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    await bootstrap();
    render("dashboard");
  });
}

function fillDashboard() {
  document.getElementById("dashboard-title").textContent = `Welcome back, ${state.user.name}`;
  document.getElementById("status-text").textContent = state.application.status;
  document.getElementById("application-id").textContent = state.application.id;
  document.getElementById("last-saved").textContent = formatDateTime(state.application.lastSavedAt);
  document.getElementById("progress-label").textContent = `${state.application.progressPercent}% complete`;
  document.getElementById("progress-bar").style.width = `${state.application.progressPercent}%`;

  const activityList = document.getElementById("activity-list");
  activityList.innerHTML = "";
  state.activity.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    activityList.appendChild(li);
  });

  const timelineList = document.getElementById("timeline-list");
  timelineList.innerHTML = "";
  state.timeline.forEach((item) => {
    const row = document.createElement("div");
    row.className = `timeline-item ${item.status}`;
    row.innerHTML = `<strong>${item.title}</strong><p>${item.detail}</p>`;
    timelineList.appendChild(row);
  });

  const exportActions = document.getElementById("export-actions");
  exportActions.innerHTML = "";
  [
    state.exportInfo.downloadLabel,
    state.exportInfo.receiptLabel,
    `${state.exportInfo.shareLabel}: ${state.exportInfo.applicationId}`,
    `Confirmation email: ${state.exportInfo.emailConfirmation}`,
    `Government fee summary: ${state.exportInfo.fee}`
  ].forEach((label) => {
    const card = document.createElement("div");
    card.className = "tile";
    card.innerHTML = `<strong>${label}</strong>`;
    exportActions.appendChild(card);
  });

  const docsPending = state.application.documents.filter((doc) => doc.status !== "Uploaded").length;
  let nextAction = "Review your saved progress and continue the application.";
  if (state.application.currentStep < 5) {
    nextAction = "Continue the multi-step form and finish the review stage.";
  } else if (docsPending > 0) {
    nextAction = `Upload the remaining ${docsPending} pending document${docsPending > 1 ? "s" : ""}.`;
  } else if (state.application.status !== "Appointment booked") {
    nextAction = "Book your passport office appointment and download the receipt.";
  } else {
    nextAction = "Carry original documents and arrive at the passport office 15 minutes early.";
  }
  document.getElementById("next-action-copy").textContent = nextAction;

  document.getElementById("tracking-title").textContent =
    `Application status tracker: ${state.application.tracking.currentStatus}`;
  const trackingList = document.getElementById("tracking-list");
  trackingList.innerHTML = "";
  state.application.tracking.stages.forEach((stage) => {
    const card = document.createElement("div");
    card.className = `tracking-card ${stage.status}`;
    card.innerHTML = `
      <span class="tracking-label">${stage.title}</span>
      <strong>${stage.date}</strong>
      <p>${stage.detail}</p>
    `;
    trackingList.appendChild(card);
  });
}

function renderFormStep() {
  const savePill = document.getElementById("save-pill");
  const feedback = document.getElementById("form-feedback");
  const stageRoot = document.getElementById("form-stage-root");
  const stepList = document.getElementById("step-list");
  const currentStep = FORM_STEPS[state.currentFormStep];

  document.getElementById("form-step-title").textContent = currentStep.title;
  document.getElementById("form-step-copy").textContent = currentStep.copy;
  savePill.textContent = "Saved";
  feedback.textContent = "";

  stepList.innerHTML = "";
  FORM_STEPS.forEach((step, index) => {
    const item = document.createElement("span");
    item.className = `step ${index === state.currentFormStep ? "active" : ""}`;
    item.textContent = `${step.stepNumber}. ${step.title}`;
    stepList.appendChild(item);
  });

  stageRoot.innerHTML = "";
  if (currentStep.key === "review") {
    stageRoot.appendChild(buildReviewStage());
  } else {
    stageRoot.appendChild(buildFormStage(currentStep));
    bindAutosave(currentStep, savePill);
  }

  const backBtn = document.getElementById("back-step-btn");
  const nextBtn = document.getElementById("save-next-btn");
  backBtn.disabled = state.currentFormStep === 0;
  nextBtn.textContent = currentStep.key === "review" ? "Continue to documents" : "Save and continue";

  backBtn.onclick = () => {
    if (state.currentFormStep > 0) {
      state.currentFormStep -= 1;
      render("form");
    }
  };

  nextBtn.onclick = async () => {
    if (currentStep.key === "review") {
      render("documents");
      return;
    }

    const form = document.getElementById("dynamic-form");
    const payload = Object.fromEntries(new FormData(form).entries());
    const missing = currentStep.fields.some((field) => !String(payload[field.name] || "").trim());
    if (missing) {
      feedback.style.color = "#b42318";
      feedback.textContent = "Please complete all required fields before continuing.";
      return;
    }

    const result = await saveStep(currentStep, payload);
    await bootstrap();
    feedback.style.color = "var(--success)";
    feedback.textContent = `${result.message}. Last saved at ${formatDateTime(result.lastSavedAt)}.`;

    if (state.currentFormStep < FORM_STEPS.length - 1) {
      state.currentFormStep += 1;
      render("form");
    }
  };
}

function buildFormStage(step) {
  const wrap = document.createElement("form");
  wrap.id = "dynamic-form";
  wrap.className = "form-grid";
  const data = state.application[step.key] || {};

  step.fields.forEach((field) => {
    const label = document.createElement("label");
    label.textContent = field.label;

    let input;
    if (field.type === "select") {
      input = document.createElement("select");
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = `Select ${field.label.toLowerCase()}`;
      input.appendChild(placeholder);
      field.options.forEach((option) => {
        const el = document.createElement("option");
        el.value = option;
        el.textContent = option;
        input.appendChild(el);
      });
    } else {
      input = document.createElement("input");
      input.type = field.type;
    }

    input.name = field.name;
    input.required = true;
    input.value = data[field.name] || "";
    label.appendChild(input);
    wrap.appendChild(label);
  });

  const note = document.createElement("div");
  note.className = "card inset full-span";
  note.innerHTML = "<strong>UX note</strong><p>Required fields are grouped logically and saved automatically so the applicant can resume safely.</p>";
  wrap.appendChild(note);

  return wrap;
}

function buildReviewStage() {
  const wrapper = document.createElement("div");
  wrapper.className = "stack";

  [
    { label: "Personal details", data: state.application.personalDetails },
    { label: "Address details", data: state.application.address },
    { label: "Background and eligibility", data: state.application.background },
    { label: "Emergency contact", data: state.application.emergency }
  ].forEach((section) => {
    const card = document.createElement("div");
    card.className = "card inset";
    const rows = Object.entries(section.data)
      .map(([key, value]) => `<div class="review-row"><span>${toLabel(key)}</span><strong>${value}</strong></div>`)
      .join("");
    card.innerHTML = `<h4>${section.label}</h4><div class="review-grid">${rows}</div>`;
    wrapper.appendChild(card);
  });

  return wrapper;
}

function bindAutosave(step, savePill) {
  const form = document.getElementById("dynamic-form");
  let saveTimer;
  Array.from(form.elements).forEach((field) => {
    if (!field.name) return;
    field.addEventListener("input", () => {
      savePill.textContent = "Saving...";
      clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        const payload = Object.fromEntries(new FormData(form).entries());
        await saveStep(step, payload);
        savePill.textContent = "Draft saved";
      }, 500);
    });
  });
}

async function saveStep(step, payload) {
  return api("/api/application/save", {
    method: "POST",
    body: JSON.stringify({
      section: step.key,
      step: step.stepNumber,
      data: payload
    })
  });
}

function fillDocuments() {
  const container = document.getElementById("document-list");
  const feedback = document.getElementById("document-feedback");
  const continueBtn = document.getElementById("docs-to-appointment-btn");
  container.innerHTML = "";
  feedback.textContent = "";

  state.application.documents.forEach((doc) => {
    const card = document.createElement("div");
    card.className = "card inset document-item";
    card.innerHTML = `
      <div class="doc-top">
        <div>
          <h4>${doc.name}</h4>
          <p>${doc.description}</p>
        </div>
        <span class="badge ${doc.status.toLowerCase()}">${doc.status}</span>
      </div>
      <p>${doc.hint}</p>
      <button class="secondary-btn" type="button">Mark as uploaded</button>
    `;

    card.querySelector("button").addEventListener("click", async () => {
      const result = await api("/api/documents/upload", {
        method: "POST",
        body: JSON.stringify({ documentId: doc.id })
      });
      await bootstrap();
      feedback.style.color = "var(--success)";
      feedback.textContent = result.message;
      fillDocuments();
    });

    container.appendChild(card);
  });

  continueBtn.onclick = () => {
    const docsPending = state.application.documents.some((doc) => doc.status !== "Uploaded");
    if (docsPending) {
      feedback.style.color = "#b42318";
      feedback.textContent = "Upload all required documents before booking an appointment.";
      return;
    }
    render("appointment");
  };
}

function bindAppointment() {
  const form = document.getElementById("appointment-form");
  const feedback = document.getElementById("appointment-feedback");
  const appointment = state.application.appointment || {};

  if (appointment.passportOffice) form.elements.passportOffice.value = appointment.passportOffice;
  if (appointment.date) form.elements.date.value = appointment.date;
  if (appointment.time) form.elements.time.value = appointment.time;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    const missing = Object.values(payload).some((value) => !String(value).trim());
    if (missing) {
      feedback.style.color = "#b42318";
      feedback.textContent = "Please select office, date, and time before booking.";
      return;
    }
    const result = await api("/api/appointment/book", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    feedback.style.color = "var(--success)";
    feedback.textContent = result.message;
    await bootstrap();
    render("confirmation");
  });
}

function fillConfirmation() {
  document.getElementById("confirmation-copy").textContent =
    `Your slot is booked at ${state.application.appointment.passportOffice} on ${state.application.appointment.date} during ${state.application.appointment.time}. You can now download the appointment receipt or revisit it from the dashboard.`;
  document.getElementById("confirmation-id").textContent = state.application.id;
  document.getElementById("confirmation-slot").textContent =
    `${state.application.appointment.date}, ${state.application.appointment.time}`;
  document.getElementById("confirmation-fee").textContent = state.application.receipt.fee;
}

function fillReceipt() {
  const booked = Boolean(
    state.application.appointment &&
      state.application.appointment.passportOffice &&
      state.application.appointment.date &&
      state.application.appointment.time
  );
  document.getElementById("receipt-name").textContent =
    `${state.application.personalDetails.givenName} ${state.application.personalDetails.surname}`;
  document.getElementById("receipt-id").textContent = state.application.id;
  document.getElementById("receipt-office").textContent =
    state.application.appointment.passportOffice || "Not booked yet";
  document.getElementById("receipt-slot").textContent =
    state.application.appointment.date && state.application.appointment.time
      ? `${state.application.appointment.date} | ${state.application.appointment.time}`
      : "Appointment not booked yet";
  document.getElementById("receipt-fee").textContent =
    `${state.application.receipt.fee} via ${state.application.receipt.paymentMode}`;
  document.getElementById("receipt-issued").textContent = formatDateTime(
    state.application.receipt.issuedAt
  );
  document.getElementById("receipt-status-note").textContent = booked
    ? "This receipt is ready to download and carry to the passport office."
    : "Book an appointment first to generate the final visit receipt.";

  const downloadBtn = document.getElementById("download-receipt-btn");
  downloadBtn.disabled = !booked;
  downloadBtn.addEventListener("click", () => {
    if (!booked) return;
    const lines = [
      "Passport Application Appointment Receipt",
      `Applicant: ${state.application.personalDetails.givenName} ${state.application.personalDetails.surname}`,
      `Application ID: ${state.application.id}`,
      `Passport Office: ${state.application.appointment.passportOffice}`,
      `Appointment: ${state.application.appointment.date} ${state.application.appointment.time}`,
      `Fee: ${state.application.receipt.fee}`,
      `Issued At: ${formatDateTime(state.application.receipt.issuedAt)}`
    ];
    const blob = buildReceiptPdf(lines);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.application.id}-receipt.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  });
}

function buildReceiptPdf(lines) {
  const escapePdfText = (value) =>
    value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const encoder = new TextEncoder();

  const backgroundStream = [
    "0.98 0.95 0.91 rg",
    "0 0 595 842 re f",
    "0.87 0.46 0.14 rg",
    "36 36 523 770 re f",
    "1 0.99 0.97 rg",
    "48 48 499 746 re f",
    "0.82 0.90 0.89 RG",
    "3 w",
    "62 62 471 718 re S",
    "0.94 0.90 0.84 rg",
    "70 690 455 78 re f",
    "0.07 0.31 0.29 RG",
    "2 w",
    "70 690 455 78 re S",
    "0.90 0.96 0.95 rg",
    "70 560 455 108 re f",
    "0.82 0.90 0.89 RG",
    "1.5 w",
    "70 560 455 108 re S",
    "70 426 455 108 re S",
    "70 292 455 108 re S",
    "70 158 455 108 re S",
    "297 158 m 297 668 l S",
    "0.82 0.73 0.62 rg",
    "420 120 110 110 re f",
    "0.90 0.84 0.76 rg",
    "430 130 90 90 re f",
    "0.86 0.94 0.92 rg",
    "BT",
    "/F1 54 Tf",
    "150 438 Td",
    "0.92 g",
    "(PASSPORT) Tj",
    "ET"
  ].join("\n");

  const textStream = [
    "BT",
    "0.09 0.16 0.24 rg",
    "/F1 22 Tf",
    "50 780 Td",
    `(${escapePdfText(lines[0])}) Tj`,
    "/F1 12 Tf",
    "0 -34 Td",
    ...lines.slice(1).map((line, index) => {
      const prefix = index === 0 ? "" : "0 -22 Td\n";
      return `${prefix}(${escapePdfText(line)}) Tj`;
    }),
    "ET"
  ].join("\n");

  const contentStream = `${backgroundStream}\n${textStream}`;

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
    `5 0 obj\n<< /Length ${encoder.encode(contentStream).length} >>\nstream\n${contentStream}\nendstream\nendobj`
  ];

  const chunks = [];
  let byteLength = 0;
  const offsets = [0];

  function pushChunk(value) {
    const bytes = encoder.encode(value);
    chunks.push(bytes);
    byteLength += bytes.length;
  }

  pushChunk("%PDF-1.4\n");
  objects.forEach((object) => {
    offsets.push(byteLength);
    pushChunk(`${object}\n`);
  });

  const xrefStart = byteLength;
  pushChunk(`xref\n0 ${objects.length + 1}\n`);
  pushChunk("0000000000 65535 f \n");
  offsets.slice(1).forEach((offset) => {
    pushChunk(`${String(offset).padStart(10, "0")} 00000 n \n`);
  });
  pushChunk(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

  return new Blob(chunks, { type: "application/pdf" });
}

function toLabel(value) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

async function restoreSession() {
  const savedToken = window.localStorage.getItem("passport-demo-token");
  if (!savedToken) return;

  state.token = savedToken;
  try {
    await bootstrap();
  } catch (error) {
    window.localStorage.removeItem("passport-demo-token");
    state.token = "";
  }
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const secure = ["dashboard", "form", "documents", "appointment", "receipt"];
    if (secure.includes(button.dataset.screen) && !state.token) {
      render("login");
      return;
    }
    render(button.dataset.screen);
  });
});

restoreSession().finally(() => {
  render(getInitialScreen());
});

window.addEventListener("popstate", () => {
  render(getInitialScreen());
});
