import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import config from '../config';

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export const uploadToCloudinary = (
  // eslint-disable-next-line no-undef
  buffer: Buffer,
  public_id: string,
  resource_type: 'image' | 'video' = 'image',
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: public_id,
        resource_type: resource_type,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result as UploadApiResponse);
      },
    );
    // Write the buffer to the upload stream
    uploadStream.end(buffer);
  });
};
