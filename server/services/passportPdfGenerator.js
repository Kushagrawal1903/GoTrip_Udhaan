const { launchBrowser } = require('../utils/puppeteerLaunch');

const MOOD_LABELS = {
    peaceful: 'Peaceful',
    adventurous: 'Adventurous',
    emotional: 'Emotional',
    cultural: 'Cultural',
    relaxing: 'Relaxing',
    energetic: 'Energetic',
    reflective: 'Reflective',
};

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const IMAGE_TIERS = {
    light: { name: 'light', hero: 720, feature: 420, photo: 320, reflection: 480, quality: 65 },
    medium: { name: 'medium', hero: 540, feature: 320, photo: 240, reflection: 360, quality: 55 },
    heavy: { name: 'heavy', hero: 400, feature: 260, photo: 180, reflection: 280, quality: 45 },
};

const PDF_SIZE_RETRY_BYTES = 20 * 1024 * 1024;

function hasCloudinaryFetch() {
    return Boolean(process.env.CLOUDINARY_CLOUD_NAME);
}

function isCloudinaryUrl(url) {
    return Boolean(url && typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes('/upload/'));
}

function cloudinaryTransformUrl(url, width, quality) {
    const [base, afterUpload] = url.split('/upload/');
    if (!afterUpload) return '';

    const segments = afterUpload.split('/');
    let startIdx = 0;
    while (startIdx < segments.length - 1) {
        const seg = segments[startIdx];
        if (/^v\d+$/.test(seg) || seg.includes(',') || /^[a-z]_/.test(seg)) {
            startIdx += 1;
        } else {
            break;
        }
    }

    const publicIdPath = segments.slice(startIdx).join('/');
    if (!publicIdPath) return '';

    const height = Math.round(width * 0.72);
    return `${base}/upload/w_${width},h_${height},c_limit,q_${quality},f_auto/${publicIdPath}`;
}

/**
 * Resolve any image URL for PDF rendering with tier-based compression.
 */
function resolvePdfImageUrl(url, tier, width) {
    if (!url || typeof url !== 'string') return '';

    const quality = tier.quality ?? 65;
    const w = width || tier.photo;

    if (isCloudinaryUrl(url)) {
        return cloudinaryTransformUrl(url, w, quality);
    }

    if (hasCloudinaryFetch() && /^https?:\/\//i.test(url)) {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const height = Math.round(w * 0.72);
        const remote = encodeURIComponent(url);
        return `https://res.cloudinary.com/${cloudName}/image/fetch/w_${w},h_${height},c_limit,q_${quality},f_auto/${remote}`;
    }

    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    return '';
}

function countPdfImages(pdfData) {
    const trips = pdfData.trips || [];
    let count = 0;
    trips.forEach((trip) => {
        if (trip.destinationImage) count += 2;
        count += Math.min((trip.photos || []).length, 3);
    });
    if (trips.length > 0 && trips[trips.length - 1].destinationImage) {
        count += 1;
    }
    return count;
}

function computeImageTier(pdfData, forcedTierName = null) {
    if (forcedTierName && IMAGE_TIERS[forcedTierName]) {
        return IMAGE_TIERS[forcedTierName];
    }

    const imageCount = countPdfImages(pdfData);
    const tripCount = (pdfData.trips || []).length;
    const photoCount = (pdfData.trips || []).reduce(
        (sum, t) => sum + Math.min((t.photos || []).length, 3),
        0
    );

    if (imageCount >= 15 || (tripCount >= 5 && photoCount >= 6)) {
        return IMAGE_TIERS.heavy;
    }
    if (imageCount >= 8) {
        return IMAGE_TIERS.medium;
    }
    return IMAGE_TIERS.light;
}

function imageFallbackHtml(label, variant = 'hero') {
    const initial = escapeHtml((label || '?').charAt(0).toUpperCase());
    const safeLabel = escapeHtml(label || 'Destination');
    if (variant === 'polaroid') {
        return `<div class="img-fallback img-fallback--polaroid"><span class="img-fallback-initial">${initial}</span><span class="img-fallback-label">${safeLabel}</span></div>`;
    }
    return `<div class="img-fallback img-fallback--hero"><span class="img-fallback-initial">${initial}</span><span class="img-fallback-label">${safeLabel}</span></div>`;
}

function hashRotation(seed, min = -12, max = 12) {
    let hash = 0;
    const str = String(seed || '');
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    const range = max - min;
    return min + (Math.abs(hash) % (range + 1));
}

function formatDateRange(trip) {
    const start = trip.createdAt ? new Date(trip.createdAt) : new Date();
    if (Number.isNaN(start.getTime())) return '—';
    const duration = trip.duration || 1;
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    const opts = { month: 'short', day: 'numeric' };
    const startStr = start.toLocaleString('default', opts);
    const endStr = end.toLocaleString('default', { ...opts, year: 'numeric' });
    return `${startStr} – ${endStr}`;
}

function moodDisplay(trip) {
    if (trip.userMood) {
        return MOOD_LABELS[trip.userMood] || trip.userMood;
    }
    return trip.memoryMood?.label || '';
}

function budgetLabel(budget) {
    if (budget === 'premium') return 'Luxury';
    if (budget === 'moderate') return 'Moderate';
    return 'Budget';
}

function buildPhotoClusterHtml(trip, tier) {
    const photos = (trip.photos || []).slice(0, 3);
    if (!photos.length) return '';

    let cluster = '<div class="photo-cluster-wrap"><div class="eyebrow" style="margin-bottom:3mm;">Moments from this journey</div><div class="photo-cluster">';
    photos.forEach((photo, pi) => {
        const imgUrl = resolvePdfImageUrl(photo.url, tier, tier.photo);
        const imgContent = imgUrl
            ? `<img src="${escapeHtml(imgUrl)}" alt="" />`
            : imageFallbackHtml(trip.destination, 'polaroid');
        cluster += `
            <div class="cluster-polaroid">
              ${imgContent}
            </div>`;
    });
    cluster += '</div></div>';
    return cluster;
}

/**
 * Builds the HTML template for the Memory Journal PDF.
 * @param {Object} data - Passport PDF payload
 * @param {Object} [tier] - Image size/quality tier from computeImageTier
 */
function buildTravelBookHTML(data, tier = IMAGE_TIERS.light) {
    const { user, stats, travelPersonality, reflectionSummary, trips } = data;
    const safeName = escapeHtml(user?.name || 'Traveler');
    const memberDate = user?.memberSince ? new Date(user.memberSince) : new Date();
    const memberYear = Number.isNaN(memberDate.getTime()) ? '—' : memberDate.getFullYear();
    const memberMonth = Number.isNaN(memberDate.getTime())
        ? '—'
        : memberDate.toLocaleString('default', { month: 'long' });
    const preservedYear = new Date().getFullYear();

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  :root {
    --leather-dark: #1f140c;
    --leather: #2e1f14;
    --gold: #c9a227;
    --gold-light: #e8d4a8;
    --paper: #ebe2d0;
    --paper-warm: #f6f0e4;
    --paper-shadow: #cfc0a8;
    --ink: #1c1814;
    --ink-soft: #5a5248;
    --stamp: #9e3d32;
    --font-display: Georgia, 'Palatino Linotype', 'Book Antiqua', serif;
    --font-editorial: 'Palatino Linotype', Georgia, 'Times New Roman', serif;
    --font-sans: 'Segoe UI', system-ui, sans-serif;
    --font-hand: 'Segoe Script', 'Brush Script MT', cursive;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4 portrait; margin: 0; }

  body {
    font-family: var(--font-sans);
    color: var(--ink);
    background: var(--paper);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    width: 210mm;
    height: 297mm;
    position: relative;
    overflow: hidden;
    page-break-after: always;
    background: var(--paper);
  }

  .page-paper {
    background:
      radial-gradient(ellipse 120% 80% at 50% 20%, var(--paper-warm) 0%, var(--paper) 55%, var(--paper-shadow) 100%);
  }

  .page-leather {
    background: radial-gradient(circle at 40% 30%, var(--leather) 0%, var(--leather-dark) 75%);
    color: var(--gold-light);
  }

  .frame {
    position: absolute;
    inset: 14mm;
    border: 1px solid rgba(201, 162, 39, 0.35);
    pointer-events: none;
    z-index: 2;
  }

  .frame-inner {
    position: absolute;
    inset: 18mm;
    border: 1px solid rgba(0,0,0,0.06);
    pointer-events: none;
    z-index: 2;
  }

  .content {
    position: relative;
    z-index: 5;
    height: 100%;
    padding: 22mm 20mm;
    display: flex;
    flex-direction: column;
  }

  /* ─── COVER ─── */
  .cover-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 30mm 15mm;
  }

  .cover-eyebrow {
    font-family: var(--font-sans);
    font-size: 9pt;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: var(--gold);
    opacity: 0.85;
    margin-bottom: 8mm;
  }

  .cover-title {
    font-family: var(--font-display);
    font-size: 42pt;
    font-weight: 700;
    letter-spacing: 0.12em;
    line-height: 1.05;
    color: var(--gold-light);
    text-shadow: 0 2px 0 rgba(0,0,0,0.3);
    margin-bottom: 4mm;
  }

  .cover-subtitle {
    font-family: var(--font-editorial);
    font-size: 14pt;
    font-style: italic;
    letter-spacing: 0.08em;
    color: rgba(232, 212, 168, 0.9);
    margin-bottom: 14mm;
  }

  .cover-seal {
    width: 28mm;
    height: 28mm;
    margin: 6mm auto 10mm;
    opacity: 0.9;
  }

  .cover-name {
    font-family: var(--font-hand);
    font-size: 22pt;
    color: var(--gold);
    margin-top: 6mm;
  }

  .cover-footer {
    font-size: 8pt;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    opacity: 0.55;
    margin-top: auto;
    padding-top: 10mm;
  }

  /* ─── TYPOGRAPHY ─── */
  .eyebrow {
    font-family: var(--font-sans);
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 3mm;
  }

  .display {
    font-family: var(--font-display);
    font-weight: 700;
    line-height: 1.1;
    color: var(--ink);
  }

  .display-xl { font-size: 32pt; }
  .display-lg { font-size: 24pt; }
  .display-md { font-size: 18pt; }

  .editorial {
    font-family: var(--font-editorial);
    font-size: 13pt;
    line-height: 1.65;
    color: var(--ink-soft);
  }

  .hand {
    font-family: var(--font-hand);
    font-size: 16pt;
    line-height: 1.35;
    color: #2a2620;
  }

  .divider {
    width: 40mm;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin: 8mm auto;
  }

  /* ─── IDENTITY ─── */
  .stats-row {
    display: flex;
    justify-content: center;
    gap: 14mm;
    margin: 12mm 0;
  }

  .stat-box {
    text-align: center;
    padding: 5mm 8mm;
    border: 1px solid rgba(0,0,0,0.08);
    background: rgba(255,255,255,0.35);
    min-width: 28mm;
  }

  .stat-num {
    font-family: var(--font-display);
    font-size: 28pt;
    font-weight: 700;
    color: var(--ink);
    line-height: 1;
  }

  .personality-box {
    margin-top: 10mm;
    padding: 8mm 10mm;
    border-left: 3px solid var(--gold);
    background: rgba(255,255,255,0.4);
  }

  /* ─── TRIP HERO ─── */
  .hero-page .hero-img-wrap {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 62%;
    overflow: hidden;
  }

  .hero-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: sepia(0.12) contrast(1.05) brightness(0.92);
  }

  .hero-img-wrap::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.05) 40%, var(--paper) 100%);
  }

  .hero-body {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 42%;
    padding: 12mm 20mm 18mm;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .chapter-num {
    font-family: var(--font-sans);
    font-size: 8pt;
    letter-spacing: 0.4em;
    color: var(--gold);
    margin-bottom: 2mm;
  }

  .stamp {
    position: absolute;
    top: 48%;
    right: 18mm;
    width: 32mm;
    height: 32mm;
    border: 3px solid var(--stamp);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: rotate(-14deg);
    opacity: 0.88;
    z-index: 10;
    background: rgba(235, 226, 208, 0.75);
    font-family: var(--font-sans);
    font-size: 7pt;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-align: center;
    color: var(--stamp);
    line-height: 1.3;
  }

  .stamp-year {
    font-family: var(--font-display);
    font-size: 14pt;
    margin: 1mm 0;
  }

  /* ─── IMAGE FALLBACKS ─── */
  .img-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, #4a5d4a 0%, #2c3329 50%, #1f2520 100%);
    color: var(--gold-light);
    text-align: center;
  }

  .img-fallback--hero { min-height: 100%; }

  .img-fallback--polaroid {
    height: 52mm;
    border-radius: 1px;
  }

  .img-fallback-initial {
    font-family: var(--font-display);
    font-size: 36pt;
    font-weight: 700;
    opacity: 0.9;
    line-height: 1;
  }

  .img-fallback-label {
    font-family: var(--font-sans);
    font-size: 7pt;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-top: 3mm;
    opacity: 0.65;
  }

  /* ─── MEMORY SPREAD (magazine) ─── */
  .memory-page .content {
    padding: 18mm 18mm 16mm;
  }

  .memory-masthead {
    margin-bottom: 10mm;
    padding-bottom: 6mm;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }

  .memory-masthead .display-lg {
    margin: 2mm 0 4mm;
  }

  .memory-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 3mm;
    margin-top: 3mm;
  }

  .meta-pill {
    font-family: var(--font-sans);
    font-size: 8pt;
    letter-spacing: 0.06em;
    padding: 1.5mm 4mm;
    border-radius: 20px;
    border: 1px solid rgba(0,0,0,0.08);
    background: rgba(255,255,255,0.45);
    color: var(--ink-soft);
  }

  .memory-grid {
    display: grid;
    grid-template-columns: 45fr 55fr;
    gap: 12mm;
    flex: 1;
    align-items: start;
    min-height: 0;
  }

  .memory-narrative .section {
    margin-bottom: 6mm;
  }

  .memory-narrative .section:last-child {
    margin-bottom: 0;
  }

  .memory-visual {
    display: flex;
    flex-direction: column;
    gap: 6mm;
    position: relative;
    min-height: 140mm;
  }

  .feature-polaroid {
    width: 72mm;
    margin-left: auto;
    margin-right: 4mm;
    background: #fff;
    padding: 2.5mm 2.5mm 10mm;
    box-shadow: 2px 8px 24px rgba(0,0,0,0.16);
    transform: rotate(2.5deg);
    position: relative;
    z-index: 3;
  }

  .feature-polaroid img,
  .feature-polaroid .img-fallback--polaroid {
    width: 100%;
    height: 52mm;
    object-fit: cover;
    display: block;
    filter: sepia(0.12) contrast(1.04) brightness(0.96);
  }

  .feature-caption {
    font-family: var(--font-hand);
    font-size: 11pt;
    text-align: center;
    margin-top: 3mm;
    color: var(--ink-soft);
  }

  .note-card {
    background: #faf8f2;
    padding: 7mm 6mm 6mm;
    position: relative;
    box-shadow: 1px 3px 12px rgba(0,0,0,0.08);
    border: 1px solid rgba(0,0,0,0.04);
    transform: rotate(-1.2deg);
    z-index: 4;
  }

  .tape {
    position: absolute;
    top: -4mm;
    left: 50%;
    transform: translateX(-50%) rotate(-2deg);
    width: 18mm;
    height: 6mm;
    background: rgba(230, 218, 180, 0.85);
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }

  .mood-pill {
    display: inline-flex;
    align-items: center;
    gap: 2mm;
    padding: 2mm 4mm;
    border-radius: 20px;
    border: 1px solid rgba(0,0,0,0.08);
    background: rgba(255,255,255,0.5);
    font-size: 9pt;
    margin-top: 3mm;
  }

  .photo-cluster-wrap {
    margin-top: 2mm;
  }

  .photo-cluster {
    position: relative;
    height: 58mm;
    width: 100%;
    max-width: 78mm;
    margin-left: auto;
  }

  .cluster-polaroid {
    position: absolute;
    width: 34mm;
    background: #fff;
    padding: 2mm 2mm 7mm;
    box-shadow: 1px 5px 16px rgba(0,0,0,0.14);
  }

  .cluster-polaroid img,
  .cluster-polaroid .img-fallback--polaroid {
    width: 100%;
    height: 26mm;
    object-fit: cover;
    display: block;
    filter: sepia(0.1) contrast(1.03);
  }

  .cluster-polaroid:nth-child(1) { left: 0; top: 0; transform: rotate(-5deg); z-index: 2; }
  .cluster-polaroid:nth-child(2) { left: 24mm; top: 10mm; transform: rotate(4deg); z-index: 3; }
  .cluster-polaroid:nth-child(3) { left: 8mm; top: 26mm; transform: rotate(-2deg); z-index: 1; }

  .memory-watermark {
    position: absolute;
    bottom: 8mm;
    right: 6mm;
    width: 28mm;
    height: 28mm;
    border: 2px solid rgba(158, 61, 50, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: rotate(-18deg);
    opacity: 0.35;
    font-family: var(--font-sans);
    font-size: 6pt;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--stamp);
    pointer-events: none;
    z-index: 1;
  }

  /* ─── TIMELINE ─── */
  .timeline-list { margin-top: 8mm; position: relative; padding-left: 12mm; }
  .timeline-list::before {
    content: "";
    position: absolute;
    left: 3mm;
    top: 2mm;
    bottom: 2mm;
    width: 2px;
    background: linear-gradient(var(--gold), var(--paper-shadow));
  }

  .timeline-item {
    position: relative;
    margin-bottom: 7mm;
    padding-left: 6mm;
  }

  .timeline-item::before {
    content: "";
    position: absolute;
    left: -9.5mm;
    top: 2mm;
    width: 5mm;
    height: 5mm;
    border-radius: 50%;
    background: var(--gold);
    border: 2px solid var(--paper-warm);
  }

  /* ─── REFLECTION ─── */
  .reflection-quote {
    font-family: var(--font-editorial);
    font-size: 16pt;
    font-style: italic;
    line-height: 1.7;
    text-align: center;
    max-width: 140mm;
    margin: 10mm auto;
    color: var(--ink-soft);
  }

  .reflection-polaroid {
    width: 55mm;
    margin: 10mm auto 0;
    background: #fff;
    padding: 2mm 2mm 12mm;
    box-shadow: 2px 6px 20px rgba(0,0,0,0.12);
    transform: rotate(2deg);
    position: relative;
  }

  .reflection-polaroid img {
    width: 100%;
    height: 40mm;
    object-fit: cover;
  }

  .back-cover {
    text-align: center;
    justify-content: center;
    align-items: center;
  }

  .back-tagline {
    font-family: var(--font-editorial);
    font-size: 13pt;
    font-style: italic;
    color: rgba(232, 212, 168, 0.85);
    max-width: 120mm;
    line-height: 1.6;
    margin-top: 8mm;
  }
</style>
</head>
<body>`;

    // ─── COVER ───
    html += `
    <div class="page page-leather">
      <div class="frame"></div>
      <div class="cover-content">
        <div class="cover-eyebrow">GoTrip · Udhaan</div>
        <div class="cover-title">MEMORY<br>JOURNAL</div>
        <div class="cover-subtitle">A collection of journeys, keepsakes &amp; quiet truths</div>
        <svg class="cover-seal" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" stroke="#c9a227" stroke-width="2" opacity="0.7"/>
          <circle cx="50" cy="50" r="36" stroke="#c9a227" stroke-width="1" opacity="0.4"/>
          <path d="M50 22 L54 42 L74 42 L58 54 L64 74 L50 62 L36 74 L42 54 L26 42 L46 42 Z" fill="#c9a227" opacity="0.35"/>
        </svg>
        <div class="cover-name">Kept for ${safeName}</div>
        <div class="cover-footer">Not a file — a journal of places that stayed with you</div>
      </div>
    </div>`;

    // ─── BELONGS TO ───
    html += `
    <div class="page page-paper">
      <div class="frame-inner"></div>
      <div class="content" style="text-align:center; justify-content:center;">
        <div class="eyebrow">This memory journal belongs to</div>
        <div class="display display-xl" style="margin: 5mm 0;">${safeName}</div>
        <div class="divider"></div>
        <div class="eyebrow">Member since</div>
        <div class="editorial" style="font-style:italic;">${escapeHtml(memberMonth)} ${memberYear}</div>
        <div class="stats-row">
          <div class="stat-box"><div class="stat-num">${stats?.tripsCompleted ?? 0}</div><div class="eyebrow" style="margin-top:2mm;">Journeys</div></div>
          <div class="stat-box"><div class="stat-num">${stats?.destinationsExplored ?? 0}</div><div class="eyebrow" style="margin-top:2mm;">Places</div></div>
          <div class="stat-box"><div class="stat-num">${stats?.totalDays ?? 0}</div><div class="eyebrow" style="margin-top:2mm;">Days</div></div>
        </div>
        ${travelPersonality ? `
        <div class="personality-box" style="text-align:left; max-width:150mm; margin: 0 auto;">
          <div class="eyebrow">Travel personality</div>
          <div class="display display-md">${escapeHtml(travelPersonality.emoji)} ${escapeHtml(travelPersonality.label)}</div>
          <div class="editorial" style="margin-top:3mm; font-style:italic;">"${escapeHtml(travelPersonality.description)}"</div>
        </div>` : ''}
      </div>
    </div>`;

    // ─── TRIP PAGES ───
    trips.forEach((trip, index) => {
        const dest = escapeHtml(trip.destination || 'Unknown');
        const destRaw = trip.destination || 'Unknown';
        const tripYear = trip.createdAt && !Number.isNaN(new Date(trip.createdAt).getTime())
            ? new Date(trip.createdAt).getFullYear()
            : preservedYear;
        const abbr = escapeHtml((trip.destination || '').substring(0, 3).toUpperCase());
        const stampColor = escapeHtml(trip.stampColor || '#9e3d32');
        const heroImg = resolvePdfImageUrl(trip.destinationImage, tier, tier.hero);
        const featureImg = resolvePdfImageUrl(trip.destinationImage, tier, tier.feature);
        const heroImgHtml = heroImg
            ? `<img src="${escapeHtml(heroImg)}" alt="" />`
            : imageFallbackHtml(destRaw, 'hero');
        const featureImgHtml = featureImg
            ? `<img src="${escapeHtml(featureImg)}" alt="" />`
            : imageFallbackHtml(destRaw, 'polaroid');

        html += `
    <div class="page page-paper hero-page">
      <div class="hero-img-wrap">
        ${heroImgHtml}
      </div>
      <div class="stamp" style="border-color:${stampColor}; color:${stampColor};">
        <span>VISITED</span>
        <span class="stamp-year">${tripYear}</span>
        <span>${abbr}</span>
      </div>
      <div class="hero-body">
        <div class="chapter-num">Chapter ${index + 1}</div>
        <div class="display display-xl">${dest}</div>
        <div class="editorial" style="margin-top:3mm;">${escapeHtml(formatDateRange(trip))}</div>
        <div class="editorial" style="margin-top:2mm; font-size:11pt;">
          ${trip.duration || '—'} days · ${escapeHtml(budgetLabel(trip.budget))}${trip.travelStyle ? ` · ${escapeHtml(trip.travelStyle)}` : ''}
        </div>
      </div>
    </div>`;

        const mood = moodDisplay(trip);
        const moodEmoji = escapeHtml(trip.memoryMood?.emoji || '✨');
        const photosHtml = buildPhotoClusterHtml(trip, tier);
        const styleLabel = trip.travelStyle
            ? trip.travelStyle.charAt(0).toUpperCase() + trip.travelStyle.slice(1)
            : '';

        html += `
    <div class="page page-paper memory-page">
      <div class="frame-inner"></div>
      <div class="memory-watermark">${abbr}</div>
      <div class="content">
        <div class="memory-masthead">
          <div class="eyebrow">Preserved memory</div>
          <div class="display display-lg">${dest}</div>
          <div class="editorial" style="font-size:11pt;">${escapeHtml(formatDateRange(trip))}</div>
          <div class="memory-meta">
            <span class="meta-pill">${trip.duration || '—'} days</span>
            <span class="meta-pill">${escapeHtml(budgetLabel(trip.budget))}</span>
            ${styleLabel ? `<span class="meta-pill">${escapeHtml(styleLabel)}</span>` : ''}
          </div>
        </div>
        <div class="memory-grid">
          <div class="memory-narrative">
            ${trip.hotel ? `<div class="section"><div class="eyebrow">Where you stayed</div><div class="editorial">${escapeHtml(trip.hotel)}</div></div>` : ''}
            ${trip.favoriteExperience ? `<div class="section"><div class="eyebrow">Favorite experience</div><div class="editorial">${escapeHtml(trip.favoriteExperience)}</div></div>` : ''}
            ${trip.memoryCapsule ? `
            <div class="section">
              <div class="eyebrow">Memory capsule</div>
              <div class="editorial">${escapeHtml(trip.memoryCapsule)}</div>
              ${mood ? `<div class="mood-pill"><span>${moodEmoji}</span><span>${escapeHtml(mood)}</span></div>` : ''}
            </div>` : ''}
          </div>
          <div class="memory-visual">
            <div class="feature-polaroid">
              <div class="tape"></div>
              ${featureImgHtml}
              <div class="feature-caption">${dest}</div>
            </div>
            ${trip.personalThought ? `
            <div class="note-card">
              <div class="tape"></div>
              <div class="eyebrow" style="margin-bottom:2mm;">A thought worth keeping</div>
              <div class="hand">${escapeHtml(trip.personalThought)}</div>
            </div>` : ''}
            ${photosHtml}
          </div>
        </div>
      </div>
    </div>`;
    });

    // ─── TIMELINE ───
    if (trips.length > 1) {
        let timelineItems = '';
        trips.forEach((trip) => {
            const d = trip.createdAt ? new Date(trip.createdAt) : new Date();
            const year = Number.isNaN(d.getTime()) ? '—' : d.getFullYear();
            const month = Number.isNaN(d.getTime()) ? '' : d.toLocaleString('default', { month: 'long' });
            timelineItems += `
          <div class="timeline-item">
            <div class="display display-md" style="font-size:14pt;">${year}</div>
            <div class="editorial" style="font-weight:600; color:var(--ink);">${escapeHtml(trip.destination)}</div>
            <div class="editorial" style="font-size:11pt;">${escapeHtml(month)} ${year}</div>
          </div>`;
        });

        html += `
    <div class="page page-paper">
      <div class="frame-inner"></div>
      <div class="content">
        <div class="eyebrow">Your path through the world</div>
        <div class="display display-lg">Journey Timeline</div>
        <div class="divider"></div>
        <div class="timeline-list">${timelineItems}</div>
      </div>
    </div>`;
    }

    // ─── REFLECTION ───
    const latestTrip = trips.length > 0 ? trips[trips.length - 1] : null;
    const latestImage = latestTrip
        ? resolvePdfImageUrl(latestTrip.destinationImage, tier, tier.reflection)
        : '';
    const quote = escapeHtml(
        reflectionSummary || 'From quiet mountain mornings to unforgettable city nights, every destination became part of your story.'
    );

    html += `
    <div class="page page-paper">
      <div class="frame-inner"></div>
      <div class="content" style="text-align:center;">
        <div class="eyebrow">Closing reflection</div>
        <div class="display display-lg" style="margin: 4mm auto;">A Journey Worth Remembering</div>
        <div class="reflection-quote">"${quote}"</div>
        ${latestImage ? `
        <div class="reflection-polaroid">
          <div class="tape"></div>
          <img src="${escapeHtml(latestImage)}" alt="" />
          <div class="hand" style="text-align:center; margin-top:3mm; font-size:13pt;">The best is yet to come. <span style="color:var(--stamp);">♡</span></div>
        </div>` : ''}
      </div>
    </div>`;

    // ─── BACK COVER ───
    html += `
    <div class="page page-leather">
      <div class="frame"></div>
      <div class="content back-cover">
        <div class="cover-eyebrow">End of journal</div>
        <div class="display display-lg" style="color:var(--gold-light); letter-spacing:0.15em;">MEMORIES KEPT</div>
        <div class="back-tagline">
          These pages were gathered from your GoTrip passport — saved as a keepsake, not merely downloaded.
        </div>
        <div class="cover-name" style="margin-top:12mm;">${safeName}</div>
        <div class="cover-footer" style="margin-top:8mm;">Preserved ${preservedYear} · GoTrip Udhaan</div>
      </div>
    </div>`;

    html += `</body></html>`;
    return html;
}

async function waitForPageReady(page, imageCount = 0) {
    const timeoutMs = imageCount > 12 ? 12000 : imageCount > 6 ? 9000 : 6000;
    const failed = await page.evaluate(async (timeout) => {
        try {
            await document.fonts.ready;
        } catch {
            /* ignore */
        }
        let failedCount = 0;
        const images = Array.from(document.images);
        await Promise.all(
            images.map(
                (img) =>
                    new Promise((resolve) => {
                        if (img.complete) {
                            if (img.naturalWidth === 0) failedCount += 1;
                            resolve();
                        } else {
                            img.onload = () => resolve();
                            img.onerror = () => {
                                failedCount += 1;
                                resolve();
                            };
                            setTimeout(resolve, timeout);
                        }
                    })
            )
        );
        return failedCount;
    }, timeoutMs);

    if (failed > 0) {
        console.warn(`[PASSPORT PDF] ${failed} image(s) failed to load`);
    }
}

async function renderTravelBookPdfBuffer(pdfData, tierName) {
    const tier = computeImageTier(pdfData, tierName);
    const html = buildTravelBookHTML(pdfData, tier);
    const imageCount = countPdfImages(pdfData);

    const browser = await launchBrowser();
    try {
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            if (type === 'font' || type === 'media') {
                req.abort();
                return;
            }
            req.continue();
        });

        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
        await page.setContent(html, { waitUntil: 'load', timeout: 90000 });
        await waitForPageReady(page, imageCount);

        const rawPdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            preferCSSPageSize: true,
            scale: 0.95,
        });

        return Buffer.isBuffer(rawPdf) ? rawPdf : Buffer.from(rawPdf);
    } finally {
        await browser.close();
    }
}

/**
 * Generate a PDF buffer for the Memory Journal
 */
async function generateTravelBookPDF(pdfData) {
    const tierOrder = ['light', 'medium', 'heavy'];
    const startTier = computeImageTier(pdfData).name;
    const startIdx = Math.max(0, tierOrder.indexOf(startTier));

    let lastBuffer = null;

    for (let i = startIdx; i < tierOrder.length; i += 1) {
        const buffer = await renderTravelBookPdfBuffer(pdfData, tierOrder[i]);
        lastBuffer = buffer;

        if (buffer.length <= PDF_SIZE_RETRY_BYTES || i === tierOrder.length - 1) {
            if (i > startIdx) {
                console.log(`[PASSPORT PDF] Generated at ${tierOrder[i]} tier (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);
            }
            return buffer;
        }

        console.log(
            `[PASSPORT PDF] Buffer ${(buffer.length / 1024 / 1024).toFixed(1)} MB exceeds limit, retrying at ${tierOrder[i + 1]} tier`
        );
    }

    return lastBuffer;
}

module.exports = {
    generateTravelBookPDF,
    buildTravelBookHTML,
    computeImageTier,
    resolvePdfImageUrl,
};
