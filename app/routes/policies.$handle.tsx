import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/policies.$handle';
import {BRAND, POLICY_FALLBACKS} from '~/lib/brand';

/** Shopify shop-policy handle → the shop field that holds it. */
const POLICY_FIELDS: Record<string, string> = {
  'privacy-policy': 'privacyPolicy',
  'shipping-policy': 'shippingPolicy',
  'terms-of-service': 'termsOfService',
  'refund-policy': 'refundPolicy',
};

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `${BRAND.name} — ${data?.policy.title ?? 'POLICY'}`},
    {
      name: 'description',
      content: `${data?.policy.title ?? 'Store policy'} — ${BRAND.name}.`,
    },
  ];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const handle = params.handle;
  if (!handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = POLICY_FIELDS[handle];

  // Try the real Shopify shop policy first (only for the four known handles).
  if (policyName) {
    try {
      const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
        variables: {
          privacyPolicy: policyName === 'privacyPolicy',
          shippingPolicy: policyName === 'shippingPolicy',
          termsOfService: policyName === 'termsOfService',
          refundPolicy: policyName === 'refundPolicy',
          language: context.storefront.i18n?.language,
        },
      });
      const shopPolicy = (data.shop as Record<string, {title: string; body: string} | null> | undefined)?.[
        policyName
      ];
      if (shopPolicy?.body) {
        return {
          policy: {title: shopPolicy.title, body: shopPolicy.body},
          eyebrow: 'POSTED AT THE RETURNS DESK',
          isFallback: false,
        };
      }
    } catch (error) {
      // Shop policy unavailable — fall through to the branded fallback.
      console.error(error);
    }
  }

  // Branded fallback so the legal links always resolve (never a 404).
  const fb = POLICY_FALLBACKS[handle];
  if (fb) {
    return {
      policy: {title: fb.title, body: fb.bodyHtml},
      eyebrow: fb.eyebrow,
      isFallback: true,
    };
  }

  throw new Response('Could not find the policy', {status: 404});
}

export default function Policy() {
  const {policy, eyebrow} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link
        className="label-type text-ink/50 hover:text-signage"
        prefetch="intent"
        to="/policies"
      >
        ← BACK TO STORE POLICIES
      </Link>
      <p className="label-type mt-4 text-ink/50">{eyebrow}</p>
      <h1 className="sign-type mt-2 text-4xl">{policy.title}</h1>
      <div
        className="a9-prose mt-8"
        dangerouslySetInnerHTML={{__html: policy.body}}
      />
      <div className="mt-12 border-t-2 border-ink pt-6">
        <Link className="btn btn-outline" prefetch="intent" to="/pages/faq">
          MORE AT THE SERVICE DESK
        </Link>
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
` as const;
