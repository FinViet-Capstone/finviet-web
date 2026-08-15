export interface AdminAccount {
  adminId: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface CreateAdminInput {
  username: string;
  email: string;
  password: string;
}

export interface AdminChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
