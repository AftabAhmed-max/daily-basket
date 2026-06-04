import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export default function CategoryStrip() {
  return (
    <div className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 py-1">
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/category/${c.slug}`}
          className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-surface px-3 py-2.5 text-center active:scale-95 transition"
        >
          <span className="text-2xl">{c.emoji}</span>
          <span className="w-14 text-[10px] font-semibold leading-tight text-ink">
            {c.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
