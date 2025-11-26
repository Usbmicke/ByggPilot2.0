// src/app/(main)/dashboard/page.tsx
import { DashboardWidget } from '@/widgets/DashboardWidget';

/**
 * This is a Next.js Page.
 * According to our architecture, it should only be responsible for routing and layout.
 * It imports and renders the main widget for this page.
 */
export default function DashboardPage() {
  return <DashboardWidget />;
}
