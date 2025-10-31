import { Types } from 'mongoose';

export type TImage = {
  public_id: string;
  url: string;
};

export type TVideo = {
  public_id: string;
  url: string;
};

export type TReview = {
  user: Types.ObjectId;
  rating: number;
  comment: string;
  commentReplies?: TReview[];
};

export type TProduct = {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  category: Types.ObjectId;
  price: number;
  discountPrice?: number;
  discountEndDate?: Date;
  images: TImage[];
  video: TVideo;
  seller: Types.ObjectId;
  stock: number;
  reviews?: TReview[];
  ratings?: number;
  isDeleted: boolean;
};
