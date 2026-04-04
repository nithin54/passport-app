import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, '..');
const INDEX_FILE = path.join(PUBLIC_DIR, 'index.html');
const ROUTE_ALIASES = new Set([
  '/',
  '/home',
  '/homepage',
  '/dashboard',
  '/form',
  '/application',
  '/documents',
  '/document-upload',
  '/appointment',
  '/confirmation',
  '/receipt',
  '/login',
  '/onboarding',
  '/design-decisions'
]);

// In-memory stores
let users = {};
let applications = {};
let appointments = {};

const demoPassword = 'HireMe@2025!';
const demoUser = {
  _id: 'demo',
  name: 'Demo Evaluator',
  email: 'hire-me@anshumat.org',
  password: demoPassword,
  city: 'Chennai',
  dob: '1999-09-09'
};
users[demoUser.email] = demoUser;

// Utils
const getUserByEmail = email => users[email];
const saveUser = user => { users[user.email] = user; return user; };
const getApplicationByUserId = userId => applications[userId];
const saveApplication = (userId, data) => { applications[userId] = data; return data; };
const getAppointmentByUserId = userId => appointments[userId];
const saveAppointment = (userId, data) => { appointments[userId] = data; return data; };
const getSafeUser = user => {
  if (!user) {
    return null;
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    city: user.city,
    dob: user.dob
  };
};
const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};
const readJsonBody = req => new Promise((resolve, reject) => {
  let raw = '';
  req.on('data', chunk => {
    raw += chunk;
  });
  req.on('end', () => {
    if (!raw) {
      resolve({});
      return;
    }

    try {
      resolve(JSON.parse(raw));
    } catch (error) {
      reject(error);
    }
  });
  req.on('error', reject);
});
const getOrCreateApplication = userId => {
  const existing = getApplicationByUserId(userId);
  if (existing) {
    return existing;
  }

  const created = {
    userId,
    onboarding: null,
    draft: null,
    documents: {},
    updatedAt: new Date().toISOString()
  };
  saveApplication(userId, created);
  return created;
};
const getStatus = userId => {
  const application = getApplicationByUserId(userId);
  const appointment = getAppointmentByUserId(userId);
  const documentCount = Object.keys(application?.documents || {}).length;

  return {
    applicationStarted: Boolean(application?.onboarding),
    applicationDraftSaved: Boolean(application?.draft),
    documentsUploaded: documentCount,
    appointmentBooked: Boolean(appointment),
    status: appointment ? 'appointment-booked' : application?.draft ? 'application-in-progress' : 'not-started'
  };
};
const getIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
};

const createAppServer = () => http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = requestUrl.pathname;

  if (pathname === '/health') {
    sendJson(res, 200, { ok: true, port: req.socket.localPort || PORT });
    return;
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    readJsonBody(req)
      .then(body => {
        const user = getUserByEmail(body.email);
        if (!user || user.password !== body.password) {
          sendJson(res, 401, { error: 'Invalid credentials' });
          return;
        }

        sendJson(res, 200, { user: getSafeUser(user) });
      })
      .catch(() => sendJson(res, 400, { error: 'Invalid JSON body' }));
    return;
  }

  if (pathname === '/api/bootstrap' && req.method === 'GET') {
    const user = getSafeUser(demoUser);
    sendJson(res, 200, {
      user,
      application: getOrCreateApplication(user._id),
      appointment: getAppointmentByUserId(user._id),
      status: getStatus(user._id)
    });
    return;
  }

  if (pathname === '/api/onboarding' && req.method === 'POST') {
    readJsonBody(req)
      .then(body => {
        const user = getUserByEmail(body.email || demoUser.email);
        if (!user) {
          sendJson(res, 404, { error: 'User not found' });
          return;
        }

        user.name = body.name || user.name;
        user.dob = body.dob || user.dob;
        user.city = body.city || user.city;
        saveUser(user);

        const application = getOrCreateApplication(user._id);
        application.onboarding = {
          name: user.name,
          dob: user.dob,
          city: user.city
        };
        application.updatedAt = new Date().toISOString();
        saveApplication(user._id, application);

        sendJson(res, 200, {
          user: getSafeUser(user),
          application,
          status: getStatus(user._id)
        });
      })
      .catch(() => sendJson(res, 400, { error: 'Invalid JSON body' }));
    return;
  }

  if (pathname === '/api/application' && req.method === 'POST') {
    readJsonBody(req)
      .then(body => {
        const userId = body.userId || demoUser._id;
        const application = getOrCreateApplication(userId);
        application.draft = {
          passportType: body.passportType || 'Fresh Passport',
          address: body.address || '',
          emergencyContact: body.emergencyContact || ''
        };
        application.updatedAt = new Date().toISOString();
        saveApplication(userId, application);

        sendJson(res, 200, { application, status: getStatus(userId) });
      })
      .catch(() => sendJson(res, 400, { error: 'Invalid JSON body' }));
    return;
  }

  if (pathname === '/api/documents' && req.method === 'POST') {
    readJsonBody(req)
      .then(body => {
        const userId = body.userId || demoUser._id;
        const application = getOrCreateApplication(userId);
        if (!body.key) {
          sendJson(res, 400, { error: 'Document key is required' });
          return;
        }

        application.documents[body.key] = {
          uploaded: true,
          fileName: body.fileName || `${body.key}.pdf`
        };
        application.updatedAt = new Date().toISOString();
        saveApplication(userId, application);

        sendJson(res, 200, { application, status: getStatus(userId) });
      })
      .catch(() => sendJson(res, 400, { error: 'Invalid JSON body' }));
    return;
  }

  if (pathname === '/api/appointment' && req.method === 'POST') {
    readJsonBody(req)
      .then(body => {
        const userId = body.userId || demoUser._id;
        if (!body.passportOffice || !body.date || !body.time) {
          sendJson(res, 400, { error: 'passportOffice, date, and time are required' });
          return;
        }

        const appointment = {
          passportOffice: body.passportOffice,
          date: body.date,
          time: body.time,
          bookedAt: new Date().toISOString()
        };
        saveAppointment(userId, appointment);

        sendJson(res, 200, { appointment, status: getStatus(userId) });
      })
      .catch(() => sendJson(res, 400, { error: 'Invalid JSON body' }));
    return;
  }

  if (pathname === '/api/export' && req.method === 'GET') {
    const userId = requestUrl.searchParams.get('userId') || demoUser._id;
    const user = Object.values(users).find(entry => entry._id === userId) || demoUser;
    const application = getOrCreateApplication(userId);
    const appointment = getAppointmentByUserId(userId);

    sendJson(res, 200, {
      user: getSafeUser(user),
      application,
      appointment,
      receipt: {
        applicationId: 'PPT-2026-10482',
        fee: 'INR 1,500',
        downloadUrl: '/assets/PPT-2026-10482-receipt.pdf'
      }
    });
    return;
  }

  if (pathname === '/api/status' && req.method === 'GET') {
    const userId = requestUrl.searchParams.get('userId') || demoUser._id;
    sendJson(res, 200, {
      userId,
      ...getStatus(userId),
      appointment: getAppointmentByUserId(userId)
    });
    return;
  }

  const isFileRequest = path.extname(pathname).length > 0;
  const filePath = isFileRequest
    ? path.join(PUBLIC_DIR, pathname)
    : ROUTE_ALIASES.has(pathname)
      ? INDEX_FILE
      : path.join(PUBLIC_DIR, pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.json': 'application/json'
  }[ext] || 'application/octet-stream';

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      if (!isFileRequest) {
        fs.readFile(INDEX_FILE, (indexErr, data) => {
          if (indexErr) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server Error');
            return;
          }

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  });
});

const startServer = (port = PORT, { log = true } = {}) => {
  const server = createAppServer();
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '0.0.0.0', () => {
      server.off('error', reject);
      if (log) {
        const ip = getIP();
        console.log('=== Passport App Ready ===');
        console.log(`Local: http://localhost:${port}/homepage`);
        console.log(`LAN: http://${ip}:${port}/homepage`);
        console.log('Demo login: hire-me@anshumat.org / HireMe@2025!');
        console.log('Commands: npm start, run-local.cmd, npm test');
        console.log('========================');
        console.log(`Server listening on port ${port}`);
      }
      resolve(server);
    });
  });
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  startServer().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

export { PORT, createAppServer, startServer };
