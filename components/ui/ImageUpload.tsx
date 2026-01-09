'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove?: () => void;
    bucket: string;
    label?: string;
    className?: string;
}

export default function ImageUpload({
    value,
    onChange,
    onRemove,
    bucket,
    label,
    className,
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB');
                return;
            }

            setError(null);
            setIsUploading(true);

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('bucket', bucket);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Upload failed');
                }

                onChange(data.url);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Upload failed');
            } finally {
                setIsUploading(false);
            }
        },
        [bucket, onChange]
    );

    return (
        <div className={cn('w-full', className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}

            {value ? (
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                        src={value}
                        alt="Uploaded image"
                        fill
                        className="object-cover"
                    />
                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
                            aria-label="Remove image"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            ) : (
                <label
                    className={cn(
                        'flex flex-col items-center justify-center aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors',
                        isUploading && 'pointer-events-none opacity-50'
                    )}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="sr-only"
                        disabled={isUploading}
                    />
                    {isUploading ? (
                        <Loader2 size={32} className="text-gray-400 animate-spin" />
                    ) : (
                        <>
                            <Upload size={32} className="text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Click to upload</span>
                            <span className="text-xs text-gray-400 mt-1">Max 5MB</span>
                        </>
                    )}
                </label>
            )}

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
}
