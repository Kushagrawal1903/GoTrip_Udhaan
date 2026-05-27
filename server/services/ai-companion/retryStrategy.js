/**
 * Retry Strategy — Production-grade reliability layer
 * Exponential backoff, model fallback chain, timeout protection
 */

const BACKOFF_DELAYS = [1000, 2000, 5000]; // 1s, 2s, 5s

/**
 * Execute a function with exponential backoff retry
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Max retry attempts (default: 3)
 * @param {number} options.timeoutMs - Timeout per attempt in ms (default: 30000)
 * @param {Function} options.onRetry - Callback on retry (attempt, error)
 * @returns {*} Function result
 */
async function withRetry(fn, options = {}) {
    const {
        maxRetries = 3,
        timeoutMs = 30000,
        onRetry = null,
    } = options;

    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const result = await withTimeout(fn(), timeoutMs);
            return result;
        } catch (error) {
            lastError = error;

            // Don't retry on auth errors or invalid API keys
            if (isNonRetryableError(error)) {
                throw error;
            }

            if (attempt < maxRetries - 1) {
                const delay = BACKOFF_DELAYS[attempt] || BACKOFF_DELAYS[BACKOFF_DELAYS.length - 1];
                console.warn(
                    `[AI-Companion] Attempt ${attempt + 1}/${maxRetries} failed: ${error.message}. Retrying in ${delay}ms...`
                );

                if (onRetry) onRetry(attempt + 1, error);
                await sleep(delay);
            }
        }
    }

    throw lastError;
}

/**
 * Execute with model fallback chain
 * If the primary function fails, try fallback models
 * @param {Array<Function>} fns - Array of async functions to try in order
 * @param {Object} options - Options
 * @returns {*} First successful result
 */
async function withFallbackChain(fns, options = {}) {
    const { timeoutMs = 30000 } = options;
    let lastError;

    for (let i = 0; i < fns.length; i++) {
        try {
            const result = await withTimeout(fns[i](), timeoutMs);
            if (i > 0) {
                console.log(`[AI-Companion] Fallback model ${i} succeeded.`);
            }
            return result;
        } catch (error) {
            lastError = error;
            console.warn(
                `[AI-Companion] Model ${i} failed: ${error.message}. ${i < fns.length - 1 ? 'Trying fallback...' : 'No more fallbacks.'}`
            );
        }
    }

    throw lastError;
}

/**
 * Wrap a promise with a timeout
 * @param {Promise} promise - Promise to wrap
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise} Resolved or rejected promise
 */
function withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Request timed out after ${ms}ms`));
        }, ms);

        promise
            .then((result) => {
                clearTimeout(timer);
                resolve(result);
            })
            .catch((error) => {
                clearTimeout(timer);
                reject(error);
            });
    });
}

/**
 * Check if an error should NOT be retried
 */
function isNonRetryableError(error) {
    const message = (error.message || '').toLowerCase();
    return (
        message.includes('api_key') ||
        message.includes('authentication') ||
        message.includes('unauthorized') ||
        message.includes('forbidden') ||
        error.status === 401 ||
        error.status === 403
    );
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a user-friendly error message from a raw error
 * Never expose raw errors, stack traces, or provider details
 */
function toFriendlyError(error) {
    const message = (error.message || '').toLowerCase();

    if (message.includes('timeout')) {
        return 'Taking longer than expected. Please try again.';
    }
    if (message.includes('rate') || message.includes('limit')) {
        return 'Too many requests. Please wait a moment and try again.';
    }
    if (message.includes('api_key') || message.includes('auth')) {
        return 'AI service configuration issue. Please contact support.';
    }

    return 'Still refining your trip… Please try again in a moment.';
}

module.exports = {
    withRetry,
    withFallbackChain,
    withTimeout,
    toFriendlyError,
};
