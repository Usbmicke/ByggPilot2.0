
import {
  HomeIcon,
  FolderIcon,
  UsersIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  SparklesIcon, // Importera den nya ikonen
} from '@heroicons/react/24/outline';

/**
 * Denna fil centraliserar navigationsstrukturen för applikationen.
 * Att ha den på ett ställe gör det enkelt att uppdatera och återanvända
 * i olika delar av UI:t (t.ex. sidofält, mobilmenyer etc.).
 */

export interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & { title?: string, titleId?: string } & React.RefAttributes<SVGSVGElement>>;
  id?: string; // För t.ex. onboarding-tours
}

export const primaryNavigation: NavItem[] = [
  { name: 'Översikt', href: '/dashboard', icon: HomeIcon },
  { name: 'Projekt', href: '/dashboard/projects', icon: FolderIcon },
  // Ny länk till specialfunktioner!
  { name: 'Specialfunktioner', href: '/dashboard/special-functions', icon: SparklesIcon }, 
  { name: 'Dokument', href: '/dashboard/dokument', icon: DocumentDuplicateIcon },
  { name: 'Kunder', href: '/dashboard/customers', icon: UsersIcon, id: 'tour-step-3-customers' },
];
