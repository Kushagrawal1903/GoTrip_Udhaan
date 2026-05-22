const fs = require('fs');
const path = require('path');

const DEFAULT_ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];

/**
 * Resolve Chrome/Chromium executable for puppeteer-core.
 * Prefers local Chrome in dev; uses @sparticuz/chromium only on Vercel/Lambda.
 */
async function resolveExecutablePath() {
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        const custom = process.env.PUPPETEER_EXECUTABLE_PATH;
        if (fs.existsSync(custom)) return custom;
    }

    const isServerless = Boolean(
        process.env.VERCEL
        || process.env.AWS_LAMBDA_FUNCTION_NAME
        || process.env.AWS_EXECUTION_ENV
    );

    if (isServerless) {
        const chromium = require('@sparticuz/chromium');
        return chromium.executablePath();
    }

    const candidates = [];
    if (process.platform === 'win32') {
        const localAppData = process.env.LOCALAPPDATA || '';
        candidates.push(
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
            'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
            path.join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe')
        );
    } else if (process.platform === 'darwin') {
        candidates.push(
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Chromium.app/Contents/MacOS/Chromium',
            '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
        );
    } else {
        candidates.push(
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium'
        );
    }

    for (const candidate of candidates) {
        if (candidate && fs.existsSync(candidate)) return candidate;
    }

    throw new Error(
        'PDF engine unavailable: install Google Chrome or Microsoft Edge, or set PUPPETEER_EXECUTABLE_PATH.'
    );
}

async function getLaunchOptions() {
    const isServerless = Boolean(
        process.env.VERCEL
        || process.env.AWS_LAMBDA_FUNCTION_NAME
        || process.env.AWS_EXECUTION_ENV
    );

    if (isServerless) {
        const chromium = require('@sparticuz/chromium');
        return {
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless ?? true,
        };
    }

    return {
        args: DEFAULT_ARGS,
        executablePath: await resolveExecutablePath(),
        headless: true,
    };
}

/**
 * Launch puppeteer browser with environment-aware executable resolution.
 */
async function launchBrowser() {
    const puppeteer = require('puppeteer-core');
    const options = await getLaunchOptions();
    return puppeteer.launch(options);
}

module.exports = { launchBrowser, resolveExecutablePath, getLaunchOptions };
