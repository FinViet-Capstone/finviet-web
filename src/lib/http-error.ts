// Carries a real HTTP status code through the service layer to jsonError() in
// src/lib/api-response.ts, instead of every thrown error being collapsed to a generic 400.
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
