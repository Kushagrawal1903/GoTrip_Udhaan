/**
 * WhatsApp Cloud API Route — DEPRECATED
 *
 * This route previously handled POST /api/whatsapp/send-trip, which:
 * 1. Accepted a phone number + tripId
 * 2. Fetched trip data from MongoDB
 * 3. Sent a template message via Meta WhatsApp Business Cloud API
 *
 * REPLACED BY: Client-side WhatsApp Click-to-Chat (wa.me links).
 * The frontend now generates a pre-filled message and opens
 * https://wa.me/?text=<message> directly — no backend needed.
 *
 * This file is retained for reference only. It is no longer mounted in server.js.
 *
 * @deprecated Since May 2026 — Click-to-Chat replaced Cloud API flow.
 */

const express = require('express');
const router = express.Router();

// No active routes — this module is deprecated.

module.exports = router;
