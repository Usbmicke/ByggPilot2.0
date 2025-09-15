import { getServerSession } from "@/app/lib/auth";
import Link from "next/link";
import { LoginButton, LogoutButton } from "@/app/components/AuthButtons";

const Nav = async () => {
    const session = await getServerSession();
    const user = session?.user;

    return (
        <header className="bg-gray-800 text-white p-4 shadow-md">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href={user ? "/dashboard" : "/"} passHref>
                    <span className="text-2xl font-bold hover:text-gray-300 cursor-pointer">Byggpilot</span>
                </Link>
                
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <Link href="/dashboard" passHref><span className="hover:text-gray-300 cursor-pointer">Dashboard</span></Link>
                            <Link href="/customers" passHref><span className="hover:text-gray-300 cursor-pointer">Kunder</span></Link>
                            <Link href="/projects" passHref><span className="hover:text-gray-300 cursor-pointer">Projekt</span></Link>
                            <Link href="/archive" passHref><span className="hover:text-gray-300 cursor-pointer">Arkiv</span></Link> {/* NY LÄNK */}
                            <span className="font-semibold">{user.name}</span>
                            <LogoutButton />
                        </>
                    ) : (
                        <LoginButton />
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Nav;
