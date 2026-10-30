const CANONICAL = 'srimahabodhi.com';
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if ((url.hostname === CANONICAL && url.protocol !== 'https:') || url.hostname === 'www.' + CANONICAL) {
      url.protocol = 'https:';
      url.hostname = CANONICAL;
      url.port = '';
      return Response.redirect(url.toString(), 301);
    }
    const errorRoute = ['/404', '/404/', '/404.html'].includes(url.pathname);
    if (errorRoute) url.pathname = '/404';
    const response = await env.ASSETS.fetch(errorRoute ? new Request(url, request) : request);
    if (response.status === 404 || errorRoute) {
      const headers = new Headers(response.headers);
      headers.set('X-Robots-Tag', 'noindex');
      return new Response(response.body, { status: 404, headers });
    }
    return response;
  }
};
