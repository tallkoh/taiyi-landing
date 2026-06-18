import { createClerkClient, verifyToken as clerkVerifyToken } from '@clerk/backend';

let cachedClient: ReturnType<typeof createClerkClient> | null = null;

function client() {
  if (!cachedClient) {
    cachedClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    });
  }
  return cachedClient;
}

export interface VerifiedClerkUser {
  userId: string;
  email: string;
}

// Verifies a Clerk session JWT (passed from the browser as a Bearer token
// or in an Authorization header) and returns the canonical user identity.
// Returns null if the token is invalid, expired, or the user has no
// verified primary email.
export async function verifyClerkSession(token: string | undefined): Promise<VerifiedClerkUser | null> {
  if (!token) return null;

  try {
    const claims = await clerkVerifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const userId = claims.sub;
    if (!userId) return null;

    const user = await client().users.getUser(userId);
    const primaryId = user.primaryEmailAddressId;
    const primary = user.emailAddresses.find(e => e.id === primaryId) ?? user.emailAddresses[0];
    if (!primary?.emailAddress) return null;

    return { userId, email: primary.emailAddress.toLowerCase() };
  } catch (err) {
    console.error('Clerk token verification failed', err);
    return null;
  }
}
