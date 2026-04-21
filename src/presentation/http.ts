export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export function unauthorized(): Response {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Bearer realm="secure-area"',
    },
  });
}

export function badRequest(message: string): Response {
  return json({ error: message }, 400);
}

export function notFound(message = "Not found"): Response {
  return json({ error: message }, 404);
}

export function conflict(message: string): Response {
  return json({ error: message }, 409);
}

export function methodNotAllowed(): Response {
  return json({ error: "Method not allowed" }, 405);
}

export function internalServerError(): Response {
  return json({ error: "Internal server error" }, 500);
}