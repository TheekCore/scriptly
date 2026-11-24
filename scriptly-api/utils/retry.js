/**
 * Retries an asynchronous operation up to maxRetries times with custom delays.
 * 
 * @param {Function} fn - Async function to execute
 * @param {Array<number>} delays - Array of delay durations in milliseconds for each retry (e.g. [1500, 3000])
 * @returns {Promise<any>} - The result of fn()
 */
export async function withRetry(fn, delays = [1500, 3000]) {
  let lastError;

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (attempt < delays.length) {
        const waitTime = delays[attempt];
        console.warn(`[Retry Helper] Attempt ${attempt + 1} failed (${err.message}). Retrying in ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}
