type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export default async function request<T = unknown>(
  endpoint: string,
  method: HttpMethod,
  data?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`http://localhost:3000${endpoint}`, options);

  const contentType = response.headers.get('content-type');

  let parsed: unknown = null;

  if (contentType?.includes('application/json')) {
    parsed = await response.json();
  } else {
    parsed = await response.text();
  }

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText} - ${JSON.stringify(parsed)}`
    );
  }

  return parsed as T;
}
