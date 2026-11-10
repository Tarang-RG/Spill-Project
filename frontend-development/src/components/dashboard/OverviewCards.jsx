import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

const cards = [
  {
    title: "You owe",
    amount: "₹0.00",
    icon: TrendingDown,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    title: "You're owed",
    amount: "₹0.00",
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Net balance",
    amount: "₹0.00",
    icon: Wallet,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
];

export default function OverviewCards() {
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