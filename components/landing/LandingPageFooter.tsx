
const LandingPageFooter = () => (
    <footer className="border-t border-gray-700/60 mt-16">
        <div className="container mx-auto px-6 py-6 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} ByggPilot AB | <a href="/integritetspolicy" className="hover:underline">Integritetspolicy</a> | <a href="/anvandarvillkor" className="hover:underline">Användarvillkor</a>
        </div>
    </footer>
);

export default LandingPageFooter;
