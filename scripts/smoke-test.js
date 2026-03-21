const http = require("http");

const BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";
const DEMO_LOGIN = {
  email: "hire-me@anshumat.org",
  password: "HireMe@2025!"
};

function request(path, options = {}) {
  const url = new URL(path, BASE_URL);
  const body = options.body ? JSON.stringify(options.body) : null;

  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method: options.method || "GET",
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
          ...(body ? { "Content-Length": Buffer.byteLength(body) } : {})
        }
      },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          let parsed = raw;
          try {
            parsed = raw ? JSON.parse(raw) : {};
          } catch (_error) {
            parsed = raw;
          }
          resolve({
            statusCode: res.statusCode,
            body: parsed
          });
        });
      }
    );

    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const pageRoutes = [
    "/homepage",
    "/login",
    "/onboarding",
    "/dashboard",
    "/multi-step-form",
    "/review",
    "/document-upload",
    "/appointment",
    "/confirmation",
    "/receipt",
    "/design-decisions"
  ];

  for (const route of pageRoutes) {
    const response = await request(route);
    assert(response.statusCode === 200, `${route} should return 200`);
  }

  const health = await request("/api/health");
  assert(health.statusCode === 200, "/api/health should return 200");
  assert(health.body.status === "ok", "/api/health should report ok");

  const login = await request("/api/login", {
    method: "POST",
    body: DEMO_LOGIN
  });
  assert(login.statusCode === 200, "Demo login should succeed");
  assert(login.body.token, "Demo login should return a token");

  const token = login.body.token;

  const bootstrap = await request("/api/bootstrap", { token });
  assert(bootstrap.statusCode === 200, "Bootstrap should succeed");
  assert(
    bootstrap.body.application && bootstrap.body.application.id,
    "Bootstrap should include application data"
  );

  const onboarding = await request("/api/onboarding", {
    method: "POST",
    token,
    body: {
      name: "Demo Applicant",
      dob: "2003-07-22",
      city: "Chennai"
    }
  });
  assert(onboarding.statusCode === 200, "Onboarding save should succeed");

  const saveDraft = await request("/api/application/save", {
    method: "POST",
    token,
    body: {
      section: "address",
      step: 2,
      data: {
        line1: "24, Lake View Road",
        line2: "Adyar",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600020",
        residenceType: "With parents",
        yearsAtAddress: "8"
      }
    }
  });
  assert(saveDraft.statusCode === 200, "Application save should succeed");

  const uploadDocument = await request("/api/documents/upload", {
    method: "POST",
    token,
    body: {
      documentId: "birth"
    }
  });
  assert(uploadDocument.statusCode === 200, "Document upload should succeed");

  const appointment = await request("/api/appointment/book", {
    method: "POST",
    token,
    body: {
      passportOffice: "Chennai Regional Passport Office",
      date: "2026-03-28",
      time: "10:30 AM - 10:45 AM"
    }
  });
  assert(appointment.statusCode === 200, "Appointment booking should succeed");

  const exportInfo = await request("/api/export", { token });
  assert(exportInfo.statusCode === 200, "Export endpoint should succeed");
  assert(exportInfo.body.applicationId, "Export info should include application ID");

  const refreshed = await request("/api/bootstrap", { token });
  assert(
    refreshed.body.application.status === "Appointment booked",
    "Application should reach appointment booked state"
  );

  console.log("Smoke tests passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
