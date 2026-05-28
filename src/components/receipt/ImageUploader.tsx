"use client";

import { useState, useRef } from "react";

interface ImageUploaderProps {
  onImageSelected: (file: File, preview: string) => void;
}

export function ImageUploader({ onImageSelected }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreview(url);
      onImageSelected(file, url);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        dragOver
          ? "border-primary bg-primary-light"
          : "border-gray-300 hover:border-primary"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview ? (
        <div className="space-y-3">
          <img
            src={preview}
            alt="小票预览"
            className="max-h-48 mx-auto rounded-lg object-contain"
          />
          <p className="text-sm text-gray-500">点击可重新选择图片</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-4xl">📷</div>
          <p className="text-gray-600 font-medium">点击上传或拖拽小票图片</p>
          <p className="text-gray-400 text-sm">支持 JPG、PNG 等图片格式</p>
        </div>
      )}
    </div>
  );
}
