import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Authorization guard for admin-only server actions and route handlers.
 *
 * Server actions compile to public HTTP endpoints, so every mutating/admin
 * action MUST call this first. Throws if there is no authenticated admin
 * session. Only accounts in the Admin collection can obtain a session via the
 * credentials provider, so a valid session is sufficient to authorize.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
