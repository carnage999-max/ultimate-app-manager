'use client';

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { UploadCloud, File, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FileUploader({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploaded(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      // 1. Get presigned URL
      const { data } = await axios.post('/api/files/upload-url', {
        filename: file.name,
        contentType: file.type,
      });

      const { uploadUrl, fileKey } = data;

      // 2. PUT file to S3
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      setUploaded(true);
      // Construct public URL (assuming public bucket or via CLoudFront, otherwise we need a GET presigned url)
      const publicUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || 'apartment-manager-uploads'}.s3.amazonaws.com/${fileKey}`;
      onUploadComplete(publicUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {!file ? (
        <label className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors border border-slate-300">
          <UploadCloud className="h-4 w-4" />
          <span className="text-sm font-medium">Select File</span>
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border">
           <File className="h-4 w-4 text-blue-500" />
           <span className="text-sm max-w-[150px] truncate">{file.name}</span>
           <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 ml-2">
             <span className="text-xs">✕</span>
           </button>
        </div>
      )}

      {file && !uploaded && (
        <Button size="sm" onClick={handleUpload} disabled={uploading}>
          {uploading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <UploadCloud className="h-3 w-3 mr-2" />}
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      )}

      {uploaded && (
         <span className="text-green-600 text-sm flex items-center gap-1">
            <Check className="h-4 w-4" />
            Uploaded
         </span>
      )}
    </div>
  );
}
