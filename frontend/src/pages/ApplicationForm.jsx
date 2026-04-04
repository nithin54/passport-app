const DEFAULT_APPLICATION_DRAFT = Object.freeze({
  passportType: 'Fresh Passport',
  address: '',
  emergencyContact: '',
  reviewComplete: false
});

function createApplicationDraft(overrides = {}) {
  return {
    ...DEFAULT_APPLICATION_DRAFT,
    ...overrides
  };
}

function validateApplicationDraft(draft) {
  const normalized = createApplicationDraft(draft);
  const errors = [];

  if (!String(normalized.passportType || '').trim()) {
    errors.push('Passport type is required.');
  }

  if (!String(normalized.address || '').trim()) {
    errors.push('Address is required.');
  }

  if (!String(normalized.emergencyContact || '').trim()) {
    errors.push('Emergency contact is required.');
  }

  return {
    ok: errors.length === 0,
    errors,
    value: normalized
  };
}

function createApplicationSummary(draft, overrides = {}) {
  const normalized = createApplicationDraft(draft);
  return {
    title: overrides.title || 'Passport Application',
    passportType: normalized.passportType,
    address: normalized.address || 'Pending address',
    emergencyContact: normalized.emergencyContact || 'Pending emergency contact',
    reviewLabel: normalized.reviewComplete ? 'Ready for document upload' : 'Draft in progress'
  };
}

module.exports = {
  DEFAULT_APPLICATION_DRAFT,
  createApplicationDraft,
  validateApplicationDraft,
  createApplicationSummary
};
