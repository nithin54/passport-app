const FORM_WIZARD_STEPS = Object.freeze([
  { key: 'personal', label: 'Personal', title: 'Personal details' },
  { key: 'address', label: 'Address', title: 'Address details' },
  { key: 'background', label: 'Background', title: 'Background details' },
  { key: 'emergency', label: 'Emergency', title: 'Emergency contact' }
]);

function clampStepIndex(index) {
  if (!Number.isInteger(index)) {
    return 0;
  }

  return Math.min(Math.max(index, 0), FORM_WIZARD_STEPS.length - 1);
}

function getWizardStep(index) {
  return FORM_WIZARD_STEPS[clampStepIndex(index)];
}

function createWizardState(currentIndex = 0, completedKeys = []) {
  const safeIndex = clampStepIndex(currentIndex);
  const completed = new Set(completedKeys);

  return {
    currentIndex: safeIndex,
    currentStep: FORM_WIZARD_STEPS[safeIndex],
    steps: FORM_WIZARD_STEPS.map((step, index) => ({
      ...step,
      active: index === safeIndex,
      completed: completed.has(step.key)
    }))
  };
}

module.exports = {
  FORM_WIZARD_STEPS,
  clampStepIndex,
  getWizardStep,
  createWizardState
};
