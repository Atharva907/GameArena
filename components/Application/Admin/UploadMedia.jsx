"use client";

import axios from "axios";
import { useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { adminPrimaryButtonClass } from "@/components/Application/Admin/AdminUi";
import { apiFetch, apiUrl, axiosWithCredentials } from "@/lib/apiClient";
import { showToast } from "@/lib/showToast";

const UploadMedia = ({ isMultiple = true, onUploadSuccess, disabled = false }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiFetch("/media/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || "Upload failed");
    }

    return data.data;
  };

  const handleFiles = async (event) => {
    if (disabled) {
      showToast(
        "error",
        "ImageKit is not configured. Add credentials before uploading media.",
      );
      event.target.value = "";
      return;
    }

    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const uploadedFiles = await Promise.all(files.map(uploadFile));
      const mediaPayload = uploadedFiles.map((file) => ({
        fileId: file.fileId,
        filePath: file.filePath,
        url: file.url || file.path,
        thumbnailUrl: file.thumbnailUrl || file.url || file.path,
        fileType: file.fileType,
        mimeType: file.mimeType,
        size: file.size,
        width: file.width,
        height: file.height,
      }));

      const { data: mediaUploadResponse } = await axios.post(
        apiUrl("/media/create"),
        mediaPayload,
        axiosWithCredentials,
      );

      if (!mediaUploadResponse.success) {
        throw new Error(mediaUploadResponse.message);
      }

      showToast("success", mediaUploadResponse.message);

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error.message;
      showToast("error", message || "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="flex flex-col items-start justify-center gap-3 py-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={isMultiple}
        className="hidden"
        onChange={handleFiles}
      />
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={uploading || disabled}
        className={`${adminPrimaryButtonClass} h-11 gap-2 px-5 text-sm font-medium shadow-none`}
      >
        <FaPlus className="text-sm" />
        <span>{disabled ? "ImageKit not configured" : uploading ? "Uploading..." : "Upload Media"}</span>
      </Button>

      <p className="text-sm text-muted-foreground">
        {disabled
          ? "Set the ImageKit credentials in your environment to enable uploads."
          : "Upload polished storefront and tournament assets in one place."}
      </p>
    </div>
  );
};

export default UploadMedia;
