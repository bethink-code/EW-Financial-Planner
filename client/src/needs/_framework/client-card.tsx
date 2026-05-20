import headerImage from "@assets/EW Header_1753945516780.png";

/**
 * Client header band — the demo-image strip at the very top of every needs
 * workspace. Placeholder until a real client-record component lands; kept as
 * its own section so the framework layout reads cleanly.
 */
export function ClientCard() {
  return (
    <section className="w-full overflow-x-auto" aria-label="Client card">
      <div className="pl-6">
        <img
          src={headerImage}
          alt="Client Header"
          className="block"
          style={{ width: "auto", height: "auto" }}
        />
      </div>
    </section>
  );
}
