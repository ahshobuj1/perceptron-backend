import config from '../config';
import { UserRole } from '../modules/Auth/auth.interface';
import { UserModel } from '../modules/Auth/auth.model';

const superUser = {
  email: config.super_admin_email,
  password: config.super_admin_pass,
  role: UserRole.super_admin,
  status: 'in-progress',
  isDeleted: false,
};

const seedSuperAdmin = async () => {
  const isSuperAdminExist = await UserModel.findOne({
    role: UserRole.super_admin,
  });

  if (!isSuperAdminExist) {
    await UserModel.create(superUser);
  }
};

export default seedSuperAdmin;
