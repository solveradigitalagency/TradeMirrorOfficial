import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-[76px] border-b border-white/[0.045] bg-[#02060b]/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-7 lg:px-8 xl:px-10">

        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo/trade-mirror-logo.png"
            alt="TradeMirror"
            width={220}
            height={64}
            priority
            className="h-auto w-[210px]"
          />
        </Link>

        {/* CENTER NAV */}
        <nav className="sticky top-0 z-50 absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
          <Link
            href="/product"
            className="text-[15px] font-medium text-white/55 transition-colors hover:text-white"
          >
            Product
          </Link>

          <Link
            href="/features"
            className="text-[15px] font-medium text-white/55 transition-colors hover:text-white"
          >
            Features
          </Link>

          <Link
            href="/pricing"
            className="text-[15px] font-medium text-white/55 transition-colors hover:text-white"
          >
            Pricing
          </Link>
        </nav>

        {/* RIGHT SIDE */}
        <div className="ml-auto flex items-center gap-5">
          <Link
            href="/login"
            className="text-[15px] font-medium text-white/75 transition-colors hover:text-white"
          >
            Sign in
          </Link>

          <Link
            href="/signup"
            className="flex h-10 items-center rounded-lg bg-[#2385f5] px-5 text-[14px] font-semibold text-white shadow-[0_8px_25px_rgba(35,133,245,0.18)] transition-all duration-200 hover:bg-[#318ff7] hover:shadow-[0_10px_30px_rgba(35,133,245,0.28)]"
          >
            Start for free
          </Link>
        </div>
      </div>
    </header>
  );
}