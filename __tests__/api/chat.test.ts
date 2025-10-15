
import { POST } from '@/app/api/chat/route';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';
import { NextRequest } from 'next/server';
import { CoreMessage } from 'ai';

// Mocka de externa beroendena
jest.mock('@upstash/ratelimit');
jest.mock('@/lib/redis');
jest.mock('next-auth');
jest.mock('@/lib/admin');
jest.mock('ai', () => ({
    ...jest.requireActual('ai'), // behåll alla andra exporter
    streamText: jest.fn(() => Promise.resolve({ toAIStream: () => ({}) })),
    embed: jest.fn(() => Promise.resolve({ embedding: [0.1, 0.2] })),
}));
jest.mock('@/lib/pinecone', () => ({
    getPineconeClient: jest.fn(() => ({
        index: jest.fn(() => ({
            query: jest.fn(() => Promise.resolve({ matches: [] }))
        }))
    }))
}));

const mockRatelimit = Ratelimit as jest.MockedClass<typeof Ratelimit>;

describe('Chat API - Rate Limiting', () => {

    beforeEach(() => {
        // Återställ mocks före varje test
        mockRatelimit.mockClear();
    });

    it('ska blockera ett anrop när hastighetsgränsen överskrids', async () => {
        // Arrangera: Sätt upp mocken för att simulera att gränsen är nådd
        const limitMock = jest.fn().mockResolvedValue({ success: false, limit: 10, remaining: 0 });
        mockRatelimit.mockImplementation(() => ({
            limit: limitMock,
        } as any));

        const req = new NextRequest('http://localhost/api/chat', {
            method: 'POST',
            body: JSON.stringify({ messages: [{ role: 'user', content: 'test' }], chatId: '123' }),
            headers: { 'Content-Type': 'application/json' },
        });

        // Agera: Anropa API-endpointen
        const response = await POST(req);

        // Assertera: Kontrollera att svaret är ett 429-fel
        expect(response.status).toBe(429);
        const json = await response.json();
        expect(json).toEqual({ error: 'Too many requests.' });
        expect(limitMock).toHaveBeenCalledWith('127.0.0.1'); // Verifiera att ratelimitern anropades med rätt IP
    });

    it('ska tillåta ett anrop när hastighetsgränsen inte har överskridits', async () => {
        // Arrangera: Sätt upp mocken för att simulera att anropet är tillåtet
        const limitMock = jest.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9 });
        mockRatelimit.mockImplementation(() => ({
            limit: limitMock,
        } as any));

        // Mocka den fortsatta exekveringen så att den inte kastar fel
        require('next-auth').auth.mockResolvedValue({ user: { id: 'test-user' } });

        const req = new NextRequest('http://localhost/api/chat', {
            method: 'POST',
            body: JSON.stringify({ messages: [{ role: 'user', content: 'test' }], chatId: '123' }),
            headers: { 'Content-Type': 'application/json' },
        });

        // Agera: Anropa API-endpointen
        const response = await POST(req);

        // Assertera: Kontrollera att svaret INTE är ett 429-fel
        // Status 200 indikerar att det gick vidare till streaming-logiken
        expect(response.status).toBe(200);
        expect(limitMock).toHaveBeenCalledWith('127.0.0.1');
    });
});
