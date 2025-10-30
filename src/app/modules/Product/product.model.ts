import { model, Schema } from 'mongoose';
import { TImage, TProduct, TReview, TVideo } from './product.interface';

const imageSchema = new Schema<TImage>({
  url: { type: String, required: true },
});

const videoSchema = new Schema<TVideo>({
  url: { type: String, required: true },
});

const reviewSchema = new Schema<TReview>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
});

reviewSchema.add({ commentReplies: [reviewSchema] });

// Main product schema
const productSchema = new Schema<TProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    discountEndDate: { type: Date },
    images: { type: [imageSchema] },
    video: { type: videoSchema, required: true },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stock: { type: Number, required: true, default: 0 },
    reviews: { type: [reviewSchema] },
    ratings: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export const ProductModel = model<TProduct>('Product', productSchema);
