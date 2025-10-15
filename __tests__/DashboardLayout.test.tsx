
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardLayout from '@/app/dashboard/layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mocka beroenden
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mocka barnkomponenter för att isolera layouten
jest.mock('@/components/layout/Sidebar', () => () => <div data-testid="sidebar"></div>);
jest.mock('@/components/layout/Header', () => () => <div data-testid="header"></div>);
jest.mock('@/components/tour/GuidedTour', () => () => <div data-testid="guided-tour"></div>);
jest.mock('@/components/layout/ChatBanner', () => () => <div data-testid="chat-banner"></div>);

describe('DashboardLayout', () => {
  let mockRouterPush;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('visar laddningsstatus korrekt', () => {
    (useSession as jest.Mock).mockReturnValue({ status: 'loading', data: null });
    render(<DashboardLayout><div>Barninnehåll</div></DashboardLayout>);
    expect(screen.getByText('Laddar session...')).toBeInTheDocument();
  });

  it('omdirigerar till /onboarding om användaren är autentiserad men inte har slutfört onboarding', async () => {
    (useSession as jest.Mock).mockReturnValue({
      status: 'authenticated',
      data: { user: { id: '123', name: 'Test User', onboardingComplete: false } },
    });

    render(<DashboardLayout><div>Barninnehåll</div></DashboardLayout>);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('inte omdirigerar och renderar innehåll om användaren har slutfört onboarding', () => {
    (useSession as jest.Mock).mockReturnValue({
      status: 'authenticated',
      data: { user: { id: '123', name: 'Test User', onboardingComplete: true } },
    });

    render(<DashboardLayout><div>Barninnehåll</div></DashboardLayout>);

    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Barninnehåll')).toBeInTheDocument();
  });

  it('visar omdirigeringsmeddelande medan omdirigering till onboarding sker', () => {
    (useSession as jest.Mock).mockReturnValue({
        status: 'authenticated',
        data: { user: { id: '123', name: 'Test User', onboardingComplete: false } },
    });
  
    render(<DashboardLayout><div>Barninnehåll</div></DashboardLayout>);
    
    expect(screen.getByText('Omdirigerar...')).toBeInTheDocument();
    expect(screen.queryByText('Barninnehåll')).not.toBeInTheDocument();
  });
});
