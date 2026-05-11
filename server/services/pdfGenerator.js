/**
 * PDF Generator Service
 * Builds a professional HTML template and renders it to PDF via Puppeteer.
 * Uses @sparticuz/chromium for Vercel serverless compatibility.
 */

/**
 * Build the complete HTML document for PDF rendering
 * @param {Object} trip - Full trip document from MongoDB
 * @returns {string} Complete HTML string
 */
function buildPDFHTML(trip) {
    const { tripData, destination, duration, travelers, travelStyle, budget, packingList } = trip;
    const styleLabel = travelStyle ? travelStyle.charAt(0).toUpperCase() + travelStyle.slice(1) : '';
    const budgetLabel = budget ? budget.charAt(0).toUpperCase() + budget.slice(1) : '';
    const generatedDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    const TIME_ICONS = { Morning: '🌅', Afternoon: '🌤️', Evening: '🌆', Night: '🌙' };

    // Build itinerary days HTML
    let itineraryHTML = '';
    if (tripData?.itinerary && Array.isArray(tripData.itinerary)) {
        for (const day of tripData.itinerary) {
            itineraryHTML += `
            <div class="day-section no-break">
                <div class="day-header">
                    <span class="day-number">Day ${day.day || '?'}</span>
                    <span class="day-title">${day.title || ''}</span>
                </div>
                <div class="activities-grid">
                    ${(day.activities || []).map(act => `
                        <div class="activity-card">
                            <div class="activity-time">
                                <span class="time-icon">${TIME_ICONS[act.time] || '📍'}</span>
                                <span>${act.time || ''}</span>
                            </div>
                            <div class="activity-name">${act.activity || ''}</div>
                            ${act.placeName ? `<div class="activity-place">📍 ${act.placeName}</div>` : ''}
                            ${act.estimatedCost ? `<div class="activity-cost">${act.estimatedCost}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                ${day.meals ? `
                    <div class="meals-row">
                        <span class="meal-item">🍳 ${day.meals.breakfast || ''}</span>
                        <span class="meal-item">🍛 ${day.meals.lunch || ''}</span>
                        <span class="meal-item">🍽️ ${day.meals.dinner || ''}</span>
                    </div>
                ` : ''}
                ${day.estimatedDayCost ? `<div class="day-cost">Day Total: ${day.estimatedDayCost}</div>` : ''}
            </div>`;
        }
    }

    // Hotels HTML
    let hotelsHTML = '';
    if (tripData?.hotels && Array.isArray(tripData.hotels) && tripData.hotels.length > 0) {
        hotelsHTML = `
        <div class="section no-break">
            <h2 class="section-title">🏨 Recommended Hotels</h2>
            <div class="hotels-grid">
                ${tripData.hotels.map(hotel => `
                    <div class="hotel-card">
                        <div class="hotel-name">${hotel.name || ''}</div>
                        <div class="hotel-rating">${'⭐'.repeat(Math.round(hotel.rating || 4))}</div>
                        <div class="hotel-price">${hotel.priceRange || ''}</div>
                        <div class="hotel-desc">${hotel.description || ''}</div>
                        ${hotel.mapsLink ? `<div class="hotel-link">📍 ${hotel.mapsLink}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>`;
    }

    // Transport HTML
    let transportHTML = '';
    if (tripData?.transportSuggestions) {
        transportHTML = `
        <div class="section no-break">
            <h2 class="section-title">🚗 Getting There & Around</h2>
            <div class="transport-grid">
                <div class="transport-card">
                    <h4>✈️ Reaching ${destination}</h4>
                    <p>${(tripData.transportSuggestions.reachingDestination || '').replace(/•/g, '<br>•')}</p>
                </div>
                <div class="transport-card">
                    <h4>🚕 Local Transport</h4>
                    <p>${(tripData.transportSuggestions.localTransport || '').replace(/•/g, '<br>•')}</p>
                </div>
            </div>
        </div>`;
    }

    // Tips HTML
    let tipsHTML = '';
    if (tripData?.tips && Array.isArray(tripData.tips) && tripData.tips.length > 0) {
        tipsHTML = `
        <div class="section no-break">
            <h2 class="section-title">💡 Travel Tips</h2>
            <div class="tips-grid">
                ${tripData.tips.map((tip, i) => `
                    <div class="tip-card">
                        <span class="tip-number">${i + 1}</span>
                        <span class="tip-text">${tip}</span>
                    </div>
                `).join('')}
            </div>
        </div>`;
    }

    // Budget HTML
    let budgetHTML = '';
    if (tripData?.budgetBreakdown) {
        const bb = tripData.budgetBreakdown;
        budgetHTML = `
        <div class="section no-break">
            <h2 class="section-title">💰 Budget Breakdown</h2>
            ${tripData.totalEstimatedBudget ? `<p class="total-budget">Total: ${tripData.totalEstimatedBudget}</p>` : ''}
            <div class="budget-grid">
                <div class="budget-item"><span class="budget-icon">🏨</span><span class="budget-label">Stay</span><span class="budget-value">${bb.stay || '-'}</span></div>
                <div class="budget-item"><span class="budget-icon">🚗</span><span class="budget-label">Transport</span><span class="budget-value">${bb.transport || '-'}</span></div>
                <div class="budget-item"><span class="budget-icon">🍽️</span><span class="budget-label">Food</span><span class="budget-value">${bb.food || '-'}</span></div>
                <div class="budget-item"><span class="budget-icon">🎯</span><span class="budget-label">Activities</span><span class="budget-value">${bb.activities || '-'}</span></div>
            </div>
        </div>`;
    }

    // Packing list HTML
    let packingHTML = '';
    if (packingList && packingList.categories && packingList.categories.length > 0) {
        packingHTML = `
        <div class="page-break"></div>
        <div class="section">
            <h2 class="section-title">🧳 Packing List</h2>
            ${packingList.weatherNote ? `<div class="weather-note">🌤️ ${packingList.weatherNote}</div>` : ''}
            <div class="packing-grid">
                ${packingList.categories.map(cat => `
                    <div class="packing-category">
                        <h4>${cat.icon || '📦'} ${cat.name}</h4>
                        ${(cat.items || []).map(item => {
                            const checked = item.checked ? 'checked-item' : '';
                            const essential = item.essential ? '<span class="essential-badge">Essential</span>' : '';
                            const qty = item.quantity > 1 ? ` (×${item.quantity})` : '';
                            return `<div class="packing-item ${checked}">
                                <span class="check-mark">${item.checked ? '☑' : '☐'}</span>
                                <span class="item-name">${item.name}${qty}</span>
                                ${essential}
                            </div>`;
                        }).join('')}
                    </div>
                `).join('')}
            </div>
            ${packingList.proTip ? `<div class="pro-tip">💡 Pro Tip: ${packingList.proTip}</div>` : ''}
        </div>`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; color: #1a1a2e; font-size: 13px; line-height: 1.5; }
.page-break { page-break-before: always; }
.no-break { page-break-inside: avoid; }

/* ─── COVER PAGE ─── */
.cover {
    height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;
    text-align: center; position: relative; overflow: hidden;
    background: linear-gradient(135deg, #1e3a5f 0%, #0d7377 50%, #14b8a6 100%);
    color: #fff; padding: 60px 40px;
}
.cover-destination { font-size: 52px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 16px; text-shadow: 0 4px 20px rgba(0,0,0,0.3); }
.cover-subtitle { font-size: 18px; font-weight: 500; opacity: 0.9; margin-bottom: 32px; }
.cover-tags { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.cover-tag { padding: 6px 16px; border-radius: 8px; background: rgba(255,255,255,0.15); font-size: 13px; font-weight: 600; backdrop-filter: blur(4px); }
.cover-footer { position: absolute; bottom: 40px; left: 40px; right: 40px; display: flex; justify-content: space-between; font-size: 12px; opacity: 0.7; }

/* ─── SECTIONS ─── */
.section { margin-bottom: 28px; }
.section-title { font-size: 18px; font-weight: 700; margin-bottom: 14px; color: #0d7377; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }

/* ─── DAY ITINERARY ─── */
.day-section { margin-bottom: 22px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
.day-header { background: linear-gradient(135deg, #1e3a5f, #0d7377); color: #fff; padding: 12px 18px; display: flex; align-items: center; gap: 12px; }
.day-number { font-weight: 800; font-size: 15px; }
.day-title { font-weight: 500; font-size: 13px; opacity: 0.9; }
.activities-grid { padding: 14px 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.activity-card { padding: 10px 14px; border-radius: 8px; background: #f8f9fa; border: 1px solid #e5e7eb; }
.activity-time { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #0d7377; margin-bottom: 4px; text-transform: uppercase; }
.time-icon { font-size: 14px; }
.activity-name { font-weight: 600; font-size: 12px; margin-bottom: 3px; }
.activity-place { font-size: 11px; color: #6b7280; }
.activity-cost { font-size: 11px; color: #d97706; font-weight: 600; margin-top: 3px; }
.meals-row { padding: 10px 18px; background: #fefce8; border-top: 1px solid #e5e7eb; display: flex; gap: 16px; flex-wrap: wrap; }
.meal-item { font-size: 11px; color: #4a4a68; }
.day-cost { padding: 8px 18px; background: #f0fdf4; text-align: right; font-weight: 700; font-size: 12px; color: #16a34a; border-top: 1px solid #e5e7eb; }

/* ─── HOTELS ─── */
.hotels-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.hotel-card { padding: 14px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f8f9fa; }
.hotel-name { font-weight: 700; font-size: 13px; margin-bottom: 4px; }
.hotel-rating { font-size: 11px; margin-bottom: 4px; }
.hotel-price { font-size: 12px; color: #d97706; font-weight: 600; margin-bottom: 4px; }
.hotel-desc { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
.hotel-link { font-size: 9px; color: #0d7377; word-break: break-all; }

/* ─── TRANSPORT ─── */
.transport-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.transport-card { padding: 14px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f8f9fa; }
.transport-card h4 { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
.transport-card p { font-size: 11px; color: #4a4a68; line-height: 1.7; }

/* ─── TIPS ─── */
.tips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.tip-card { display: flex; align-items: baseline; gap: 8px; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f8f9fa; }
.tip-number { width: 22px; height: 22px; border-radius: 50%; background: #0d7377; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.tip-text { font-size: 11px; color: #4a4a68; line-height: 1.5; }

/* ─── BUDGET ─── */
.total-budget { font-size: 16px; font-weight: 700; color: #d97706; margin-bottom: 12px; }
.budget-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.budget-item { text-align: center; padding: 14px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f8f9fa; }
.budget-icon { font-size: 20px; display: block; margin-bottom: 6px; }
.budget-label { font-size: 11px; color: #6b7280; display: block; margin-bottom: 4px; }
.budget-value { font-size: 12px; font-weight: 700; color: #1a1a2e; }

/* ─── PACKING LIST ─── */
.weather-note { padding: 10px 14px; border-radius: 8px; background: #eff6ff; border: 1px solid #dbeafe; font-size: 12px; color: #2563eb; margin-bottom: 14px; }
.packing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.packing-category { padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; }
.packing-category h4 { font-size: 13px; font-weight: 700; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
.packing-item { display: flex; align-items: center; gap: 6px; padding: 3px 0; font-size: 11px; }
.packing-item.checked-item .item-name { text-decoration: line-through; color: #9ca3af; }
.check-mark { font-size: 13px; }
.item-name { flex: 1; }
.essential-badge { font-size: 9px; font-weight: 700; color: #dc2626; background: #fef2f2; padding: 1px 5px; border-radius: 3px; }
.pro-tip { padding: 10px 14px; border-radius: 8px; background: #fffbeb; border: 1px solid #fde68a; font-size: 12px; color: #d97706; margin-top: 14px; }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover">
    <div class="cover-destination">${destination || 'Your Trip'}</div>
    <div class="cover-subtitle">${duration || '?'} Days · ${travelers || 1} Traveler${(travelers || 1) > 1 ? 's' : ''} · ${styleLabel} Style</div>
    <div class="cover-tags">
        <span class="cover-tag">Budget: ${budgetLabel}</span>
        ${tripData?.totalEstimatedBudget ? `<span class="cover-tag">${tripData.totalEstimatedBudget}</span>` : ''}
    </div>
    <div class="cover-footer">
        <span>GoTrip Pro — AI Smart Travel Planner</span>
        <span>Generated: ${generatedDate}</span>
    </div>
</div>

<!-- CONTENT PAGES -->
<div class="page-break"></div>
<div style="padding: 20px 10px;">
    ${budgetHTML}
    ${transportHTML}
    ${hotelsHTML}
    <h2 class="section-title" style="margin-top: 24px;">📅 Day-by-Day Itinerary</h2>
    ${itineraryHTML}
    ${tipsHTML}
    ${packingHTML}
</div>

</body>
</html>`;
}

/**
 * Generate a PDF buffer from a trip document
 * @param {Object} trip - Full trip document from MongoDB
 * @returns {Buffer} PDF buffer
 */
async function generatePDF(trip) {
    let browser = null;
    try {
        const html = buildPDFHTML(trip);

        // Use @sparticuz/chromium for serverless, or local Chrome for dev
        let chromiumArgs;
        let executablePath;
        try {
            const chromium = require('@sparticuz/chromium');
            executablePath = await chromium.executablePath();
            chromiumArgs = chromium.args;
        } catch (_) {
            // Fallback for local development — use system Chrome or puppeteer
            executablePath = null;
            chromiumArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
        }

        const puppeteer = require('puppeteer-core');
        browser = await puppeteer.launch({
            args: chromiumArgs,
            executablePath: executablePath || (
                process.platform === 'win32'
                    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
                    : process.platform === 'darwin'
                        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
                        : '/usr/bin/google-chrome-stable'
            ),
            headless: 'new',
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
            printBackground: true,
        });

        return pdfBuffer;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { generatePDF, buildPDFHTML };
