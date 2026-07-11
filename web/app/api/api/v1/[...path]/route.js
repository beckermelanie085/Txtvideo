import { NextResponse } from 'next/server';

const MUAPI_BASE = 'https://api.muapi.ai';

function getApiKey(request) {
    const headerKey = request.headers.get('x-api-key');
    if (headerKey) return headerKey;
    // Cookie-based auth removed for security (CWE-522)
    if (process.env.MUAPI_API_KEY) return process.env.MUAPI_API_KEY;
    return null;
}

function cleanHeaders(request) {
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('connection');
    headers.delete('cookie');
    return headers;
}

// Cross-origin access is opt-in only. Left unset, this route stays
// same-origin, since a wildcard would let any third-party site ride on
// the MUAPI_API_KEY server-side fallback. Set CORS_ALLOWED_ORIGINS to a
// comma-separated list of origins (or "*") to open it up.
function getCorsOrigin(request) {
    const origin = request.headers.get('origin');
    if (!origin) return null;

    const allowed = (process.env.CORS_ALLOWED_ORIGINS || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

    if (allowed.includes('*')) return '*';
    return allowed.includes(origin) ? origin : null;
}

function withCors(request, response) {
    const origin = getCorsOrigin(request);
    if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Vary', 'Origin');
    }
    return response;
}

export async function OPTIONS(request) {
    const response = new NextResponse(null, { status: 204 });
    const origin = getCorsOrigin(request);
    if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Vary', 'Origin');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
        response.headers.set('Access-Control-Max-Age', '86400');
    }
    return response;
}

// Proxies /api/api/v1/* -> https://api.muapi.ai/api/v1/*
// This is required because the AiAgent library hardcodes a double /api/api
export async function GET(request, { params }) {
    const slug = await params;
    const pathSegments = slug.path || [];
    const path = pathSegments.join('/');

    const { search } = new URL(request.url);
    const targetUrl = `${MUAPI_BASE}/api/v1/${path}${search}`;

    const headers = cleanHeaders(request);
    const apiKey = getApiKey(request);

    // NOTE: credential logging removed for security (CWE-200)
    if (apiKey) headers.set('x-api-key', apiKey);

    try {
        const response = await fetch(targetUrl, { headers, method: 'GET' });
        const data = await response.json();
        return withCors(request, NextResponse.json(data, { status: response.status }));
    } catch (error) {
        return withCors(request, NextResponse.json({ error: error.message }, { status: 500 }));
    }
}

export async function POST(request, { params }) {
    const slug = await params;
    const pathSegments = slug.path || [];
    const path = pathSegments.join('/');

    const { search } = new URL(request.url);
    const targetUrl = `${MUAPI_BASE}/api/v1/${path}${search}`;

    const headers = cleanHeaders(request);
    const apiKey = getApiKey(request);
    if (apiKey) headers.set('x-api-key', apiKey);

    try {
        const body = await request.arrayBuffer();
        const response = await fetch(targetUrl, { method: 'POST', headers, body });
        const data = await response.json();
        return withCors(request, NextResponse.json(data, { status: response.status }));
    } catch (error) {
        return withCors(request, NextResponse.json({ error: error.message }, { status: 500 }));
    }
}
