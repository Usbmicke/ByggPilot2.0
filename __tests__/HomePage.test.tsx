
import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mocka beroenden: Vi vill inte att testet ska försöka använda riktiga next-auth eller next-router.
// Vi tvingar dem att returnera det vi vill, i detta fall ett "laddar"-tillstånd.
jest.mock('next-auth/react');
jest.mock('next/navigation');

describe('HomePage', () => {
  it('renderas utan att krascha och visar "Omdirigerar..."', () => {
    // Arrange: Sätt upp våra mocks för detta specifika test
    (useSession as jest.Mock).mockReturnValue({ status: 'loading' });
    (useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() });

    // Act: Rendera komponenten
    render(<HomePage />);

    // Assert: Verifiera att texten finns i det renderade dokumentet
    expect(screen.getByText('Omdirigerar...')).toBeInTheDocument();
  });
});
