import type {Route} from './+types/pages.faq';
import {BRAND} from '~/lib/brand';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `${BRAND.name} — QUESTIONS`},
    {
      name: 'description',
      content:
        'Shipping, returns, sizing, printing, and the bulk discount, answered in the order received.',
    },
  ];
};

const FAQS = [
  {
    q: 'HOW DOES THE BULK DISCOUNT WORK?',
    a: 'Put shirts in your basket. Two shirts take 10% off, three take 20% off, four or more take 30% off. It applies automatically at checkout — no code, and you can mix and match any designs. The math happens whether or not you notice it.',
  },
  {
    q: 'WHEN WILL MY ORDER SHIP?',
    a: 'Every shirt is printed after you order it. Printing takes 2–5 business days, then transit. Most US orders arrive within 5–7 business days of printing. You will get a tracking number when it leaves the facility.',
  },
  {
    q: 'HOW MUCH IS SHIPPING?',
    a: 'Calculated at checkout by weight and destination. US orders over $100 ship free, which — given the bulk ladder — is achievable if you commit.',
  },
  {
    q: 'WHAT ARE THE SHIRTS LIKE?',
    a: 'Heavyweight unisex cotton tees, printed with water-based inks. Sizes S through 3XL. Colorways vary by design — generally white, black, and ash grey. See the size guide before guessing.',
  },
  {
    q: 'CAN I RETURN A SHIRT?',
    a: 'Yes. 30 days from delivery, unworn and unwashed. Start at the customer service desk (the contact page). Refunds go back to the original payment method once the shirt is inspected by someone who takes it more seriously than it deserves.',
  },
  {
    q: 'MY SHIRT ARRIVED DAMAGED OR MISPRINTED.',
    a: 'Not technically a question, but understood. Send a photo of the problem to customer service within 30 days and a replacement will be printed at no charge. The photo is required. The apology is implied.',
  },
  {
    q: 'HOW DO I WASH IT?',
    a: 'Inside out, cold water, mild detergent. Hang dry or tumble low. Do not iron the print. Treated properly, the shirt will outlast the phase of your life it describes.',
  },
  {
    q: 'DO YOU RESTOCK?',
    a: 'New designs shelve weekly. Because everything is printed to order, designs do not "sell out" — but they do get discontinued without ceremony. If you are attached to one, act like it.',
  },
  {
    q: 'IS THE STORE REAL?',
    a: 'The shirts are real. The prices are real. The store is a concept. If you have further questions about the nature of retail, the customer service desk will read them in the order received.',
  },
] as const;

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="label-type text-ink/50">POSTED BY THE ENTRANCE</p>
      <h1 className="sign-type mt-2 text-4xl">QUESTIONS</h1>
      <p className="mt-4 text-ink/70">
        Answered in the order received. Answers are final but polite.
      </p>

      <div className="mt-10 flex flex-col gap-2">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="group border-2 border-ink bg-white open:bg-fluorescent"
          >
            <summary className="cursor-pointer list-none p-4">
              <span className="sign-type flex items-center justify-between gap-4 text-sm">
                {item.q}
                <span
                  aria-hidden
                  className="text-lg leading-none text-signage group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="border-t-2 border-ink/20 p-4 text-sm text-ink/80">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <p className="label-type mt-8 text-ink/50">
        UNANSWERED? TAKE IT TO THE{' '}
        <a className="text-signage underline" href="/pages/contact">
          CUSTOMER SERVICE DESK
        </a>
        .
      </p>
    </div>
  );
}
