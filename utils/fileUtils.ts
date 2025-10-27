
import type { FileData } from '../types';

export const readFileAsBase64 = (file: File): Promise<FileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      const previewUrl = URL.createObjectURL(file);
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        base64: base64String,
        previewUrl: previewUrl,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
