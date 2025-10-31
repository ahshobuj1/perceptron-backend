import { Types } from 'mongoose';

export type TCategoryImage = {
  public_id: string;
  url: string;
};

export type TCategory = {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  image: TCategoryImage;
};
