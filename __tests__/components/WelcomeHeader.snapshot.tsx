
import React from 'react';
import { render } from '@testing-library/react';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import { useSession } from 'next-auth/react';

// Mocka useSession-hooken
jest.mock('next-auth/react');

const mockUseSession = useSession as jest.Mock;

describe('WelcomeHeader Component', () => {

    it('ska matcha snapshot för en inloggad användare', () => {
        // Arrangera: Simulera en giltig session
        mockUseSession.mockReturnValue({
            data: { user: { name: 'Micke anka' } },
            status: 'authenticated',
        });

        // Agera: Rendera komponenten
        const { container } = render(<WelcomeHeader />);

        // Assertera: Jämför den renderade komponenten med den sparade snapshotten
        expect(container).toMatchSnapshot();
    });

    it('ska matcha snapshot för en gästanvändare (session laddas)', () => {
        // Arrangera: Simulera att sessionen fortfarande laddas
        mockUseSession.mockReturnValue({
            data: null,
            status: 'loading',
        });

        const { container } = render(<WelcomeHeader />);

        // Assertera: Jämför med snapshot för laddnings-state
        expect(container).toMatchSnapshot();
    });

    it('ska matcha snapshot för en oinloggad användare', () => {
        // Arrangera: Simulera en oinloggad användare
        mockUseSession.mockReturnValue({
            data: null,
            status: 'unauthenticated',
        });

        const { container } = render(<WelcomeHeader />);

        // Assertera: Jämför med snapshot för oinloggad state
        expect(container).toMatchSnapshot();
    });

});
