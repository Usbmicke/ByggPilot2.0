
'use client';

import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

const TimeReportingPage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
                <h1 className="text-2xl font-bold leading-6 text-text-primary">Tidrapportering</h1>
                <p className="mt-2 text-sm text-text-secondary">
                    Håll koll på arbetade timmar för varje projekt och anställd.
                </p>
            </div>
        </div>

        <div className="text-center py-20 border-2 border-dashed border-border-primary rounded-lg mt-8">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-semibold text-text-primary">Kommer Snart</h3>
            <p className="mt-1 text-sm text-text-secondary">Vi arbetar på en kraftfull och enkel tidrapporteringsfunktion.</p>
        </div>
    </div>
  );
};

export default TimeReportingPage;
