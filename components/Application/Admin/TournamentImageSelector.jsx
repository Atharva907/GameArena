
'use client';

import { useState } from 'react';

const TournamentImageSelector = ({ value, onChange }) => {
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [cloudinaryImages, setCloudinaryImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);

  const fetchCloudinaryImages = async () => {
    setImageLoading(true);
    try {
      const response = await fetch('/api/cloudinary-images');
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response from API:', errorData);
        const errorMessage = errorData.details || errorData.error || 'Failed to fetch images';
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setCloudinaryImages(data.resources || []);
      setShowImageSelector(true);
    } catch (err) {
      console.error('Error fetching images:', err);
      alert(`Failed to load images from Cloudinary: ${err.message}`);
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
      <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Tournament Image
      </label>

      <div className="flex flex-col space-y-3">
        <div className="flex space-x-2">
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter image URL"
          />
          <button
            type="button"
            onClick={fetchCloudinaryImages}
            disabled={imageLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors duration-200 flex items-center disabled:opacity-50"
          >
            {imageLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Select
              </>
            )}
          </button>
        </div>

        {/* Image Preview */}
        {value && (
          <div className="relative rounded-lg overflow-hidden shadow-md w-48 h-32">
            <img
              src={value}
              alt="Tournament preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Image Selector Modal */}
      {showImageSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select an Image</h2>
              <button
                type="button"
                onClick={() => setShowImageSelector(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {cloudinaryImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cloudinaryImages.map((image) => (
                  <div
                    key={image.public_id}
                    className="relative group cursor-pointer rounded-lg overflow-hidden"
                    onClick={() => selectImage(image.secure_url)}
                  >
                    <img
                      src={image.secure_url}
                      alt={image.public_id}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-200 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">No images found in your Cloudinary account</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentImageSelector;
