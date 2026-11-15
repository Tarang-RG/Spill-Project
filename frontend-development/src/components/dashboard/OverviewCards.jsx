import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default function OverviewCards({
    youOwe = 0,
    youreOwed = 0,
}) {
  const netBalance = youreOwed - youOwe;
  const cards = [
        {
            title: "You owe",
            amount: youOwe,
            icon: TrendingDown,
            color: "text-red-500",
            bg: "bg-red-50",
        },
        {
            title: "You're owed",
            amount: youreOwed,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            title: "Net balance",
            amount: netBalance,
            icon: Wallet,
            color: netBalance >= 0
                ? "text-blue-600"
                : "text-red-500",
            bg: netBalance >= 0
                ? "bg-blue-50"
                : "bg-red-50",
        },
    ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="bg-white p-6 rounded-2xl border border-slate-200"
          >
            <div className="flex justify-between items-center">
              <p className="text-slate-500 font-medium">{card.title}</p>

              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <Icon size={21} />
              </div>
            </div>

            <h3 className="text-3xl font-bold text-slate-900 mt-5">
              {card.amount}
            </h3>
          </div>
        );
      })}
    </div>
  );
}