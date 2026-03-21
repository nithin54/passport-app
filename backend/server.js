const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const frontendDir = path.join(__dirname, "..", "frontend");
const screenRoutes = new Map([
  ["/", "index.html"],
  ["/home", "index.html"],
  ["/homepage", "index.html"],
  ["/onboarding", "index.html"],
  ["/dashboard", "index.html"],
  ["/application", "index.html"],
  ["/multi-step-form", "index.html"],
  ["/review", "index.html"],
  ["/documents", "index.html"],
  ["/document-upload", "index.html"],
  ["/appointment", "index.html"],
  ["/confirmation", "index.html"],
  ["/receipt", "index.html"],
  ["/design-decisions", "index.html"],
  ["/login", "login.html"]
]);
const demoUser = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "demo-user.json"), "utf8")
);

const sessions = new Map();
const applicationState = {
  profile: {
    name: demoUser.name,
    email: demoUser.email,
    dob: demoUser.dob,
    city: demoUser.city,
    phone: demoUser.phone
  },
  onboardingComplete: true,
  application: {
    id: "PPT-2026-10482",
    type: "First-Time Regular Passport",
    status: "Draft in progress",
    currentStep: 2,
    totalSteps: 6,
    lastSavedAt: "2026-03-21T10:30:00.000Z",
    progressPercent: 33,
    personalDetails: {
      givenName: "Demo",
      surname: "Applicant",
      gender: "Female",
      nationality: "Indian",
      birthPlace: "Chennai",
      maritalStatus: "Single",
      education: "Undergraduate",
      placeOfIssuePreference: "Chennai",
      employmentType: "Student"
    },
    address: {
      line1: "24, Lake View Road",
      line2: "Adyar",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600020",
      residenceType: "With parents",
      yearsAtAddress: "8"
    },
    background: {
      citizenshipBy: "Birth",
      criminalRecord: "No",
      emigrationCheckRequired: "No",
      previousPassport: "No"
    },
    emergency: {
      contactName: "Mira Applicant",
      relationship: "Mother",
      phone: "+91 91234 56789",
      city: "Chennai"
    },
    documents: [
      {
        id: "aadhaar",
        name: "Aadhaar Card",
        description: "Required for identity and address proof",
        status: "Uploaded",
        hint: "Upload clear front side image or PDF under 2 MB"
      },
      {
        id: "birth",
        name: "Birth Certificate / 10th Marksheet",
        description: "Required for date of birth proof",
        status: "Pending",
        hint: "Accepted formats: PDF, JPG, PNG"
      },
      {
        id: "photo",
        name: "Recent Passport Photo",
        description: "White background, neutral expression",
        status: "Uploaded",
        hint: "Minimum 600x600 resolution recommended"
      }
    ],
    appointment: {
      passportOffice: "Chennai Regional Passport Office",
      date: "2026-03-28",
      time: "10:30 AM - 10:45 AM",
      token: "A-42"
    },
    receipt: {
      issuedAt: "2026-03-21T10:45:00.000Z",
      fee: "INR 1,500",
      paymentMode: "UPI"
    },
    tracking: {
      currentStatus: "Application Draft",
      stages: [
        {
          title: "Application Submitted",
          detail: "Application saved and ready for document completion",
          status: "completed",
          date: "2026-03-21"
        },
        {
          title: "Under Review",
          detail: "Pending final data and document checks",
          status: "current",
          date: "Awaiting completion"
        },
        {
          title: "Police Verification",
          detail: "Will begin after appointment and file acceptance",
          status: "upcoming",
          date: "Pending"
        },
        {
          title: "Printed / Dispatched",
          detail: "Passport printing and courier dispatch status",
          status: "upcoming",
          date: "Pending"
        }
      ]
    }
  },
  activity: [
    "Mobile verified",
    "Profile created",
    "Application draft started",
    "2 documents uploaded"
  ],
  timeline: [
    {
      title: "Account created",
      detail: "Mobile verified and applicant profile started",
      status: "completed"
    },
    {
      title: "Application draft",
      detail: "Form is in progress with autosave active",
      status: "current"
    },
    {
      title: "Document verification",
      detail: "Upload remaining proofs from the checklist",
      status: "upcoming"
    },
    {
      title: "Appointment visit",
      detail: "Book a preferred slot at your passport office",
      status: "upcoming"
    }
  ]
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function getSession(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token || !sessions.has(token)) {
    return null;
  }
  return sessions.get(token);
}

function updateProgressFromStep(step) {
  const totalSteps = applicationState.application.totalSteps;
  applicationState.application.currentStep = step;
  applicationState.application.progressPercent = Math.min(
    100,
    Math.round((step / totalSteps) * 100)
  );
  applicationState.application.lastSavedAt = new Date().toISOString();
}

function updateTimeline() {
  const step = applicationState.application.currentStep;
  const docsComplete = applicationState.application.documents.every(
    (item) => item.status === "Uploaded"
  );
  const appointmentBooked = applicationState.application.status === "Appointment booked";

  applicationState.timeline = [
    {
      title: "Account created",
      detail: "Mobile verified and applicant profile started",
      status: "completed"
    },
    {
      title: "Application draft",
      detail:
        step >= 5 ? "Core details completed and saved" : "Form is in progress with autosave active",
      status: step >= 5 ? "completed" : "current"
    },
    {
      title: "Document verification",
      detail: docsComplete
        ? "All required files uploaded successfully"
        : "Upload remaining proofs from the checklist",
      status: docsComplete ? "completed" : step >= 5 ? "current" : "upcoming"
    },
    {
      title: "Appointment visit",
      detail: appointmentBooked
        ? "Appointment booked and receipt available"
        : "Book a preferred slot at your passport office",
      status: appointmentBooked ? "completed" : docsComplete ? "current" : "upcoming"
    }
  ];
}

function updateTracking() {
  const appointmentBooked = applicationState.application.status === "Appointment booked";
  const docsComplete = applicationState.application.documents.every(
    (item) => item.status === "Uploaded"
  );

  let currentStatus = "Application Draft";
  let stages = [
    {
      title: "Application Submitted",
      detail: "Application saved and ready for document completion",
      status: "completed",
      date: "2026-03-21"
    },
    {
      title: "Under Review",
      detail: docsComplete
        ? "All data and documents are ready for appointment processing"
        : "Pending final data and document checks",
      status: docsComplete ? "completed" : "current",
      date: docsComplete ? "Ready for appointment" : "Awaiting completion"
    },
    {
      title: "Police Verification",
      detail: appointmentBooked
        ? "Verification will start after in-person processing"
        : "Will begin after appointment and file acceptance",
      status: appointmentBooked ? "current" : "upcoming",
      date: appointmentBooked ? "Scheduled after visit" : "Pending"
    },
    {
      title: "Printed / Dispatched",
      detail: "Passport printing and courier dispatch status",
      status: "upcoming",
      date: "Pending"
    }
  ];

  if (appointmentBooked) {
    currentStatus = "Appointment Booked";
  } else if (docsComplete) {
    currentStatus = "Under Review";
  }

  applicationState.application.tracking = {
    currentStatus,
    stages
  };
}

updateTimeline();
updateTracking();

function handleApi(req, res, parsedUrl) {
  if (req.method === "POST" && parsedUrl.pathname === "/api/login") {
    parseBody(req)
      .then((body) => {
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");

        if (email !== demoUser.email || password !== demoUser.password) {
          sendJson(res, 401, {
            error:
              "Email or password is incorrect. Use the seeded demo login from the README."
          });
          return;
        }

        const token = `session-${Date.now()}`;
        sessions.set(token, {
          userId: demoUser.id,
          email: demoUser.email
        });

        sendJson(res, 200, {
          token,
          user: {
            name: applicationState.profile.name,
            email: applicationState.profile.email
          }
        });
      })
      .catch(() => {
        sendJson(res, 400, { error: "Invalid request body." });
      });
    return true;
  }

  if (req.method === "GET" && parsedUrl.pathname === "/api/health") {
    sendJson(res, 200, {
      status: "ok",
      service: "passport-application-experience",
      date: new Date().toISOString()
    });
    return true;
  }

  if (req.method === "GET" && parsedUrl.pathname === "/api/bootstrap") {
    if (!getSession(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return true;
    }

    sendJson(res, 200, {
      user: applicationState.profile,
      onboardingComplete: applicationState.onboardingComplete,
      application: applicationState.application,
      activity: applicationState.activity,
      timeline: applicationState.timeline
    });
    return true;
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/onboarding") {
    if (!getSession(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return true;
    }

    parseBody(req)
      .then((body) => {
        applicationState.profile.name = body.name || applicationState.profile.name;
        applicationState.profile.dob = body.dob || applicationState.profile.dob;
        applicationState.profile.city = body.city || applicationState.profile.city;
        applicationState.onboardingComplete = true;
        applicationState.activity.unshift("Onboarding completed");
        sendJson(res, 200, {
          message: "Welcome setup saved",
          profile: applicationState.profile
        });
      })
      .catch(() => {
        sendJson(res, 400, { error: "Invalid request body." });
      });
    return true;
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/application/save") {
    if (!getSession(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return true;
    }

    parseBody(req)
      .then((body) => {
        const section = body.section;
        const data = body.data || {};
        const step = Number(body.step || applicationState.application.currentStep);

        if (section === "personalDetails") {
          applicationState.application.personalDetails = {
            ...applicationState.application.personalDetails,
            ...data
          };
        }

        if (section === "address") {
          applicationState.application.address = {
            ...applicationState.application.address,
            ...data
          };
        }

        if (section === "background") {
          applicationState.application.background = {
            ...applicationState.application.background,
            ...data
          };
        }

        if (section === "emergency") {
          applicationState.application.emergency = {
            ...applicationState.application.emergency,
            ...data
          };
        }

        updateProgressFromStep(step);
        updateTimeline();
        updateTracking();
        sendJson(res, 200, {
          message: "Application draft saved",
          lastSavedAt: applicationState.application.lastSavedAt,
          progressPercent: applicationState.application.progressPercent
        });
      })
      .catch(() => {
        sendJson(res, 400, { error: "Invalid request body." });
      });
    return true;
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/documents/upload") {
    if (!getSession(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return true;
    }

    parseBody(req)
      .then((body) => {
        const documentId = body.documentId;
        const target = applicationState.application.documents.find(
          (item) => item.id === documentId
        );

        if (!target) {
          sendJson(res, 404, { error: "Document not found." });
          return;
        }

        target.status = "Uploaded";
        updateProgressFromStep(5);
        updateTimeline();
        updateTracking();
        sendJson(res, 200, {
          message: `${target.name} uploaded successfully`,
          documents: applicationState.application.documents,
          lastSavedAt: applicationState.application.lastSavedAt
        });
      })
      .catch(() => {
        sendJson(res, 400, { error: "Invalid request body." });
      });
    return true;
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/appointment/book") {
    if (!getSession(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return true;
    }

    parseBody(req)
      .then((body) => {
        applicationState.application.appointment = {
          passportOffice: body.passportOffice,
          date: body.date,
          time: body.time,
          token: "B-17"
        };
        applicationState.application.status = "Appointment booked";
        applicationState.application.receipt.issuedAt = new Date().toISOString();
        applicationState.activity.unshift("Appointment booked");
        updateProgressFromStep(6);
        updateTimeline();
        updateTracking();
        sendJson(res, 200, {
          message: "Appointment booked successfully",
          appointment: applicationState.application.appointment,
          status: applicationState.application.status
        });
      })
      .catch(() => {
        sendJson(res, 400, { error: "Invalid request body." });
      });
    return true;
  }

  if (req.method === "GET" && parsedUrl.pathname === "/api/export") {
    if (!getSession(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return true;
    }

    sendJson(res, 200, {
      applicationId: applicationState.application.id,
      downloadLabel: "Download application PDF",
      receiptLabel: "Download appointment receipt",
      shareLabel: "Share application ID",
      emailConfirmation: applicationState.profile.email,
      fee: applicationState.application.receipt.fee
    });
    return true;
  }

  return false;
}

function serveStatic(req, res, parsedUrl) {
  let requestedPath = parsedUrl.pathname.replace(/\/+$/, "") || "/";
  let targetPath = requestedPath;

  if (screenRoutes.has(requestedPath)) {
    targetPath = `/${screenRoutes.get(requestedPath)}`;
  } else if (requestedPath === "/") {
    targetPath = "/index.html";
  } else if (!path.extname(requestedPath)) {
    targetPath = "/index.html";
  }
  targetPath = path.normalize(targetPath).replace(/^(\.\.[/\\])+/, "");

  const filePath = path.join(frontendDir, targetPath);
  if (!filePath.startsWith(frontendDir)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream"
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, "http://localhost:3000");

  if (parsedUrl.pathname.startsWith("/api/")) {
    const handled = handleApi(req, res, parsedUrl);
    if (!handled) {
      sendJson(res, 404, { error: "API endpoint not found" });
    }
    return;
  }

  serveStatic(req, res, parsedUrl);
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Passport application experience running at http://localhost:${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Close the existing server or use a different PORT.`);
    process.exit(1);
  }

  console.error("Server failed to start:", error);
  process.exit(1);
});

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
