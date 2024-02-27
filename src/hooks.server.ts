import type { Handle } from "@sveltejs/kit";
import { getSession } from "$lib/server/sessions";

export const handle: Handle = async ({ event, resolve }) => {
  // Heroku sets this header when forwarding requests from the load balancer.
  const forwardedProtocol = event.request.headers.get("x-forwarded-proto");

  if (forwardedProtocol && forwardedProtocol !== "https") {
    // Before adding the permanent redirect, log the expected HTTPS url.
    const requestUrl = new URL(event.request.url);
    const httpsUrl = `https://${requestUrl.host}${requestUrl.pathname}${requestUrl.search}${requestUrl.hash}`;
    console.log("HTTP to HTTPS: " + httpsUrl);
  }

  event.locals.session = await getSession(event.cookies);
  return resolve(event);
}