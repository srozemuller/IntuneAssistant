// app/api/consent-callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('🔵 Consent callback received:', body);

        const { adminConsent, state, tenantId, code, searchParams } = body;

        // Validate the callback data
        if (!adminConsent && !code) {
            return NextResponse.json(
                { error: 'Missing consent confirmation' },
                { status: 400 }
            );
        }

        // Here you can process the consent callback
        // For example, update your database, call your backend API, etc.

        // If you need to call your backend API with the consent result:
        // const backendResponse = await fetch(`${BACKEND_URL}/consent-callback`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         // Add any required auth headers
        //     },
        //     body: JSON.stringify({
        //         adminConsent,
        //         state,
        //         tenantId,
        //         code,
        //         searchParams
        //     })
        // });

        return NextResponse.json({
            success: true,
            message: 'Consent callback processed successfully',
            data: {
                adminConsent,
                state,
                tenantId
            }
        });

    } catch (error) {
        console.error('❌ Error processing consent callback:', error);
        return NextResponse.json(
            {
                error: 'Failed to process consent callback',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
