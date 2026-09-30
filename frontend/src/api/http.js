// Shared response handling for the fetch-based API modules.

/**
 * Reads the body once as text and tells an empty body (e.g. a 204) apart
 * from an unparseable one (e.g. an HTML page from a proxy). It never throws.
 *
 * @returns {Promise<{ data: unknown, empty: boolean }>} `data` is null when
 * the body is empty or not JSON; `empty` is true only for a blank body.
 */
export const parseBody = async (response) => {
  let text;

  try {
    text = await response.text();
  } catch {
    return { data: null, empty: true };
  }

  if (!text || !text.trim()) {
    return { data: null, empty: true };
  }

  try {
    return { data: JSON.parse(text), empty: false };
  } catch {
    return { data: null, empty: false };
  }
};

/**
 * Returns the parsed JSON body of a successful answer, or throws an Error
 * carrying the HTTP `status`. The message is the server's `message` when
 * there is one, otherwise `fallbackMessage`.
 *
 * A 2xx answer whose body is not JSON is not a valid API answer and throws.
 * Set `allowEmpty` for endpoints that legitimately answer with no body
 * (e.g. DELETE -> 204): an empty 2xx body then resolves to null.
 */
export const readApiBody = async (
  response,
  fallbackMessage,
  { allowEmpty = false } = {},
) => {
  const { data, empty } = await parseBody(response);

  const acceptedEmpty = allowEmpty && empty;

  if (!response.ok || (data === null && !acceptedEmpty)) {
    const error = new Error(data?.message || fallbackMessage);
    error.status = response.status;

    throw error;
  }

  return data;
};
