import { Link } from "wouter";
import { ChevronDown, IdCard, MoreHorizontal } from "lucide-react";

/**
 * Client-level header: identity card + section menu strip, rebuilt as
 * responsive HTML from the static header PNG (colours sampled from the
 * image). The identity card is display-only in the prototype — its buttons
 * are inert. In the menu strip, only sections that exist in the prototype
 * (Portfolio, Financial planning) navigate; the rest are inert labels.
 *
 * Used by the financial-planning pages and the portfolio section. The
 * DEL/Retirement need pages keep their own copy of the original image
 * (needs/_framework/client-card.tsx) — reference chrome, left untouched.
 */

interface NavItem {
  label: string;
  key?: "portfolio" | "financial-planning";
  href?: string;
}

const navItems: NavItem[] = [
  { label: "Home" },
  { label: "Activity dashboard" },
  { label: "Work portal" },
  { label: "Client info" },
  { label: "Portfolio", key: "portfolio", href: "/portfolio" },
  { label: "Assets and liabilities" },
  { label: "Budget" },
  {
    label: "Financial planning",
    key: "financial-planning",
    href: "/financial-plans",
  },
  { label: "Bna" },
];

export interface ClientIdentity {
  name: string;
  /** Reference / status / company line shown beside the name. */
  refLine: string;
  /** Age / marital detail line under the name. */
  detailLine: string;
}

const DEFAULT_CLIENT: ClientIdentity = {
  name: "Donald Edward",
  refLine: "Demo/1/12345 / Client / Client's company",
  detailLine: "52 years old / Married ANC with accrual",
};

interface ClientHeaderProps {
  active: "portfolio" | "financial-planning";
  client?: ClientIdentity;
}

export function ClientHeader({
  active,
  client = DEFAULT_CLIENT,
}: ClientHeaderProps) {
  return (
    <div className="w-full px-6">
      {/* Client identity card (display-only) */}
      <div className="rounded-lg bg-[#D4E8F4] px-8 py-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <IdCard className="h-6 w-6 shrink-0 text-[#094161]" />
          <span className="text-lg font-bold leading-tight text-[#094161]">
            {client.name}
          </span>
          <span className="text-xs text-[#29688D]">{client.refLine}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="pl-9 text-[13px] text-[#114E72]">
            {client.detailLine}
          </span>
          <button
            type="button"
            className="flex h-[30px] items-center gap-1.5 rounded-md bg-white px-3 text-[13px] text-[#1B5C82]"
          >
            Related entities
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="flex h-[30px] items-center gap-1.5 rounded-md bg-[#A5CDE3] px-3 text-[13px] text-[#1B5C82]"
            >
              Choose another client
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="flex h-[30px] items-center rounded-md bg-white px-3 text-[13px] text-[#1B5C82]"
            >
              New client
            </button>
            <button
              type="button"
              className="flex h-[30px] w-10 items-center justify-center rounded-md bg-white text-[#1B5C82]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Section menu strip */}
      <nav className="mt-2 flex flex-wrap items-center gap-x-[17px] gap-y-1 rounded bg-[#D4E8F4] px-8 py-1.5 text-[13px]">
        {navItems.map((item) =>
          item.key === active ? (
            <span key={item.label} className="font-semibold text-[#016991]">
              {item.label}
            </span>
          ) : item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className="text-[#4C8DB4] hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span key={item.label} className="text-[#4C8DB4]">
              {item.label}
            </span>
          )
        )}
      </nav>
    </div>
  );
}
