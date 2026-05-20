interface NeedFormProps {
  children: React.ReactNode;
}

/**
 * The body slot under the navigation tabs — wraps each page's form card and
 * reserves clearance for the pinned action bar at the bottom of the viewport.
 */
export function NeedForm({ children }: NeedFormProps) {
  return (
    <section aria-label="Need form" style={{ paddingBottom: "80px" }}>
      {children}
    </section>
  );
}
