import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

type SuccessResponse<T> = {
	success: true;
	data: T;
};

type ErrorResponse = {
	success: false;
	error: {
		code: string;
		message: string;
	};
};

function success<T>(c: Context, data: T, status: ContentfulStatusCode = 200) {
	const response: SuccessResponse<T> = {
		success: true,
		data,
	};

	return c.json(response, status);
}

function error(
	c: Context,
	status: ContentfulStatusCode,
	code: string,
	message: string,
) {
	const response: ErrorResponse = {
		success: false,
		error: {
			code,
			message,
		},
	};

	return c.json(response, status);
}

export function ok<T>(c: Context, data: T) {
	return success(c, data, 200);
}

export function created<T>(c: Context, data: T) {
	return success(c, data, 201);
}

export function noContent(c: Context) {
	return c.body(null, 204);
}

export function badRequest(c: Context, message = "Bad request") {
	return error(c, 400, "BAD_REQUEST", message);
}

export function unauthorized(c: Context, message = "Unauthorized") {
	c.header("WWW-Authenticate", 'Bearer realm="secure-area"');
	return error(c, 401, "UNAUTHORIZED", message);
}

export function forbidden(c: Context, message = "Forbidden") {
	return error(c, 403, "FORBIDDEN", message);
}

export function notFound(c: Context, message = "Not found") {
	return error(c, 404, "NOT_FOUND", message);
}

export function methodNotAllowed(c: Context, message = "Method not allowed") {
	return error(c, 405, "METHOD_NOT_ALLOWED", message);
}

export function conflict(c: Context, message = "Conflict") {
	return error(c, 409, "CONFLICT", message);
}

export function unprocessableEntity(
	c: Context,
	message = "Unprocessable entity",
) {
	return error(c, 422, "UNPROCESSABLE_ENTITY", message);
}

export function internalServerError(
	c: Context,
	message = "Internal server error",
) {
	return error(c, 500, "INTERNAL_SERVER_ERROR", message);
}
