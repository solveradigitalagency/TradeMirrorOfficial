import Image from "next/image";
import Link from "next/link";

const productLinks = [
  { label: "Product", href: "/product" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#010409]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[180px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/[0.04] blur-[80px]" />

      <div className="relative mx-auto max-w-[1300px] px-5 sm:px-6">
        {/* Main footer */}
        <div className="grid gap-8 border-b border-white/[0.06] py-7 sm:py-8 md:grid-cols-[2fr_1fr]">
          {/* Brand */}
          <div className="max-w-[300px]">
            <Link
              href="/"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <Image
                src="/logo/trade-mirror-logo.png"
                alt="TradeMirror"
                width={160}
                height={40}
                className="h-auto w-[140px] sm:w-[160px]"
              />
            </Link>

            <p className="mt-3 text-xs leading-5 text-white/35">
              The all-in-one trading journal built to help you see your
              performance, analyze your edge, and trade with more consistency.
            </p>
          </div>

          {/* Product */}
          <div className="flex md:justify-end">
            <FooterColumn title="Product" links={productLinks} />
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-white/25">
            © {new Date().getFullYear()} TradeMirror. All rights reserved.
          </p>

          <span className="flex items-center gap-2 text-[10px] text-white/25">
            <span className="h-1 w-1 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
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
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
        {title}
      </h3>

      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-xs text-white/35 transition-colors hover:text-white/75"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}