import { model, Schema } from 'mongoose';
import { TUser } from './auth.interface';
import bcrypt from 'bcrypt';
import config from '../../config';
import { TImage } from '../Product/product.interface';

const imageSchema = new Schema<TImage>({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
});

const userSchema = new Schema<TUser>(
  {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String, select: 0 },
    avatar: { type: String },
    phone: { type: String },
    address: { type: String },
    businessName: { type: String },
    businessLogo: { type: imageSchema },
    role: {
      type: String,
      enum: ['admin', 'super_admin', 'seller', 'buyer'],
      default: 'buyer',
    },
    status: {
      type: String,
      enum: ['in-progress', 'blocked'],
      default: 'in-progress',
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// create pre middlewares before save data
userSchema.pre<TUser>('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  if (user.password) {
    user.password = await bcrypt.hash(
      user.password!,
      Number(config.bcrypt_salt_rounds),
    );

    next();
  }

  next();
});

// create post middlewares after save data
userSchema.post<TUser>('save', function (doc, next) {
  doc.password = '';
  next();
});

export const UserModel = model<TUser>('User', userSchema);
