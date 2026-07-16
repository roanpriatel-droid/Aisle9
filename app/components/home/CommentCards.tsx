/**
 * "CUSTOMER COMMENT CARDS" — reviews section.
 *
 * HONEST EMPTY STATE: the store just opened and has no reviews. We render
 * blank comment cards (which is also the joke) instead of fabricating
 * ratings. When a review platform is wired up (Judge.me / Loox / Shopify
 * reviews), replace CARDS with real data and render <Stars rating={...}/>.
 */

function Stars({rating}: {rating: number}) {
  return (
    <span
      className="text-sm tracking-widest text-signage"
      aria-label={`${rating} out of 5 stars`}
    >
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  );
}

const BLANK_CARDS = 3;

export function CommentCards() {
  return (
    <section
      aria-labelledby="comment-cards-heading"
      className="border-b-2 border-ink bg-fluorescent"
    >
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="label-type text-ink/50">FEEDBACK</p>
        <h2 id="comment-cards-heading" className="sign-type mt-2 text-3xl sm:text-4xl">
          CUSTOMER COMMENT CARDS
        </h2>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {Array.from({length: BLANK_CARDS}).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 border-2 border-ink bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="label-type text-ink/40">COMMENT CARD</span>
                <span className="text-sm tracking-widest text-ink/25" aria-hidden>
                  ☆☆☆☆☆
                </span>
              </div>
              {/* ruled lines, waiting to be filled in */}
              <div aria-hidden className="flex flex-col gap-3 pt-1">
                <span className="h-px bg-ink/20" />
                <span className="h-px bg-ink/20" />
                <span className="h-px bg-ink/20" />
              </div>
              <span className="label-type text-ink/30">NAME: ________</span>
            </div>
          ))}
        </div>

        <p className="label-type mt-6 text-ink/50">
          NO COMMENTS YET. WE JUST OPENED. BUY A SHIRT AND SAY SOMETHING.
        </p>
      </div>
    </section>
  );
}
