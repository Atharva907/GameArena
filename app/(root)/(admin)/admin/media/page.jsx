"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Images, RefreshCw, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadMedia from "@/components/Application/Admin/UploadMedia";
import {
  AdminEmptyState,
  AdminHeader,
  AdminMetric,
  AdminPage,
  AdminPanel,
  adminGhostButtonClass,
} from "@/components/Application/Admin/AdminUi";
import { apiFetch } from "@/lib/apiClient";
import { showToast } from "@/lib/showToast";

const MediaPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageKitConfigured, setImageKitConfigured] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/media/library", {
          method: "GET",
        });

        const data = await response.json().catch(() => ({}));
        const imageData = (data.resources || []).map((image) => ({
          url: image.url || image.thumbnailUrl,
          fileId: image.fileId,
          filePath: image.filePath || image.name || image.fileId,
        }));

        setImageKitConfigured(data.configured !== false);

        if (response.ok || data.success) {
          setImages(imageData);
          setError(null);
        } else {
          setImages([]);
          setError(data.message || data.error || "Unable to load media library.");
        }
      } catch (fetchError) {
        setImages([]);
        setImageKitConfigured(false);
        setError("Unable to load media library.");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [refreshKey]);

  const handleDeleteImage = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const response = await apiFetch("/media/delete", {
        method: "DELETE",
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      showToast("success", "Media deleted successfully");
      setRefreshKey((key) => key + 1);
    } catch (deleteError) {
      console.error("Error deleting image:", deleteError);
      showToast("error", deleteError.message || "Failed to delete image");
    }
  };

  const handleViewImage = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const metrics = useMemo(
    () => ({
      totalAssets: images.length,
      source: "ImageKit",
      grid: loading ? "Loading" : "Ready",
    }),
    [images.length, loading],
  );

  return (
    <AdminPage className="mx-0 max-w-none">
      <AdminHeader
        eyebrow="Media"
        title="Keep the media library simple and production-ready"
        description="Upload, review, and remove image assets from a cleaner library layout that works well on mobile and desktop."
        chips={["ImageKit", "Uploads", "Asset library"]}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <AdminMetric
          label="Assets"
          value={metrics.totalAssets}
          detail="Images currently available in the library"
          icon={Images}
          accent="from-sky-500/20 via-sky-500/5 to-transparent"
        />
        <AdminMetric
          label="Source"
          value={metrics.source}
          detail="Connected upload and storage provider"
          icon={Upload}
          accent="from-emerald-500/20 via-emerald-500/5 to-transparent"
        />
        <AdminMetric
          label="Library grid"
          value={metrics.grid}
          detail="Responsive asset browsing state"
          icon={Images}
          accent="from-fuchsia-500/20 via-fuchsia-500/5 to-transparent"
        />
      </section>

      <AdminPanel
        title="Upload assets"
        description="Push new storefront or tournament artwork into the shared media library."
      >
        {!imageKitConfigured && (
          <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            ImageKit is not configured. Add the credentials to enable uploads and
            media syncing.
          </div>
        )}

        <UploadMedia
          onUploadSuccess={() => setRefreshKey((key) => key + 1)}
          disabled={!imageKitConfigured}
        />
      </AdminPanel>

      <AdminPanel
        title="Media library"
        description="Review and maintain the image assets available to the admin workspace."
        action={
          <Button
            type="button"
            variant="outline"
            className={adminGhostButtonClass}
            onClick={() => setRefreshKey((key) => key + 1)}
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        }
      >
        {loading ? (
          <div className="py-12 text-sm text-muted-foreground">
            Loading media library...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            Error: {error}
          </div>
        ) : images.length === 0 ? (
          <AdminEmptyState
            title="No assets yet"
            description="Upload the first image to start building a reusable media library for products and tournaments."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {images.map((image, index) => (
              <div
                key={image.fileId || image.filePath || index}
                className="group overflow-hidden rounded-[24px] border border-border/60 bg-muted/20"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={image.url || image.thumbnailUrl}
                    alt={`ImageKit asset ${index + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-end gap-2 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent p-3 transition duration-300 group-hover:translate-y-0">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                      onClick={() => handleViewImage(image.url || image.thumbnailUrl)}
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:text-white"
                      onClick={() => handleDeleteImage(image.fileId)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="line-clamp-1 text-sm font-medium text-foreground">
                    {image.filePath || image.fileId}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Responsive library asset
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>
    </AdminPage>
  );
};

export default MediaPage;
