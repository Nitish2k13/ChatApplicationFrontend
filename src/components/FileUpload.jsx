import React from 'react';

export default function FileUpload({
  file,
  setFile,
  handleUpload,
  uploadProgress,
}) {
  return (
    <div className="mt-2 flex flex-col w-full">
      <div className="flex items-center space-x-2">
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={handleUpload}
          disabled={!file}
        >
          Upload
        </button>
      </div>
      {uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded h-2 mt-2">
          <div
            className="bg-blue-600 h-2 rounded"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
