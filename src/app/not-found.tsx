import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-display font-normal">404</p>
      <p className="text-lead text-gray-50">This page could not be found.</p>
      <Link
        href="/"
        className="rounded-full bg-black px-5 py-2.5 text-xs font-medium tracking-[0.08em] text-white uppercase"
      >
        Back home
      </Link>
    </main>
  );
}
