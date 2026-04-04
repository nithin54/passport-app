function createDashboardMetrics(overrides = {}) {
  return {
    applicationId: overrides.applicationId || 'PPT-2026-10482',
    currentStatus: overrides.currentStatus || 'Application in progress',
    lastSaved: overrides.lastSaved || 'Not saved yet',
    progressPercent: Number.isFinite(overrides.progressPercent) ? overrides.progressPercent : 0,
    appointmentLabel: overrides.appointmentLabel || 'Not booked yet'
  };
}

function createDashboardViewModel(input = {}) {
  const metrics = createDashboardMetrics(input);
  const progressPercent = Math.max(0, Math.min(100, metrics.progressPercent));

  return {
    title: input.title || 'Your application at a glance',
    metrics: {
      ...metrics,
      progressPercent
    },
    nextAction: input.nextAction || (
      progressPercent >= 100
        ? 'Carry original documents and keep the receipt ready for your visit.'
        : 'Continue the application journey and save your progress.'
    ),
    supportItems: input.supportItems || [
      'Document rules',
      'Save confidence',
      'Visit readiness'
    ]
  };
}

module.exports = {
  createDashboardMetrics,
  createDashboardViewModel
};
