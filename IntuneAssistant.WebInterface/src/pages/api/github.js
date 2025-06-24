// src/pages/api/github.js

export async function POST({ request }) {
    const GITHUB_PAT_TOKEN = import.meta.env.GITHUB_PAT_TOKEN;
    console.log("Token available:", !!GITHUB_PAT_TOKEN);

    // Log token prefix (first 4 chars) for debugging
    if (GITHUB_PAT_TOKEN) {
        console.log("Token prefix:", GITHUB_PAT_TOKEN.substring(0, 4));
    }

    if (!GITHUB_PAT_TOKEN) {
        return new Response(JSON.stringify({ error: 'GitHub token not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { query, variables } = await request.json();
        console.log("Query:", query.substring(0, 50) + "...");

        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GITHUB_PAT_TOKEN}`
            },
            body: JSON.stringify({ query, variables })
        });

        const data = await response.json();
        console.log("Response status:", response.status);

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("API error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}