interface SignupFormValues {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  confirmPassword: string;
  inviteCode?: string;
  agreeToTerms: boolean;
}

interface SignupValidationResult {
  valid: boolean;
  phoneExists?: boolean;
  emailExists?: boolean;
  ipBlocked?: boolean;
  inviteCodeValid?: boolean;
  errors?: Record<keyof SignupFormValues, string>;
}

interface SignupResponse {
  success: boolean;
  userId?: number;
  inviteCode?: string;
  inviteLink?: string;
  errors?: {
    global?: string;
    fields?: Record<string, string>;
  };
}

interface InviteCodeValidation {
  valid: boolean;
  inviterId?: number;
  inviterName?: string;
}