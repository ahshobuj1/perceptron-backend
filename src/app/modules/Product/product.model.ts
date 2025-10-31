import { model, Schema } from 'mongoose';
import { TImage, TProduct, TReview, TVideo } from './product.interface'; // Import new types

const imageSchema = new Schema<TImage>({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
});

const videoSchema = new Schema<TVideo>({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
});

const reviewSchema = new Schema<TReview>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
});

reviewSchema.add({ commentReplies: [reviewSchema] });

const productSchema = new Schema<TProduct>(
  {
    name: { type: String, required: true },
    images: { type: [imageSchema], required: true },
    video: { type: videoSchema, required: true },
    discountPrice: { type: Number },
    discountEndDate: { type: Date },
    description: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    price: { type: Number, required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User' },
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
