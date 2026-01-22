import axios from "axios";

interface ImageKitAuthResponse {
  token: string;
  expire: number;
  signature: string;
}

interface ImageKitUploadResponse {
  url: string;
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const authRes = await axios.get<ImageKitAuthResponse>(
    process.env.NEXT_PUBLIC_IMAGEKIT_AUTH_ENDPOINT!,
    { withCredentials: true }
  );

  const { token, expire, signature } = authRes.data;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
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
    }
  );

  return uploadRes.data.url;
}
