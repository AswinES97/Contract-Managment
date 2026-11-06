const getEnvVar = (key: string, fallback: string = ""): string => {
  return import.meta.env[key] || fallback;
};

const getApiBaseUrl = (): string => {
  return getEnvVar("VITE_API_BASE_URL", "http://localhost:3000");
};

const getApiUrl = (): string => {
  return `${getApiBaseUrl()}/api`;
};

export { getApiBaseUrl, getApiUrl };
