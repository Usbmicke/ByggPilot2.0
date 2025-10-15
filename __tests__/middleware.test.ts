
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Mocka getToken-funktionen
jest.mock('next-auth/jwt');

const mockGetToken = getToken as jest.Mock;

describe('Middleware Logic', () => {

    it('ska omdirigera en oinloggad användare från /dashboard till startsidan', async () => {
        // Arrangera: Simulera en oinloggad användare (getToken returnerar null)
        mockGetToken.mockResolvedValue(null);
        const req = new NextRequest('http://localhost/dashboard');

        // Agera: Kör middleware
        const response = await middleware(req);

        // Assertera: Förvänta en omdirigering till startsidan ('/')
        expect(response.status).toBe(307); // 307 är standard för omdirigeringar i Next.js middleware
        expect(response.headers.get('Location')).toBe('http://localhost/');
    });

    it('ska tvinga en inloggad användare utan slutförd onboarding till /onboarding', async () => {
        // Arrangera: Simulera en inloggad användare som INTE har slutfört onboarding
        mockGetToken.mockResolvedValue({ 
            name: 'Test User', 
            email: 'test@test.com', 
            onboardingComplete: false 
        });
        const req = new NextRequest('http://localhost/dashboard'); // Försöker nå dashboarden

        // Agera: Kör middleware
        const response = await middleware(req);

        // Assertera: Förvänta en omdirigering till /onboarding
        expect(response.status).toBe(307);
        expect(response.headers.get('Location')).toBe('http://localhost/onboarding');
    });

    it('ska omdirigera en färdig användare från /onboarding till /dashboard', async () => {
        // Arrangera: Simulera en inloggad användare som HAR slutfört onboarding
        mockGetToken.mockResolvedValue({ 
            name: 'Test User', 
            email: 'test@test.com', 
            onboardingComplete: true 
        });
        const req = new NextRequest('http://localhost/onboarding'); // Försöker nå onboarding-sidan i onödan

        // Agera: Kör middleware
        const response = await middleware(req);

        // Assertera: Förvänta en omdirigering till /dashboard
        expect(response.status).toBe(307);
        expect(response.headers.get('Location')).toBe('http://localhost/dashboard');
    });

    it('ska tillåta en färdig användare att nå /dashboard', async () => {
        // Arrangera: Simulera en inloggad, färdig användare som navigerar korrekt
        mockGetToken.mockResolvedValue({ 
            name: 'Test User', 
            email: 'test@test.com', 
            onboardingComplete: true 
        });
        const req = new NextRequest('http://localhost/dashboard');

        // Agera: Kör middleware
        const response = await middleware(req);

        // Assertera: Förvänta att middleware inte gör något (anropar NextResponse.next())
        // Ett `response`-objekt med status 200 indikerar att förfrågan passerade.
        expect(response.status).toBe(200);
    });

    it('ska tillåta en oinloggad användare att nå startsidan', async () => {
        // Arrangera: Simulera en oinloggad användare
        mockGetToken.mockResolvedValue(null);
        const req = new NextRequest('http://localhost/'); // Går till startsidan

        // Agera: Kör middleware
        const response = await middleware(req);

        // Assertera: Förvänta att förfrågan passerar
        expect(response.status).toBe(200);
    });

});
