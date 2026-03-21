# Passport Application Experience Redesign

This project is a full-stack assignment prototype that redesigns the passport application journey with a stronger focus on clarity, structure, usability, and first-time applicant confidence.

## Project Structure

- `/frontend` contains the web UI for the landing page, login, onboarding, dashboard, form flow, document checklist, appointment booking, confirmation, and receipt.
- `/backend` contains a lightweight Node server and demo APIs for login, autosave, document updates, booking, exports, and status tracking.

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js HTTP server
- Data: Seeded JSON demo user with in-memory application state

## Setup

1. Open the project root in a terminal.
2. Run `npm start`
3. Visit `http://localhost:3000/homepage`

For mobile testing on the same Wi-Fi, open the printed LAN URL such as
`http://192.168.x.x:3000/homepage`

For mobile testing on a different network, start a public tunnel and use the
generated HTTPS URL.

No extra installation is required.

### Windows fallback launcher

If your terminal setup has trouble keeping `npm start` open, run:

- `run-local.cmd`

This starts the same app directly with Node and prints the local URL and demo login.
It also prints a LAN URL for phone testing when your device is on the same network.

## Test Cases

Run the smoke test suite with:

- `npm test`

This checks:

- page routes
- health endpoint
- demo login
- bootstrap data
- onboarding save
- application draft save
- document upload
- appointment booking
- export data
- final booked state

## Demo Login

- Email: `hire-me@anshumat.org`
- Password: `HireMe@2025!`

## Assignment Coverage

### Problem Understanding

The redesign addresses the main issues in current passport application patterns:

- Overwhelming navigation for first-time users
- Long forms with poor progress visibility
- Unclear document requirements and upload expectations
- Weak reassurance around saving progress
- Appointment booking that feels disconnected from the main flow

### User Flow

The prototype covers:

1. Homepage
2. Separate login page
3. Onboarding / application introduction
4. Dashboard with status tracking
5. Multi-step application form
6. Review stage before submission
7. Document upload checklist
8. Appointment booking
9. Confirmation with record access
10. Downloadable receipt view

### Information Architecture

Primary navigation:

- Home
- Dashboard
- Application
- Documents
- Appointment

Persistent support content:

- Save status
- Progress percentage
- Application ID
- Export and receipt access
- Status tracking dashboard

### UX Improvements

- Mobile-responsive layouts
- Accessibility improvements including live feedback regions and clearer focus behavior
- Smart form features like autosave, validation, and autocomplete on key fields
- Review stage before documents and booking
- Document checklist with purpose, status, and format guidance
- Dashboard-driven status timeline and next-action guidance
- Export-style record access after submission
- Downloadable appointment receipt with PDF export
- LAN-friendly mobile testing and public off-network tunnel support

### Design Decisions

- Orientation appears before data entry to reduce anxiety.
- The application is broken into smaller guided stages instead of one heavy form.
- Documents are explained by purpose, not just listed.
- Submission is not the end of the experience; records and tracking stay visible afterward.
- The homepage was redesigned to feel more like a real public passport services portal.

## Notes

- This is an assignment prototype, not a production passport system.
- The backend uses in-memory state for easy reviewer setup.
- The interface intentionally rethinks the flow instead of copying the existing Passport Seva design exactly.
- For same-network mobile access, Windows Firewall may need to allow TCP port `3000`.
