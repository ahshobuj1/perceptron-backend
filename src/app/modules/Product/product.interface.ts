import { Types } from 'mongoose';

export type TImage = {
  url: string;
};

export type TVideo = {
  url: string;
};

export type TReview = {
  user: Types.ObjectId;
  rating: number;
  comment: string;
  commentReplies?: TReview[];
};

// Main interface for the Product
export type TProduct = {
  name: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  discountEndDate?: Date;
  images?: TImage[];
  video?: TVideo;
  seller: Types.ObjectId;
  stock: number;
  reviews?: TReview[];
  ratings?: number;
  isDeleted: boolean;
};
