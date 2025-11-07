"use client";

import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/showToast";
import { CldUploadWidget } from "next-cloudinary";
import { FaPlus } from "react-icons/fa";

const UploadMedia = ({ isMultiple = true, onUploadSuccess }) => {
  const handleOnError = (error) => {
    const message =
      error?.message || error?.statusText || "Unknown Cloudinary upload error";
    showToast("error", message);
  };

  const handleOnSuccess = (result) => {
    showToast("success", "Upload successful!");
  };

  const handleOnQueueEnd = async (results) => {
    const files = results.info.files 
    const uploadedFiles = files.filter(file => file.uploadInfo).map(file => ({
      asset_id: file.uploadInfo.asset_id ,
      public_id: file.uploadInfo.public_id ,
      secure_url: file.uploadInfo.secure_url ,
      path: file.uploadInfo.path ,
      thumbnail_url: file.uploadInfo.thumbnail_url ,
    }))
    
    if(uploadedFiles.length > 0) {
      try {
        const { data: mediaUploadResponse } = await axios.post('api/media/create', uploadedFiles)

        if(!mediaUploadResponse.success){
          throw new Error(mediaUploadResponse.message)
        }

        showToast("success", mediaUploadResponse.message)
        
        // Call the callback to refresh the media library
        if (onUploadSuccess) {
          onUploadSuccess();
        }

      } catch (error) {
        showToast("error", error.message)
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-1">
      
      <CldUploadWidget
        signatureEndpoint="/api/cloudinary-signature"
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPDATE_PRESET}
        onError={handleOnError}
        onUpload={handleOnSuccess}
        onQueuesEnd={handleOnQueueEnd}
        config={{
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        }}
        options={{
          multiple: isMultiple,
          folder: "yt-nextjs-ecommerce",
          sources: ["local", "url", "unsplash", "google_drive"],
          resourceType: "image",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        }}
      >
        {({ open }) => (
          <Button
            onClick={() => open?.()}
            className="flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow"
            style={{ fontSize: "1rem" }}
          >
            <FaPlus className="text-lg" />
            <span>Upload Media</span>
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
};

export default UploadMedia;
