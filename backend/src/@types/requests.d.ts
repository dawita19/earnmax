interface RegisterUserRequest {
  full_name: string;
  phone_number: string;
  email?: string;
  password: string;
  confirm_password: string;
  invite_code?: string;
}

interface LoginRequest {
  identifier: string; // phone or email
  password: string;
  two_factor_code?: string;
}

interface PurchaseRequest {
  vip_level: number;
  payment_method: string;
  payment_proof: FileUpload; // Handled by multer
}

interface WithdrawalRequest {
  amount: number;
  payment_method: string;
  payment_details: string;
  transaction_pin: string;
}

interface UpgradeRequest {
  new_vip_level: number;
  payment_method?: string;
  payment_proof?: FileUpload; // Only required if additional payment needed
}

interface CompleteTaskRequest {
  task_id: string;
  verification_data?: any; // For fraud prevention
}

interface AdminActionRequest {
  request_ids: string[];
  action: 'approve' | 'reject';
  notes?: string;
}

interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export {
  RegisterUserRequest,
  LoginRequest,
  PurchaseRequest,
  WithdrawalRequest,
  UpgradeRequest,
  CompleteTaskRequest,
  AdminActionRequest,
  FileUpload
};