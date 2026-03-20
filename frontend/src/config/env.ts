const appEnv =
  process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? "development";

const isProduction = appEnv === "production";

const resolveUrl = (
  explicitValue: string | undefined,
  productionValue: string,
  developmentValue: string
) => explicitValue ?? (isProduction ? productionValue : developmentValue);

const resolveValue = (
  explicitValue: string | undefined,
  productionValue: string,
  developmentValue: string
) => explicitValue ?? (isProduction ? productionValue : developmentValue);

export const publicEnv = {
  appEnv,
  isProduction,
  apiBaseUrl: resolveUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL,
    "https://smart-agriwaste-full.onrender.com/api",
    "http://localhost:5000/api"
  ),
  agriApiUrl: resolveUrl(
    process.env.NEXT_PUBLIC_AGRI_API_URL,
    "https://dataset-api-n94a.onrender.com",
    "http://localhost:8080"
  ),
  socketUrl: resolveUrl(
    process.env.NEXT_PUBLIC_SOCKET_URL,
    "https://smart-agriwaste-full.onrender.com",
    "http://localhost:5000"
  ),
  imagekitPublicKey: resolveValue(
    process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    "public_H1AjdWUA1HD2x8wIcSRh1/TDlZ4=",
    "public_H1AjdWUA1HD2x8wIcSRh1/TDlZ4="
  ),
  imagekitUrlEndpoint: resolveUrl(
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    "https://ik.imagekit.io/glegrwdpvm",
    "https://ik.imagekit.io/glegrwdpvm"
  ),
  imagekitAuthEndpoint: resolveUrl(
    process.env.NEXT_PUBLIC_IMAGEKIT_AUTH_ENDPOINT,
    "https://smart-agriwaste-full.onrender.com/api/imagekit/auth",
    "http://localhost:5000/api/imagekit/auth"
  ),
} as const;
