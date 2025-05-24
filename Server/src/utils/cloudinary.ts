import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: Bun.env.CLOUDINARY_CLOUD_NAME,
  api_key: Bun.env.CLOUDINARY_API_KEY,
  api_secret: Bun.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file: File) => {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
    const uploadResponse = await cloudinary.uploader.upload(dataUri, {
      folder: 'Sac Birthday Pictures',
      resource_type: 'image',
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Image upload failed');
  }
};

export default cloudinary;
