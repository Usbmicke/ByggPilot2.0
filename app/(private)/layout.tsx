'use client';

import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { AuthGuard } from '../../providers/AuthGuard';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-900 text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
