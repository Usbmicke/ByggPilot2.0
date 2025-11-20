
import {
    Home, FolderKanban, Clock, FileText, Users
} from 'lucide-react';

export const navItems = [
    { href: '/dashboard', icon: Home, label: 'Översikt' },
    { href: '/dashboard/projects', icon: FolderKanban, label: 'Projekt' },
    { href: '/dashboard/time-reports', icon: Clock, label: 'Tidrapportering' },
    { href: '/dashboard/documents', icon: FileText, label: 'Dokument' },
    { href: '/dashboard/customers', icon: Users, label: 'Kunder' },
];
