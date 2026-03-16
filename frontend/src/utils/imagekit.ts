import axios from "axios";

interface ImageKitAuthResponse {
  token: string;
  expire: number;
  signature: string;
}

interface ImageKitUploadResponse {
  url: string;
}

const MAX_UPLOAD_TIME_MS = 15000;
const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

async function compressImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load selected image"));
      img.src = imageUrl;
    });

    const largestSide = Math.max(image.width, image.height);
    const shouldResize =
      largestSide > MAX_IMAGE_DIMENSION || file.size > 1024 * 1024;

    if (!shouldResize) {
      return file;
    }

    const scale = Math.min(1, MAX_IMAGE_DIMENSION / largestSide);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext("2d");

    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });

    if (!blob) {
      return file;
    }

    const outputName = file.name.replace(/\.[^.]+$/, "") || "community-post";

    return new File([blob], `${outputName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const optimizedFile = await compressImageIfNeeded(file);

  const authRes = await axios.get<ImageKitAuthResponse>(
    process.env.NEXT_PUBLIC_IMAGEKIT_AUTH_ENDPOINT!,
    {
      withCredentials: true,
      timeout: MAX_UPLOAD_TIME_MS,
    }
  );

  const { token, expire, signature } = authRes.data;

  const formData = new FormData();
  formData.append("file", optimizedFile);
  formData.append("fileName", optimizedFile.name);
  formData.append("folder", folder);
  formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
  formData.append("token", token);
  formData.append("expire", expire.toString());
  formData.append("signature", signature);

  const uploadRes = await axios.post<ImageKitUploadResponse>(
    "https://upload.imagekit.io/api/v1/files/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: MAX_UPLOAD_TIME_MS,
    }
  );

  return uploadRes.data.url;
}
