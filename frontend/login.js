const LOCAL_APP_URL = "http://localhost:3000";
const API_BASE = (() => {
  const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (window.location.protocol === "file:") return LOCAL_APP_URL;
  if (isLocalhost && window.location.port && window.location.port !== "3000") {
    return LOCAL_APP_URL;
  }
  return "";
})();
const APP_BASE = API_BASE || window.location.origin;

if (window.location.protocol === "file:") {
  window.location.replace(`${LOCAL_APP_URL}/login`);
}

const form = document.getElementById("login-form");
const errorEl = document.getElementById("login-error");
const demoBtn = document.getElementById("demo-login-btn");

async function submitLogin(event) {
  if (event) event.preventDefault();
  errorEl.textContent = "";

  try {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: form.elements.email.value,
        password: form.elements.password.value
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Login failed.");
    }

    window.localStorage.setItem("passport-demo-token", data.token);
    const bootstrapResponse = await fetch(`${API_BASE}/api/bootstrap`, {
      headers: {
        Authorization: `Bearer ${data.token}`
      }
    });
    if (!bootstrapResponse.ok) {
      throw new Error("Login succeeded but dashboard session could not be prepared.");
    }
    window.location.replace(`${APP_BASE}/dashboard`);
  } catch (error) {
    if (error instanceof TypeError) {
      errorEl.textContent =
        "Cannot reach the backend. Start run-local.cmd and open http://localhost:3000/login.";
      return;
    }
    errorEl.textContent = error.message;
  }
}

demoBtn.addEventListener("click", async () => {
  form.elements.email.value = "hire-me@anshumat.org";
  form.elements.password.value = "HireMe@2025!";
  await submitLogin();
});

form.addEventListener("submit", submitLogin);
