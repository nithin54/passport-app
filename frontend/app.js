const STORAGE_KEY = 'passport-frontend-demo';
const DEMO_USER = {
  email: 'hire-me@anshumat.org',
  password: 'HireMe@2025!',
  name: 'Demo Evaluator'
};

class App {
  constructor() {
    this.state = this.loadState();
    this.routes = {
      home: this.renderHome.bind(this),
      login: this.renderLogin.bind(this),
      signup: this.renderSignup.bind(this),
      onboarding: this.renderOnboarding.bind(this),
      dashboard: this.renderDashboard.bind(this),
      apply: this.renderApply.bind(this),
      booking: this.renderBooking.bind(this),
      confirmation: this.renderConfirmation.bind(this)
    };

    window.addEventListener('hashchange', () => this.navigate());
    this.navigate();
  }

  loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return {
        user: saved?.user || null,
        profile: saved?.profile || {
          name: '',
          dob: '',
          city: ''
        },
        application: saved?.application || {
          passportType: 'Fresh Passport',
          address: '',
          emergencyContact: ''
        },
        appointment: saved?.appointment || null
      };
    } catch (error) {
      return {
        user: null,
        profile: {
          name: '',
          dob: '',
          city: ''
        },
        application: {
          passportType: 'Fresh Passport',
          address: '',
          emergencyContact: ''
        },
        appointment: null
      };
    }
  }

  saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  navigate() {
    const hash = window.location.hash.slice(1) || 'home';
    const view = this.routes[hash] || this.renderNotFound.bind(this);
    document.querySelector('#app').innerHTML = view();
  }

  requireUser() {
    if (!this.state.user) {
      window.location.hash = 'login';
      return false;
    }
    return true;
  }

  async login(email, password) {
    const matchesDemoUser = email === DEMO_USER.email && password === DEMO_USER.password;
    if (!matchesDemoUser) {
      this.setMessage('login-error', 'Use the seeded demo credentials shown below.');
      return;
    }

    this.state.user = {
      name: this.state.profile.name || DEMO_USER.name,
      email: DEMO_USER.email
    };
    this.saveState();
    window.location.hash = 'dashboard';
  }

  signup(name, email, password) {
    if (!name || !email || !password) {
      this.setMessage('signup-error', 'Complete all signup fields to continue.');
      return;
    }

    this.state.user = {
      name,
      email
    };
    this.state.profile.name = name;
    this.saveState();
    window.location.hash = 'onboarding';
  }

  saveOnboarding(form) {
    this.state.profile = {
      name: form.name.value.trim(),
      dob: form.dob.value,
      city: form.city.value.trim()
    };
    this.state.user = {
      name: this.state.profile.name || DEMO_USER.name,
      email: this.state.user?.email || DEMO_USER.email
    };
    this.saveState();
    window.location.hash = 'dashboard';
  }

  saveApplication(form) {
    this.state.application = {
      passportType: form.passportType.value,
      address: form.address.value.trim(),
      emergencyContact: form.emergencyContact.value.trim()
    };
    this.saveState();
    this.setMessage('apply-feedback', 'Application draft saved.');
  }

  saveBooking(form) {
    this.state.appointment = {
      office: form.office.value,
      date: form.date.value,
      slot: form.slot.value
    };
    this.saveState();
    window.location.hash = 'confirmation';
  }

  logout() {
    this.state.user = null;
    this.saveState();
    window.location.hash = 'home';
  }

  setMessage(id, message) {
    const node = document.getElementById(id);
    if (node) {
      node.textContent = message;
    }
  }

  renderNotFound() {
    return `
      <div class="app-shell govt-page">
        <div class="govt-panel">
          <h1>Page not found</h1>
          <a href="#home" class="govt-button-primary">Go home</a>
        </div>
      </div>
    `;
  }

  renderHome() {
    return `
      <div class="app-shell govt-page">
        <section class="hero-panel">
          <div>
            <p class="eyebrow">Passport Demo Portal</p>
            <h1>Passport application journey, simplified for evaluation.</h1>
            <p class="lede">
              Start with the demo account, complete a short application, then book an appointment and review the confirmation.
            </p>
            <div class="button-row">
              <a href="#login" class="govt-button-primary">Login</a>
              <a href="#signup" class="govt-button-secondary">Create account</a>
            </div>
          </div>
          <div class="info-card">
            <strong>Demo login</strong>
            <span>${DEMO_USER.email}</span>
            <span>${DEMO_USER.password}</span>
          </div>
        </section>
      </div>
    `;
  }

  renderLogin() {
    return `
      <div class="app-shell govt-page">
        <div class="govt-panel narrow-panel">
          <h1>Sign In</h1>
          <form onsubmit="app.login(this.email.value, this.password.value); return false;" class="stack">
            <label>Email<input name="email" type="email" value="${DEMO_USER.email}" class="govt-input" required></label>
            <label>Password<input name="password" type="password" value="${DEMO_USER.password}" class="govt-input" required></label>
            <button type="submit" class="govt-button-primary">Continue</button>
            <p id="login-error" class="error"></p>
          </form>
          <p class="muted-text">Demo: ${DEMO_USER.email} / ${DEMO_USER.password}</p>
          <p class="muted-text"><a href="#signup">Need an account?</a></p>
        </div>
      </div>
    `;
  }

  renderSignup() {
    return `
      <div class="app-shell govt-page">
        <div class="govt-panel narrow-panel">
          <h1>Create account</h1>
          <form onsubmit="app.signup(this.name.value, this.email.value, this.password.value); return false;" class="stack">
            <label>Full name<input name="name" type="text" class="govt-input" required></label>
            <label>Email<input name="email" type="email" class="govt-input" required></label>
            <label>Password<input name="password" type="password" class="govt-input" required></label>
            <button type="submit" class="govt-button-primary">Continue to onboarding</button>
            <p id="signup-error" class="error"></p>
          </form>
        </div>
      </div>
    `;
  }

  renderOnboarding() {
    if (!this.requireUser()) {
      return '';
    }

    return `
      <div class="app-shell govt-page">
        <div class="govt-panel">
          <h1>Onboarding</h1>
          <p class="lede">Fill in the applicant basics before moving to the dashboard.</p>
          <form onsubmit="app.saveOnboarding(this); return false;" class="stack">
            <label>Full name<input name="name" type="text" value="${this.state.profile.name}" class="govt-input" required></label>
            <label>Date of birth<input name="dob" type="date" value="${this.state.profile.dob}" class="govt-input" required></label>
            <label>City<input name="city" type="text" value="${this.state.profile.city}" class="govt-input" required></label>
            <button type="submit" class="govt-button-primary">Save and continue</button>
          </form>
        </div>
      </div>
    `;
  }

  renderDashboard() {
    if (!this.requireUser()) {
      return '';
    }

    const appointmentText = this.state.appointment
      ? `${this.state.appointment.office} on ${this.state.appointment.date} at ${this.state.appointment.slot}`
      : 'Not booked yet';

    return `
      <div class="app-shell govt-page">
        <div class="govt-panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Dashboard</p>
              <h1>Welcome ${this.state.user.name}</h1>
            </div>
            <button onclick="app.logout()" class="govt-button-secondary" type="button">Logout</button>
          </div>
          <div class="summary-grid">
            <div class="summary-card"><span>Application</span><strong>PPT-2026-10482</strong></div>
            <div class="summary-card"><span>Profile city</span><strong>${this.state.profile.city || 'Pending'}</strong></div>
            <div class="summary-card"><span>Appointment</span><strong>${appointmentText}</strong></div>
          </div>
          <div class="button-row top-gap">
            <a href="#apply" class="govt-button-primary">Application form</a>
            <a href="#booking" class="govt-button-secondary">Book appointment</a>
          </div>
        </div>
      </div>
    `;
  }

  renderApply() {
    if (!this.requireUser()) {
      return '';
    }

    return `
      <div class="app-shell govt-page">
        <div class="govt-panel">
          <h1>Application</h1>
          <form onsubmit="app.saveApplication(this); return false;" class="stack">
            <label>
              Passport type
              <select name="passportType" class="govt-input">
                <option ${this.state.application.passportType === 'Fresh Passport' ? 'selected' : ''}>Fresh Passport</option>
                <option ${this.state.application.passportType === 'Re-issue Passport' ? 'selected' : ''}>Re-issue Passport</option>
              </select>
            </label>
            <label>Address<input name="address" type="text" value="${this.state.application.address}" class="govt-input" required></label>
            <label>Emergency contact<input name="emergencyContact" type="text" value="${this.state.application.emergencyContact}" class="govt-input" required></label>
            <div class="button-row">
              <button type="submit" class="govt-button-primary">Save application</button>
              <a href="#booking" class="govt-button-secondary">Continue to booking</a>
            </div>
            <p id="apply-feedback" class="saved"></p>
          </form>
        </div>
      </div>
    `;
  }

  renderBooking() {
    if (!this.requireUser()) {
      return '';
    }

    return `
      <div class="app-shell govt-page">
        <div class="govt-panel">
          <h1>Appointment booking</h1>
          <form onsubmit="app.saveBooking(this); return false;" class="stack">
            <label>
              Passport office
              <select name="office" class="govt-input" required>
                <option value="Chennai Regional Passport Office" ${this.state.appointment?.office === 'Chennai Regional Passport Office' ? 'selected' : ''}>Chennai Regional Passport Office</option>
                <option value="Bengaluru Passport Seva Kendra" ${this.state.appointment?.office === 'Bengaluru Passport Seva Kendra' ? 'selected' : ''}>Bengaluru Passport Seva Kendra</option>
                <option value="Hyderabad Passport Seva Kendra" ${this.state.appointment?.office === 'Hyderabad Passport Seva Kendra' ? 'selected' : ''}>Hyderabad Passport Seva Kendra</option>
              </select>
            </label>
            <label>Date<input name="date" type="date" value="${this.state.appointment?.date || ''}" class="govt-input" required></label>
            <label>
              Time slot
              <select name="slot" class="govt-input" required>
                <option value="09:30 AM" ${this.state.appointment?.slot === '09:30 AM' ? 'selected' : ''}>09:30 AM</option>
                <option value="10:30 AM" ${this.state.appointment?.slot === '10:30 AM' ? 'selected' : ''}>10:30 AM</option>
                <option value="11:45 AM" ${this.state.appointment?.slot === '11:45 AM' ? 'selected' : ''}>11:45 AM</option>
              </select>
            </label>
            <button type="submit" class="govt-button-primary">Confirm appointment</button>
          </form>
        </div>
      </div>
    `;
  }

  renderConfirmation() {
    if (!this.requireUser()) {
      return '';
    }

    const appointment = this.state.appointment;
    return `
      <div class="app-shell govt-page">
        <div class="govt-panel">
          <p class="eyebrow">Confirmation</p>
          <h1>Application ready for in-person verification</h1>
          <p class="lede">
            ${appointment ? `Visit ${appointment.office} on ${appointment.date} at ${appointment.slot}.` : 'Book an appointment to finalize your visit.'}
          </p>
          <div class="summary-grid">
            <div class="summary-card"><span>Application ID</span><strong>PPT-2026-10482</strong></div>
            <div class="summary-card"><span>Applicant</span><strong>${this.state.user.name}</strong></div>
            <div class="summary-card"><span>Receipt fee</span><strong>INR 1,500</strong></div>
          </div>
          <div class="button-row top-gap">
            <a href="#dashboard" class="govt-button-secondary">Back to dashboard</a>
            <a href="#apply" class="govt-button-primary">Edit application</a>
          </div>
        </div>
      </div>
    `;
  }
}

const app = new App();
