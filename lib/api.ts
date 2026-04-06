import toast from "react-hot-toast";

const BASE_URL = process.env.API_BASE_URL as string;

function isClient() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

async function parseResponsePayload(res: Response) {
  try {
    return await res.clone().json();
  } catch {
    try {
      return await res.clone().text();
    } catch {
      return null;
    }
  }
}

// Main API request function
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  options.credentials = "include";

  if (!(options.body instanceof FormData)) {
    options.headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
  } else {
    const newHeaders = { ...(options.headers || {}) } as Record<string, any>;
    delete newHeaders["Content-Type"];
    options.headers = newHeaders;
  }

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (err: any) {
    const msg = err?.message || "Network error";
    // Don't show toast here - let the calling code handle it
    throw new Error(msg);
  }

  // 401 refresh flow
  if (response.status === 401) {
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (refreshRes.ok) {
        response = await fetch(url, options);
      } else {
        const payload = await parseResponsePayload(refreshRes);
        const payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload);
        if (isClient()) {
          // Only redirect but don't show toast - let component handle
          window.location.href = "/login";
        }
        throw new Error(payloadStr || "Session expired");
      }
    } catch (err: any) {
      const msg = err?.message || "Session refresh failed";
      if (isClient()) {
        window.location.href = "/login";
      }
      throw new Error(msg);
    }
  }

  // Handle non-OK status - don't show toast here, throw error with details
  if (!response.ok) {
    const payload = await parseResponsePayload(response);

    let errorMessage: string;
    
    // Extract error message from different possible response structures
    if (payload && typeof payload === "object") {
      if (payload.message) {
        errorMessage = String(payload.message);
      } else if (payload.error) {
        errorMessage = String(payload.error);
      } else if (payload.errors && Array.isArray(payload.errors)) {
        errorMessage = payload.errors.map((err: any) => err.message || err).join(', ');
      } else {
        errorMessage = JSON.stringify(payload);
      }
    } else if (typeof payload === "string") {
      errorMessage = payload;
    } else {
      errorMessage = `${response.status} ${response.statusText}`;
    }

    // Create a detailed error object that includes the response data
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).responseData = payload;
    
    throw error;
  }

  // Success parsing
  if (response.status === 204 || response.status === 205) return null as unknown as T;
  
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await response.json() as T;
  }
  
  return await response.text() as unknown as T;
}

// Public API request function - no authentication required
export async function publicApiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  // Public requests don't include credentials by default
  options.credentials = "omit";

  if (!(options.body instanceof FormData)) {
    options.headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
  } else {
    const newHeaders = { ...(options.headers || {}) } as Record<string, any>;
    delete newHeaders["Content-Type"];
    options.headers = newHeaders;
  }

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (err: any) {
    const msg = err?.message || "Network error";
    console.error('Public API request failed:', msg);
    throw new Error(msg);
  }

  // Handle non-OK status for public requests
  if (!response.ok) {
    const payload = await parseResponsePayload(response);

    let errorMessage: string;
    
    // Extract error message from different possible response structures
    if (payload && typeof payload === "object") {
      if (payload.message) {
        errorMessage = String(payload.message);
      } else if (payload.error) {
        errorMessage = String(payload.error);
      } else if (payload.errors && Array.isArray(payload.errors)) {
        errorMessage = payload.errors.map((err: any) => err.message || err).join(', ');
      } else {
        errorMessage = JSON.stringify(payload);
      }
    } else if (typeof payload === "string") {
      errorMessage = payload;
    } else {
      errorMessage = `${response.status} ${response.statusText}`;
    }

    // Create a detailed error object that includes the response data
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).responseData = payload;
    
    console.error('Public API error:', errorMessage);
    throw error;
  }

  // Success parsing
  if (response.status === 204 || response.status === 205) return null as unknown as T;
  
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await response.json() as T;
  }
  
  return await response.text() as unknown as T;
}

// Protected API request function - with authentication
export async function protectedApiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // For protected routes, use the main apiRequest which includes auth handling
  return apiRequest<T>(endpoint, options);
}

// Utility function to handle API errors with toast notifications
export function handleApiError(error: any, defaultMessage: string = "Something went wrong") {
  console.error('API Error:', error);
  
  let message = defaultMessage;
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    message = error.message;
  }
  
  // Show toast notification
  if (isClient()) {
    toast.error(message);
  }
  
  return message;
}

// Utility function for successful API responses with toast
export function handleApiSuccess(message: string) {
  if (isClient()) {
    toast.success(message);
  }
}