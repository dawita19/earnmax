// src/components/forms/FormStepper.tsx
import React from 'react';
import { Stepper, Step, StepLabel, Box, Button, Paper } from '@mui/material';
import { LoadingButton } from '@mui/lab';

interface FormStep {
  label: string;
  component: React.ReactNode;
  validation?: () => Promise<boolean>;
}

interface FormStepperProps {
  steps: FormStep[];
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
}

export const FormStepper: React.FC<FormStepperProps> = ({
  steps,
  onSubmit,
  onCancel,
  submitButtonText = 'Submit',
}) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleNext = async () => {
    const currentStep = steps[activeStep];
    if (currentStep.validation) {
      const isValid = await currentStep.validation();
      if (!isValid) return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3, mb: 3 }}>{steps[activeStep].component}</Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Back
        </Button>

        <Box>
          {onCancel && (
            <Button onClick={onCancel} variant="outlined" sx={{ mr: 1 }}>
              Cancel
            </Button>
          )}

          {activeStep === steps.length - 1 ? (
            <LoadingButton
              onClick={handleSubmit}
              variant="contained"
              loading={isSubmitting}
            >
              {submitButtonText}
            </LoadingButton>
          ) : (
            <Button onClick={handleNext} variant="contained">
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};