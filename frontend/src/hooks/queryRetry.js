const AUTH_STATUSES = [401, 403];
const MAX_RETRIES = 1;

/**
 * `retry` option for the admin queries. The default client retries 3 times
 * with backoff (~7 s of Loader) even for 401/403, which a retry can never fix.
 *
 * `error` is the untouched axios error (api.js only clears the token on 401
 * and re-rejects), so the status lives in `error.response.status`.
 * `failureCount` is 0 on the first failure.
 */
export const shouldRetryAdminQuery = (failureCount, error) => {
  if (AUTH_STATUSES.includes(error?.response?.status)) {
    return false;
  }

  return failureCount < MAX_RETRIES;
};
