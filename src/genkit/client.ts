
// Denna fil är avsedd för klient-sidan och ska ENDAST exportera typer och flödesdefinitioner.
// Den ska INTE innehålla någon server-kod eller importera filer som innehåller server-kod.

import { onboardingFlow } from './flows/onboardingFlow';
import { getUserProfileFlow } from './flows/getUserProfileFlow';

// Exportera flödesobjekten så att de kan användas av useGenkit-hooks på klientsidan.
// Detta exponerar bara flödets "schema" (namn, input/output-typer), inte dess implementation.
export {
    onboardingFlow,
    getUserProfileFlow,
};
