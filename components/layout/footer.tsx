import Image from "next/image";
import Link from "next/link";

const productLinks = [
  { label: "Product", href: "/product" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-[#020202]">
      {/* Subtle monochrome ambient highlight */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[160px] w-[420px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[90px]" />

      <div className="relative mx-auto max-w-[1300px] px-5 sm:px-6">
        {/* Main footer */}
        <div className="grid gap-10 border-b border-white/[0.07] py-9 sm:py-10 md:grid-cols-[2fr_1fr]">
          {/* Brand */}
          <div className="max-w-[320px]">
            <Link
              href="/"
              aria-label="TradeMirror home"
              className="inline-flex transition-opacity duration-200 hover:opacity-75"
            >
              <Image
                src="/logo/trade-mirror-logo.png"
                alt="TradeMirror"
                width={160}
                height={40}
                className="h-auto w-[140px] sm:w-[160px]"
              />
            </Link>

            <p className="mt-4 text-xs leading-6 text-white/45">
              The all-in-one trading journal built to help you understand your
              performance, analyze your edge, and trade with greater
              consistency.
            </p>
          </div>

          {/* Product links */}
          <div className="flex md:justify-end">
            <FooterColumn title="Explore" links={productLinks} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-white/35">
            © {new Date().getFullYear()} TradeMirror. All rights reserved.
          </p>

          <span className="inline-flex items-center gap-2 text-[11px] text-white/40">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
        {title}
      </h3>

      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="inline-flex text-xs text-white/55 transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}