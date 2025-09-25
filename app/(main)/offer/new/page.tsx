
import { getProjects } from "@/app/services/projectService";
import CreateInvoiceView from "@/app/components/views/CreateInvoiceView";

// Denna sida renderas på servern för att hämta projektlistan
export default async function NewOfferPage() {
    const projects = await getProjects();

    return (
        <CreateInvoiceView projects={projects} />
    );
}
