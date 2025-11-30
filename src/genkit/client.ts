
// Detta är en "barrel"-fil som exporterar flöden specifikt för klient-användning.
// Den ser till att endast flödesdefinitionerna, och inte deras server-side implementation,
// blir en del av klientens kod-bundle.
// Detta är avgörande för att undvika "server-only"-paket i klient-koden.

export { onboardingFlow } from './flows/onboardingFlow';
export { getUserProfileFlow } from './flows/getUserProfileFlow';
export { createCompanyFolderFlow } from './flows/createCompanyFolderFlow';
