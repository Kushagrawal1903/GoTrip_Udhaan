const Groq = require('groq-sdk');

/**
 * Groq Provider — Model routing and API wrapper
 * Routes requests to appropriate Groq models based on task type
 */

// Model configuration
const MODELS = {
    CLASSIFIER: 'llama-3.1-8b-instant',        // Fast intent classification
    PRIMARY: 'llama-3.3-70b-versatile',          // Primary patch generation
    COMPLEX: 'deepseek-r1-distill-llama-70b',    // Complex modifications
};

const MODEL_CONFIGS = {
    [MODELS.CLASSIFIER]: {
        temperature: 0.1,    // Low temp for deterministic classification
        max_tokens: 512,
        timeout: 10000,
    },
    [MODELS.PRIMARY]: {
        temperature: 0.6,
        max_tokens: 4096,
        timeout: 30000,
    },
    [MODELS.COMPLEX]: {
        temperature: 0.5,
        max_tokens: 6144,
        timeout: 45000,
    },
};

// Fallback chain: if primary fails, try these in order
const FALLBACK_CHAIN = [MODELS.PRIMARY, MODELS.CLASSIFIER];

let groqClient = null;

/**
 * Get or create the Groq client singleton
 */
function getClient() {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY is not set in environment variables.');
        }
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
}

/**
 * Send a chat completion request to Groq
 * @param {string} model - Model identifier
 * @param {Array} messages - Chat messages array
 * @param {Object} overrides - Optional config overrides
 * @returns {string} Response text
 */
async function chatCompletion(model, messages, overrides = {}) {
    const client = getClient();
    const config = MODEL_CONFIGS[model] || MODEL_CONFIGS[MODELS.PRIMARY];

    const response = await client.chat.completions.create({
        model,
        messages,
        temperature: overrides.temperature ?? config.temperature,
        max_tokens: overrides.max_tokens ?? config.max_tokens,
        response_format: overrides.response_format || undefined,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error('Empty response from Groq model.');
    }

    return content;
}

/**
 * Classify intent using lightweight model
 * @param {Array} messages - System + user messages
 * @returns {string} Raw model response
 */
async function classifyIntent(messages) {
    return chatCompletion(MODELS.CLASSIFIER, messages, {
        response_format: { type: 'json_object' },
    });
}

/**
 * Generate a patch using primary model
 * @param {Array} messages - System + user messages
 * @returns {string} Raw model response
 */
async function generatePatch(messages) {
    return chatCompletion(MODELS.PRIMARY, messages, {
        response_format: { type: 'json_object' },
    });
}

/**
 * Generate complex patch using deep reasoning model
 * @param {Array} messages - System + user messages
 * @returns {string} Raw model response  
 */
async function generateComplexPatch(messages) {
    return chatCompletion(MODELS.COMPLEX, messages);
}

module.exports = {
    MODELS,
    MODEL_CONFIGS,
    FALLBACK_CHAIN,
    chatCompletion,
    classifyIntent,
    generatePatch,
    generateComplexPatch,
};
