export const onRequest = async (context: any) => {
  const url = new URL(context.request.url);
  const backendBase = "https://webcams-contract-advisors-crowd.trycloudflare.com";
  const targetUrl = `${backendBase}${url.pathname}${url.search}`;
  
  // Forward request with headers and body
  const requestInit: RequestInit = {
    method: context.request.method,
    headers: context.request.headers,
    redirect: "follow",
  };

  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    requestInit.body = context.request.body;
  }

  return await fetch(targetUrl, requestInit);
};
