
import { useMemo, useState } from "react";
import { X, IndianRupee, Receipt } from "lucide-react";
import { createExpense } from "../../services/groupService";

export default function AddExpenseModal({
    group,
    onClose,
    onExpenseCreated
}) {
    const [description, setDescription] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [paidByUserId, setPaidByUserId] = useState(
        String(group.members[0]?.userId || "")
    );
    const [splitType, setSplitType] = useState("EQUAL");
    const [selectedMembers, setSelectedMembers] = useState(
        group.members.map((member) => member.userId)
    );
    const [customShares, setCustomShares] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const amountInPaise = useMemo(() => {
        if (!/^\d+(\.\d{1,2})?$/.test(totalAmount)) return 0;

        const [rupees, paise = ""] = totalAmount.split(".");
        return Number(rupees) * 100 + Number(paise.padEnd(2, "0"));
    }, [totalAmount]);

    const equalShares = useMemo(() => {
        if (!selectedMembers.length || !amountInPaise) return {};

        const base = Math.floor(amountInPaise / selectedMembers.length);
        const remainder = amountInPaise % selectedMembers.length;

        return Object.fromEntries(
            selectedMembers.map((userId, index) => [
                userId,
                (base + (index < remainder ? 1 : 0)) / 100
            ])
        );
    }, [selectedMembers, amountInPaise]);

    const customTotalPaise = selectedMembers.reduce((sum, userId) => {
        const value = customShares[userId] || "";
        if (!/^\d+(\.\d{1,2})?$/.test(value)) return sum;

        const [rupees, paise = ""] = value.split(".");
        return sum + Number(rupees) * 100 + Number(paise.padEnd(2, "0"));
    }, 0);

    function toggleMember(userId) {
        setSelectedMembers((previous) =>
            previous.includes(userId)
                ? previous.filter((id) => id !== userId)
                : [...previous, userId]
        );
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!description.trim()) {
            setError("Please enter an expense description.");
            return;
        }

        if (!amountInPaise || amountInPaise <= 0) {
            setError("Enter a valid amount with up to two decimal places.");
            return;
        }

        if (!paidByUserId) {
            setError("Please select who paid.");
            return;
        }

        if (selectedMembers.length === 0) {
            setError("Select at least one participant.");
            return;
        }

        if (
            splitType === "CUSTOM" &&
            customTotalPaise !== amountInPaise
        ) {
            setError("Custom shares must add up exactly to the total amount.");
            return;
        }

        if (
            splitType === "CUSTOM" &&
            selectedMembers.some((id) => {
                const value = customShares[id] || "";
                return !/^\d+(\.\d{1,2})?$/.test(value) ||
                    Number(value) <= 0;
            })
        ) {
            setError("Enter a valid positive share for every selected member.");
            return;
        }

        const participants = selectedMembers.map((userId) => {
            const participant = { userId };

            if (splitType === "CUSTOM") {
                participant.shareAmount = customShares[userId];
            }

            return participant;
        });

        try {
            setLoading(true);

            const newExpense = await createExpense(group.id, {
                description: description.trim(),
                totalAmount,
                paidByUserId: Number(paidByUserId),
                splitType,
                participants
            });

            onExpenseCreated(newExpense);
            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create expense. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Add Expense
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Record a shared expense for {group.name}.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-800"
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Expense Description
                        </label>
                        <div className="relative">
                            <Receipt
                                size={18}
                                className="absolute left-3 top-3.5 text-slate-400"
                            />
                            <input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Dinner, Groceries, Movie tickets"
                                maxLength={150}
                                className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Total Amount (₹)
                        </label>
                        <div className="relative">
                            <IndianRupee
                                size={18}
                                className="absolute left-3 top-3.5 text-slate-400"
                            />
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={totalAmount}
                                onChange={(e) => setTotalAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Paid By
                        </label>
                        <select
                            value={paidByUserId}
                            onChange={(e) => setPaidByUserId(e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {group.members.map((member) => (
                                <option key={member.userId} value={member.userId}>
                                    {member.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Split Among
                        </label>

                        <div className="space-y-2">
                            {group.members.map((member) => (
                                <label
                                    key={member.userId}
                                    className="flex items-center gap-3 border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.includes(member.userId)}
                                        onChange={() => toggleMember(member.userId)}
                                        className="w-4 h-4 accent-green-600"
                                    />

                                    <span className="flex-1 text-sm font-medium text-slate-700">
                                        {member.fullName}
                                    </span>

                                    {selectedMembers.includes(member.userId) &&
                                        splitType === "EQUAL" &&
                                        amountInPaise > 0 && (
                                            <span className="text-sm font-semibold text-green-700">
                                                ₹{equalShares[member.userId]?.toFixed(2)}
                                            </span>
                                        )}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Split Method
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setSplitType("EQUAL")}
                                className={`py-3 rounded-xl border text-sm font-semibold ${
                                    splitType === "EQUAL"
                                        ? "border-green-600 bg-green-50 text-green-700"
                                        : "border-slate-300 text-slate-600"
                                }`}
                            >
                                Equal Split
                            </button>

                            <button
                                type="button"
                                onClick={() => setSplitType("CUSTOM")}
                                className={`py-3 rounded-xl border text-sm font-semibold ${
                                    splitType === "CUSTOM"
                                        ? "border-green-600 bg-green-50 text-green-700"
                                        : "border-slate-300 text-slate-600"
                                }`}
                            >
                                Custom Split
                            </button>
                        </div>
                    </div>

                    {splitType === "CUSTOM" && (
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-700">
                                Enter Each Member's Share (₹)
                            </label>

                            {selectedMembers.map((userId) => {
                                const member = group.members.find(
                                    (item) => item.userId === userId
                                );

                                return (
                                    <div
                                        key={userId}
                                        className="flex items-center justify-between gap-3"
                                    >
                                        <span className="text-sm text-slate-700">
                                            {member?.fullName}
                                        </span>

                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={customShares[userId] || ""}
                                            onChange={(e) =>
                                                setCustomShares((previous) => ({
                                                    ...previous,
                                                    [userId]: e.target.value
                                                }))
                                            }
                                            className="w-32 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                );
                            })}

                            <p className={`text-sm font-semibold ${
                                customTotalPaise === amountInPaise
                                    ? "text-green-700"
                                    : "text-amber-600"
                            }`}>
                                Allocated: ₹{(customTotalPaise / 100).toFixed(2)}
                                {" / "}
                                ₹{(amountInPaise / 100).toFixed(2)}
                            </p>
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold"
                        >
                            {loading ? "Saving..." : "Save Expense"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
