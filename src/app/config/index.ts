import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  database_name: process.env.DATABASE_NAME || 'server-template',
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  node_env: process.env.NODE_ENV || 'development',
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  super_admin_pass: process.env.SUPER_ADMIN_PASS,
  redis_url: process.env.REDIS_URL,

  ssl_store_id: process.env.SSL_STORE_ID,
  ssl_store_password: process.env.SSL_STORE_PASSWORD,
  is_live: process.env.NODE_ENV === 'production',

  ssl_success_url: process.env.SSL_SUCCESS_URL,
  ssl_fail_url: process.env.SSL_FAIL_URL,
  ssl_cancel_url: process.env.SSL_CANCEL_URL,
  ssl_ipn_url: process.env.SSL_IPN_URL,
};
