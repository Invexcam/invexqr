import { getCurrentUser } from './firebase';

// Enhanced API client that automatically includes Firebase auth tokens
export async function authenticatedApiRequest(method: string, url: string, data?: any) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add Firebase auth token if user is authenticated
  const currentUser = getCurrentUser();
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Failed to get Firebase token:', error);
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include', // Include cookies for Replit auth
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  return response;
}