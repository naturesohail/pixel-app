
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: "dtc1nqk9g",
  api_key: "988391113487354",
  api_secret: "o8IkkQeCn8vFEmG2gI6saI1R6mo",
});


 export const uploadToCloudinary = async (file, folder) => {
  if (!file) return ""; 

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

