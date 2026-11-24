/**
 * Minimal Shopify Admin API access for storefront form actions (email capture,
 * complaint desk). Runs server-side only, on Oxygen.
 *
 * Auth: the store's custom app credentials, set as PRIVATE Oxygen environment
 * variables (never committed):
 *   PRIVATE_SHOPIFY_ADMIN_CLIENT_ID
 *   PRIVATE_SHOPIFY_ADMIN_CLIENT_SECRET
 * A short-lived Admin token is minted with the client-credentials grant and
 * cached per worker isolate until shortly before it expires.
 *
 * Every helper degrades gracefully: if the env vars are missing or Shopify
 * errors, it logs and returns `false` so the UI can still respond honestly.
 */

const API_VERSION = '2026-10';

type AdminEnv = Env & {
  PRIVATE_SHOPIFY_ADMIN_CLIENT_ID?: string;
  PRIVATE_SHOPIFY_ADMIN_CLIENT_SECRET?: string;
};

let cached: {token: string; expiresAt: number} | null = null;

function shopDomain(env: AdminEnv): string | null {
  return env.PUBLIC_STORE_DOMAIN || null;
}

async function adminToken(env: AdminEnv): Promise<string | null> {
  const id = env.PRIVATE_SHOPIFY_ADMIN_CLIENT_ID;
  const secret = env.PRIVATE_SHOPIFY_ADMIN_CLIENT_SECRET;
  const shop = shopDomain(env);
  if (!id || !secret || !shop) return null;
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: id,
      client_secret: secret,
    }),
  });
  if (!res.ok) {
    console.error('[admin] token request failed', res.status);
    return null;
  }
  const data = (await res.json()) as {
    access_token: string;
    expires_in?: number;
  };
  const ttl = (data.expires_in ?? 3600) * 1000;
  cached = {token: data.access_token, expiresAt: Date.now() + ttl - 5 * 60_000};
  return cached.token;
}

async function adminGraphql<T>(
  env: AdminEnv,
  query: string,
  variables: Record<string, unknown>,
): Promise<T | null> {
  const token = await adminToken(env);
  const shop = shopDomain(env);
  if (!token || !shop) return null;
  const res = await fetch(
    `https://${shop}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({query, variables}),
    },
  );
  if (!res.ok) {
    console.error('[admin] graphql failed', res.status);
    return null;
  }
  const json = (await res.json()) as {data?: T; errors?: unknown};
  if (json.errors) {
    console.error('[admin] graphql errors', JSON.stringify(json.errors));
    return null;
  }
  return json.data ?? null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: unknown): value is string {
  return (
    typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value)
  );
}

/**
 * Subscribe an email to marketing as a Shopify customer, tagged by source
 * (e.g. "savings-club"). Creates the customer, or — if one already exists —
 * updates their consent and adds the tag.
 */
export async function subscribeEmail(
  env: Env,
  email: string,
  tags: string[],
): Promise<boolean> {
  const consent = {
    marketingState: 'SUBSCRIBED',
    marketingOptInLevel: 'SINGLE_OPT_IN',
  };

  const created = await adminGraphql<{
    customerCreate: {
      customer: {id: string} | null;
      userErrors: {field: string[] | null; message: string}[];
    };
  }>(
    env,
    `mutation($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer { id }
        userErrors { field message }
      }
    }`,
    {input: {email, tags, emailMarketingConsent: consent}},
  );
  if (!created) return false;
  if (created.customerCreate.customer) return true;

  // Already a customer: find them, then update consent + tags.
  const found = await adminGraphql<{customers: {nodes: {id: string}[]}}>(
    env,
    `query($q: String!) { customers(first: 1, query: $q) { nodes { id } } }`,
    {q: `email:"${email.replace(/"/g, '')}"`},
  );
  const id = found?.customers.nodes[0]?.id;
  if (!id) {
    console.error(
      '[admin] customerCreate failed',
      JSON.stringify(created.customerCreate.userErrors),
    );
    return false;
  }
  const updated = await adminGraphql<{
    customerEmailMarketingConsentUpdate: {userErrors: {message: string}[]};
    tagsAdd: {userErrors: {message: string}[]};
  }>(
    env,
    `mutation($id: ID!, $consent: CustomerEmailMarketingConsentInput!, $tags: [String!]!) {
      customerEmailMarketingConsentUpdate(input: {customerId: $id, emailMarketingConsent: $consent}) {
        userErrors { message }
      }
      tagsAdd(id: $id, tags: $tags) { userErrors { message } }
    }`,
    {id, consent, tags},
  );
  return Boolean(
    updated &&
    !updated.customerEmailMarketingConsentUpdate.userErrors.length &&
    !updated.tagsAdd.userErrors.length,
  );
}

/** File a contact-form submission as an `aisle9_complaint` metaobject. */
export async function fileComplaint(
  env: Env,
  fields: {
    email: string;
    order_number?: string;
    nature?: string;
    severity?: string;
    body?: string;
  },
): Promise<boolean> {
  const entries = Object.entries({
    ...fields,
    submitted_at: new Date().toISOString(),
    status: 'new',
  })
    .filter(([, v]) => typeof v === 'string' && v.trim() !== '')
    .map(([key, value]) => ({key, value: String(value).slice(0, 5000)}));

  const data = await adminGraphql<{
    metaobjectCreate: {
      metaobject: {id: string} | null;
      userErrors: {message: string}[];
    };
  }>(
    env,
    `mutation($m: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $m) {
        metaobject { id }
        userErrors { message }
      }
    }`,
    {m: {type: 'aisle9_complaint', fields: entries}},
  );
  if (!data?.metaobjectCreate.metaobject) {
    console.error(
      '[admin] complaint not filed',
      JSON.stringify(data?.metaobjectCreate.userErrors ?? 'no admin access'),
    );
    return false;
  }
  return true;
}
