export function MockShopNotice() {
  return (
    <section
      className="mock-shop-notice"
      aria-labelledby="mock-shop-notice-heading"
    >
      <div className="inner">
        <h2 id="mock-shop-notice-heading">STAGING SHELVES (DEV NOTICE)</h2>
        <p>
          These are mock products — no real store is connected to this project
          yet. This notice disappears once one is.
        </p>
        <p>
          Link a store by running <code>npx shopify hydrogen link</code> in your
          terminal.
        </p>
      </div>
    </section>
  );
}
