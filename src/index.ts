const request = {
  async fetch(
    request: Request,
    env: { PAYMENT_PROCESSOR_URL: string },
    ctx: ExecutionContext
  ): Promise<Response> {
    const originalUrl = new URL(request.url);
    const hasPath =
      Boolean(originalUrl.pathname) &&
      /^(?!\/(_next|_static|api)(\/|$))(?!.*\.[^.]+$).*/.test(
        originalUrl.pathname
      );
    if (!hasPath) {
      return fetch(`${env.PAYMENT_PROCESSOR_URL}${originalUrl.pathname}`);
    }

    const paymentPath = request.url.replace(/^.*\/payment\/(.*)/, "$1");

    // Create a new request with the modified URL
    const newUrl = `${env.PAYMENT_PROCESSOR_URL}/payment/${paymentPath}`;
    const newRequest = new Request(newUrl, {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.body,
    });

    console.log("DATA", {
      PAYMENT_PROCESSOR_URL: env.PAYMENT_PROCESSOR_URL,
      reqUrl: request.url,
      newUrl,
      paymentPath,
      p: originalUrl.pathname,
    });

    // Fetch the new request and return the response
    const response = await fetch(newRequest);
    // detect if it is redirect
    if (response.ok && response.url !== newRequest.url) {
      return Response.redirect(response.url, 307);
    }
    return response;
  },
};

export default request;
