
export const BACKEND_URL = (
    import.meta.env.VITE_BACKEND_URL 
    // || 'https://smartdesk-7gzx.onrender.com'
).replace(/\/$/, '');

export type ApiResponse<TData = unknown> = {
  data: TData;
  ok: boolean;
  status: number;
};

 async function apiCommonRequest<TData = unknown>(
    path: string,
    init: RequestInit 
): Promise<ApiResponse<TData>> {
    const response = await fetch(`${BACKEND_URL}${path}`, {
        
        ...init,
        credentials: 'include',
        headers: {
            ...(init.headers || {}),
            ...init.body ? { 'Content-Type': 'application/json' } : {},

        }
    });
    const text = await response.text();

    let data: unknown = null;

    try{
        data = text ? JSON.parse(text) : null;
    }catch{
        data = text;
    }

    return {
        data: data as TData,
        ok: response.ok,
        status: response.status,
    };
}

export function apiGet<TData = unknown>(path: string){
    return apiCommonRequest<TData>(path, {method: 'GET',});
}

export function apiPost<TData = unknown>(path: string, body?: unknown){
    return apiCommonRequest<TData>(path, {method: 'POST', body: body ? JSON.stringify(body) : undefined,});
}

export function apiPut<TData = unknown>(path: string, body?: unknown){
    return apiCommonRequest<TData>(path, {method: 'PUT', body: body ? JSON.stringify(body) : undefined,});
}

export function apiDelete<TData = unknown>(path: string, body?: unknown){
    return apiCommonRequest<TData>(path, {method: 'DELETE', body: body ? JSON.stringify(body) : undefined,});
}
