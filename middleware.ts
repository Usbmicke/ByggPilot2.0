import { withAuth } from "next-auth/middleware";

// withAuth will automatically handle the redirection logic.
export default withAuth;

// This config specifies which routes should be protected.
export const config = {
  matcher: ['/dashboard/:path*'],
};
