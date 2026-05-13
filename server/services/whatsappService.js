const axios = require('axios');

/**
 * WhatsApp Cloud API Service
 * Uses Meta's official WhatsApp Business Cloud API to send template messages.
 * All credentials are loaded from environment variables — never hardcoded.
 */

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v23.0';
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || 'trip_ready';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

/**
 * Validate that all required WhatsApp env variables are configured.
 * @returns {{ valid: boolean, missing: string[] }}
 */
function validateConfig() {
    const missing = [];
    if (!WHATSAPP_TOKEN) missing.push('WHATSAPP_TOKEN');
    if (!PHONE_NUMBER_ID) missing.push('PHONE_NUMBER_ID');
    return { valid: missing.length === 0, missing };
}

/**
 * Sanitize and normalize a phone number for WhatsApp API.
 * Strips spaces, dashes, and leading '+'. Prepends '91' if a 10-digit Indian number.
 * @param {string} raw - The raw phone number input
 * @returns {string} Cleaned phone number (e.g. '919876543210')
 */
function sanitizePhoneNumber(raw) {
    if (!raw || typeof raw !== 'string') return '';

    // Strip everything except digits
    let cleaned = raw.replace(/[^0-9]/g, '');

    // If user entered a 10-digit number, assume India (+91)
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }

    return cleaned;
}

/**
 * Validate a sanitized phone number.
 * Must be between 10–15 digits after sanitization.
 * @param {string} phone - Sanitized phone number
 * @returns {boolean}
 */
function isValidPhoneNumber(phone) {
    return /^\d{10,15}$/.test(phone);
}

/**
 * Send a WhatsApp template message via Meta Cloud API.
 *
 * @param {Object} params
 * @param {string} params.phoneNumber - Sanitized phone number (e.g. '919876543210')
 * @param {string} params.userName    - User's display name
 * @param {string} params.destination - Trip destination
 * @param {string} params.duration    - Trip duration (e.g. '5 Days')
 * @param {string} params.budget      - Trip budget tier or display string
 * @param {string} params.tripUrl     - Full URL to the trip details page
 * @param {number} [retryCount=0]     - Internal retry counter
 * @returns {Promise<Object>} Meta API response data
 */
async function sendTripWhatsApp({ phoneNumber, userName, destination, duration, budget, tripUrl }, retryCount = 0) {
    // Validate config
    const config = validateConfig();
    if (!config.valid) {
        const err = new Error(`WhatsApp service misconfigured. Missing: ${config.missing.join(', ')}`);
        err.statusCode = 500;
        throw err;
    }

    // Validate phone number
    if (!isValidPhoneNumber(phoneNumber)) {
        const err = new Error('Invalid phone number format. Please provide a valid WhatsApp number.');
        err.statusCode = 400;
        throw err;
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

    const payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
            name: TEMPLATE_NAME,
            language: { code: 'en' },
            components: [
                {
                    type: 'body',
                    parameters: [
                        { type: 'text', text: userName || 'Traveler' },
                        { type: 'text', text: destination || 'your destination' },
                        { type: 'text', text: String(duration || 'N/A') },
                        { type: 'text', text: budget || 'N/A' },
                        { type: 'text', text: tripUrl || '' },
                    ],
                },
            ],
        },
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json',
            },
            timeout: 15000, // 15s timeout
        });

        console.log(`✅ WhatsApp message sent to ${phoneNumber.slice(0, 4)}****`);
        return response.data;
    } catch (error) {
        const status = error.response?.status;
        const metaError = error.response?.data?.error;

        // Log useful error info (never log the token)
        console.error('❌ WhatsApp API Error:', {
            status,
            message: metaError?.message || error.message,
            code: metaError?.code,
            type: metaError?.type,
        });

        // Retry on 5xx / network errors (not on 4xx client errors)
        if (retryCount < MAX_RETRIES && (!status || status >= 500)) {
            console.log(`🔄 Retrying WhatsApp send (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            return sendTripWhatsApp({ phoneNumber, userName, destination, duration, budget, tripUrl }, retryCount + 1);
        }

        // Build user-friendly error message
        let userMessage = 'Failed to send WhatsApp message. Please try again later.';
        if (status === 400) {
            userMessage = metaError?.message || 'Invalid request to WhatsApp API. Please check the phone number.';
        } else if (status === 401) {
            userMessage = 'WhatsApp API authentication failed. Please contact support.';
        } else if (status === 404) {
            userMessage = 'WhatsApp template not found. Please contact support.';
        } else if (metaError?.code === 131026) {
            userMessage = 'This phone number is not registered on WhatsApp.';
        }

        const err = new Error(userMessage);
        err.statusCode = status || 500;
        throw err;
    }
}

module.exports = {
    sendTripWhatsApp,
    sanitizePhoneNumber,
    isValidPhoneNumber,
    validateConfig,
};
