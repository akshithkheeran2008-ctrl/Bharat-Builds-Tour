/**
 * AquaGen AWS Lambda Helper: Standard HTTP Response Formatter
 * Configures headers, CORS, and status codes.
 */

export function buildResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PATCH,PUT,DELETE',
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

export function errorResponse(statusCode, message, errors = []) {
  return buildResponse(statusCode, {
    success: false,
    error: message,
    errors,
    timestamp: new Date().toISOString()
  });
}
