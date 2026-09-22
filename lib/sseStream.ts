// lib/sseStream.ts
// Minimal Server-Sent Events reader over a fetch Response body. EventSource cannot send the bearer token or
// the X-Tenant-ID header, so streams are read with fetch + ReadableStream and parsed here.
// Spec followed: https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation

export interface SseMessage {
    event: string;
    data: string;
    id?: string;
}

/**
 * Reads `response.body` to completion, invoking `onMessage` for every dispatched event. Resolves when the
 * server closes the stream; rejects on a read error or when `signal` aborts.
 */
export async function readSseStream(
    response: Response,
    onMessage: (message: SseMessage) => void,
    signal?: AbortSignal
): Promise<void> {
    if (!response.body) {
        throw new Error('Response has no body to stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let buffer = '';
    let eventName = 'message';
    let dataLines: string[] = [];
    let lastEventId: string | undefined;

    const dispatch = () => {
        if (dataLines.length > 0) {
            onMessage({ event: eventName, data: dataLines.join('\n'), id: lastEventId });
        }
        eventName = 'message';
        dataLines = [];
    };

    const handleLine = (line: string) => {
        if (line === '') {
            dispatch();
            return;
        }
        if (line.startsWith(':')) {
            return; // comment / keep-alive
        }

        const colon = line.indexOf(':');
        const field = colon === -1 ? line : line.slice(0, colon);
        let value = colon === -1 ? '' : line.slice(colon + 1);
        if (value.startsWith(' ')) value = value.slice(1);

        switch (field) {
            case 'event':
                eventName = value;
                break;
            case 'data':
                dataLines.push(value);
                break;
            case 'id':
                lastEventId = value;
                break;
            default:
                // "retry" and unknown fields are ignored on purpose - reconnection is the caller's decision.
                break;
        }
    };

    const onAbort = () => {
        reader.cancel().catch(() => { /* already closed */ });
    };
    signal?.addEventListener('abort', onAbort, { once: true });

    try {
        for (;;) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            let newline = buffer.indexOf('\n');
            while (newline !== -1) {
                let line = buffer.slice(0, newline);
                if (line.endsWith('\r')) line = line.slice(0, -1);
                buffer = buffer.slice(newline + 1);
                handleLine(line);
                newline = buffer.indexOf('\n');
            }
        }

        // Flush a trailing event that was not terminated by a blank line.
        buffer += decoder.decode();
        if (buffer.length > 0) {
            handleLine(buffer.endsWith('\r') ? buffer.slice(0, -1) : buffer);
        }
        dispatch();
    } finally {
        signal?.removeEventListener('abort', onAbort);
        reader.releaseLock();
    }
}
