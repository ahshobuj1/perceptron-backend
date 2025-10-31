import { model, Schema } from 'mongoose';
import { TCategory, TCategoryImage } from './category.interface';

const imageSchema = new Schema<TCategoryImage>({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
});

const categorySchema = new Schema<TCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    image: {
      type: imageSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const CategoryModel = model<TCategory>('Category', categorySchema);
