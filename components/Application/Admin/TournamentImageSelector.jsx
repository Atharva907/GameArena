"use client";

import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiClient";
import { showToast } from "@/lib/showToast";
import {
  adminFieldClass,
  adminGhostButtonClass,
  adminPrimaryButtonClass,
} from "@/components/Application/Admin/AdminUi";

const TournamentImageSelector = ({ value, onChange }) => {
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [libraryImages, setLibraryImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);

  const fetchLibraryImages = async () => {
    setImageLoading(true);

    try {
      const response = await apiFetch("/media/library");

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.details || errorData.error || "Failed to fetch images";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setLibraryImages(data.resources || []);
      setShowImageSelector(true);
    } catch (error) {
      console.error("Error fetching images:", error);
      showToast("error", `Failed to load images: ${error.message}`);
    } finally {
      setImageLoading(false);
    }
  };

  const selectImage = (imageUrl) => {
    onChange(imageUrl);
    setShowImageSelector(false);
  };

  return (
    <div className="space-y-2">
      <label htmlFor="imageUrl" className="text-sm font-medium text-foreground">
        Tournament Image
      </label>
      <p className="text-sm text-muted-foreground">
        Paste a direct image URL or pick an existing asset from ImageKit.
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={value || ""}
            onChange={(event) => onChange(event.target.value)}
            className={`w-full ${adminFieldClass}`}
            placeholder="Enter image URL"
          />
          <Button
            type="button"
            onClick={fetchLibraryImages}
            disabled={imageLoading}
            className={`${adminPrimaryButtonClass} h-11 gap-2 px-5`}
          >
            {imageLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ImagePlus className="size-4" />
                Open Library
              </>
            )}
          </Button>
        </div>

        {value && (
          <div className="overflow-hidden rounded-[24px] border border-border/60 bg-muted/20">
            <div className="relative aspect-[16/9] w-full max-w-xl">
              <img
                src={value}
                alt="Tournament preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-3 top-3 rounded-full border border-white/15 bg-slate-950/70 p-2 text-white backdrop-blur transition hover:bg-slate-950/90"
                aria-label="Remove image"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showImageSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-border/60 bg-background shadow-[0_28px_100px_-50px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Select tournament artwork</h2>
                <p className="text-sm text-muted-foreground">
                  Choose an existing asset instead of pasting the URL manually.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImageSelector(false)}
                className={`${adminGhostButtonClass} rounded-full`}
              >
                Close
              </Button>
            </div>

            {libraryImages.length > 0 ? (
              <div className="grid max-h-[70vh] grid-cols-2 gap-4 overflow-y-auto p-5 sm:grid-cols-3 lg:grid-cols-4 sm:p-6">
                {libraryImages.map((image) => (
                  <button
                    key={image.fileId}
                    type="button"
                    className="group overflow-hidden rounded-[22px] border border-border/60 bg-muted/20 text-left transition hover:-translate-y-0.5 hover:border-foreground/15 hover:bg-muted/35"
                    onClick={() => selectImage(image.url || image.thumbnailUrl)}
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={image.url || image.thumbnailUrl}
                        alt={image.filePath || image.fileId}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="px-4 py-3">
                      <p className="line-clamp-1 text-sm font-medium text-foreground">
                        {image.filePath || image.fileId}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Click to use this image
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-6 py-12 text-center text-sm text-muted-foreground">
                No images found in the ImageKit library.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentImageSelector;
