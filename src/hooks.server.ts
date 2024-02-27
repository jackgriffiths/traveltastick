import type { Handle } from "@sveltejs/kit";
import { getSession } from "$lib/server/sessions";

export const handle: Handle = async ({ event, resolve }) => {
  // If required, redirect HTTP requests to HTTPS.

  // Heroku sets this header when forwarding requests from the load balancer.
  const forwardedProtocol = event.request.headers.get("x-forwarded-proto");

  // In local dev, requests are sent using HTTP.
  // In Heroku, requests should be forced to use HTTPS.
  if (forwardedProtocol && forwardedProtocol !== "https") {

    // Rewrite the URL but with HTTPS instead.
    const requestUrl = new URL(event.request.url);
    const httpsUrl = `https://${requestUrl.host}${requestUrl.pathname}${requestUrl.search}`;

    // Return a 301 Moved Permanently
    return Response.redirect(httpsUrl, 301);
  }

  // Load the session details and pass the request on to SvelteKit for it to resolve.
  event.locals.session = await getSession(event.cookies);
  return resolve(event);
}