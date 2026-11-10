import { Wallet } from "lucide-react";

export default function Left() {
  return (
    <section className="bg-slate-950 text-white flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16">
      <div className="mb-16">
        <h1 className="text-4xl font-bold">
          Spill<span className="text-green-400">.</span>
        </h1>
      </div>

      <div className="max-w-xl">
        <p className="text-green-400 font-semibold tracking-widest uppercase text-sm mb-6">
          Simplifying shared expenses
        </p>

        <h2 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
          Money shouldn't complicate
          <span className="text-green-400"> friendships.</span>
        </h2>

        <p className="mt-8 text-lg text-slate-400 leading-relaxed max-w-lg">
          Split expenses, manage group spending and keep track of who owes what.
          All in one simple place.
        </p>

        <div className="mt-12 flex items-center gap-3 text-slate-400">
          <div className="bg-green-500/10 p-3 rounded-xl">
            <Wallet className="text-green-400" size={24} />
          </div>

          <span className="text-sm">Split bills. Not friendships.</span>
        </div>
      </div>

      <p className="mt-20 text-sm text-slate-600">
        © {new Date().getFullYear()} Spill. All rights reserved.
      </p>
    </section>
  );
}