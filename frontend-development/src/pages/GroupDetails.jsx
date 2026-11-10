import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
    ArrowLeft, Users, Copy, Check, Plus, CalendarDays,
    ArrowRightLeft, CheckCircle, XCircle, Clock
} from "lucide-react";
import {
    getGroupDetails,
    getGroupExpenses,
    getGroupBalances,
    getGroupSettlements,
    getSettlementHistory,
    createSettlement,
    confirmSettlement,
    rejectSettlement
} from "../services/groupService";
import AddExpenseModal from "../components/group/AddExpenseModal";

export default function GroupDetails() {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [balanceData, setBalanceData] = useState(null);
    const [settlements, setSettlements] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [settlementHistory, setSettlementHistory] = useState([]);
    const [showSettlementModal, setShowSettlementModal] = useState(false);
    const [selectedSettlement, setSelectedSettlement] = useState(null);
    const [settlementAmount, setSettlementAmount] = useState("");
    const [settlementLoading, setSettlementLoading] = useState(false);
    const [settlementMessage, setSettlementMessage] = useState("");

    async function fetchGroupData() {
        const [
            groupData,
            expenseData,
            balances,
            settlementData,
            historyData,
            userData
        ] = await Promise.all([
            getGroupDetails(groupId),
            getGroupExpenses(groupId),
            getGroupBalances(groupId),
            getGroupSettlements(groupId),
            getSettlementHistory(groupId),
        ]);

        setGroup(groupData);
        setExpenses(expenseData);
        setBalanceData(balances);
        setSettlements(settlementData);
        setSettlementHistory(historyData);
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        setCurrentUserId(storedUser?.userId ?? userData?.id ?? null);
    }

    useEffect(() => {
        async function load() {
            try {
                await fetchGroupData();
            } catch (err) {
                console.error("Group loading error:", err);
                setError(
                    err.response?.data?.message ||
                    "Unable to load group details."
                );
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [groupId]);

    async function copyInviteCode() {
        try {
            await navigator.clipboard.writeText(group.inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setError("Unable to copy invite code.");
        }
    }

    function openSettlementModal(settlement) {
        setSelectedSettlement(settlement);
        setSettlementAmount(Number(settlement.amount).toFixed(2));
        setSettlementMessage("");
        setShowSettlementModal(true);
    }

    async function handleCreateSettlement(e) {
        e.preventDefault();

        if (!selectedSettlement || !settlementAmount) return;

        try {
            setSettlementLoading(true);
            setSettlementMessage("");

            await createSettlement(groupId, {
                toUserId: selectedSettlement.toUserId,
                amount: Number(settlementAmount)
            });

            setShowSettlementModal(false);
            setSettlementMessage("Payment recorded successfully.");

            await fetchGroupData();

        } catch (err) {
            setSettlementMessage(
                err.response?.data?.message ||
                "Unable to record payment."
            );
        } finally {
            setSettlementLoading(false);
        }
    }

    async function handleConfirmSettlement(settlementId) {
        try {
            setSettlementLoading(true);

            await confirmSettlement(groupId, settlementId);
            await fetchGroupData();

            setSettlementMessage("Payment confirmed successfully.");

        } catch (err) {
            setSettlementMessage(
                err.response?.data?.message ||
                "Unable to confirm payment."
            );
        } finally {
            setSettlementLoading(false);
        }
    }

    async function handleRejectSettlement(settlementId) {
        try {
            setSettlementLoading(true);

            await rejectSettlement(groupId, settlementId);
            await fetchGroupData();

            setSettlementMessage("Payment rejected.");

        } catch (err) {
            setSettlementMessage(
                err.response?.data?.message ||
                "Unable to reject payment."
            );
        } finally {
            setSettlementLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500">
                Loading group...
            </div>
        );
    }

    if (error || !group) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-red-600">
                    {error || "Group not found."}
                </p>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-green-700 font-semibold"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-5 md:p-10">
            <div className="max-w-5xl mx-auto">

                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 text-slate-600 hover:text-green-700 mb-8"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>

                {/* Group heading */}
                <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-green-50 text-green-600 p-3 rounded-xl">
                                    <Users size={26} />
                                </div>
                                <span className="text-sm text-green-700 font-semibold">
                                    Group #{group.id}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                                {group.name}
                            </h1>

                            <p className="text-slate-500 mt-2">
                                {group.description || "No description added."}
                            </p>
                        </div>

                        <button
                            onClick={() => setShowExpenseModal(true)}
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold"
                        >
                            <Plus size={18} />
                            Add Expense
                        </button>
                    </div>

                    <div className="border-t border-slate-100 mt-6 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">
                                GROUP INVITE CODE
                            </p>
                            <p className="font-bold tracking-widest text-slate-900">
                                {group.inviteCode}
                            </p>
                        </div>

                        <button
                            onClick={copyInviteCode}
                            className="flex items-center gap-2 text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                            {copied ? <Check size={17} /> : <Copy size={17} />}
                            {copied ? "Copied" : "Copy invite code"}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-5">
                        <CalendarDays size={16} />
                        Created on {new Date(group.createdAt).toLocaleDateString()}
                    </div>
                </section>

                {settlementMessage && (
                    <div className="mb-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                        {settlementMessage}
                    </div>
                )}

                {/* Financial Summary */}
                {balanceData && (
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                            <p className="text-sm text-slate-500">
                                Total Group Expenses
                            </p>

                            <h2 className="text-2xl font-bold text-slate-900 mt-2">
                                ₹{Number(balanceData.totalExpenses).toFixed(2)}
                            </h2>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                            <p className="text-sm text-slate-500">
                                Group Members
                            </p>

                            <h2 className="text-2xl font-bold text-slate-900 mt-2">
                                {group.members.length}
                            </h2>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                            <p className="text-sm text-slate-500">
                                Total Transactions
                            </p>

                            <h2 className="text-2xl font-bold text-slate-900 mt-2">
                                {expenses.length}
                            </h2>
                        </div>

                    </section>
                )}

                {/* Member Balances */}
                {balanceData && (
                    <section className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">

                        <h2 className="text-lg font-bold text-slate-900 mb-5">
                            Member Balances
                        </h2>

                        <div className="space-y-4">

                            {balanceData.members.map((member) => (
                                <div
                                    key={member.userId}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                                >
                                    <div>
                                        <h3 className="font-semibold text-slate-800">
                                            {member.fullName}
                                        </h3>

                                        <p className="text-xs text-slate-500 mt-1">
                                            Paid: ₹{Number(member.totalPaid).toFixed(2)}
                                            {" · "}
                                            Share: ₹{Number(member.totalShare).toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="text-left sm:text-right">
                                        <p className={`font-bold ${
                                            Number(member.netBalance) > 0
                                                ? "text-green-600"
                                                : Number(member.netBalance) < 0
                                                ? "text-red-600"
                                                : "text-slate-500"
                                        }`}>
                                            {Number(member.netBalance) > 0
                                                ? `Gets back ₹${Number(member.netBalance).toFixed(2)}`
                                                : Number(member.netBalance) < 0
                                                ? `Owes ₹${Math.abs(Number(member.netBalance)).toFixed(2)}`
                                                : "Settled"}
                                        </p>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </section>
                )}

                {/* Settlement Suggestions */}
                <section className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">

                    <h2 className="text-lg font-bold text-slate-900 mb-2">
                        Settlement Suggestions
                    </h2>

                    <p className="text-sm text-slate-500 mb-5">
                        Suggested payments to settle everyone's balances.
                    </p>

                    {settlements.length === 0 ? (
                        <div className="py-8 text-center">
                            <h3 className="font-semibold text-green-700">
                                Everyone is settled!
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                There are no outstanding payments.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">

                            {settlements.map((settlement, index) => (
                                <div
                                    key={`${settlement.fromUserId}-${settlement.toUserId}-${index}`}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 rounded-xl p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-100 text-red-600 rounded-full p-2 text-xs font-bold">
                                            {settlement.fromUser.charAt(0)}
                                        </div>

                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                {settlement.fromUser}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Pays
                                            </p>
                                        </div>

                                        <span className="text-slate-400">→</span>

                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                {settlement.toUser}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Receives
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <p className="text-lg font-bold text-green-700">
                                            ₹{Number(settlement.amount).toFixed(2)}
                                        </p>

                                        {Number(settlement.fromUserId) === Number(currentUserId) && (
                                            <button
                                                onClick={() => openSettlementModal(settlement)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                                            >
                                                Record Payment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </section>

                {/* Pending Confirmations */}
                <section className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">

                    <div className="flex items-center gap-2 mb-5">
                        <Clock className="text-amber-500" size={21} />
                        <h2 className="text-lg font-bold text-slate-900">
                            Pending Confirmations
                        </h2>
                    </div>

                    {settlementHistory.filter(
                        item => item.status === "PENDING"
                            && Number(item.toUserId) === Number(currentUserId)
                    ).length === 0 ? (

                        <p className="text-sm text-slate-500 py-4 text-center">
                            No payments waiting for your confirmation.
                        </p>

                    ) : (

                        <div className="space-y-3">
                            {settlementHistory
                                .filter(
                                    item => item.status === "PENDING"
                                        && Number(item.toUserId) === Number(currentUserId)
                                )
                                .map(item => (

                                    <div
                                        key={item.id}
                                        className="border border-amber-100 bg-amber-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                {item.fromUser} paid you
                                            </p>

                                            <p className="text-lg font-bold text-slate-900 mt-1">
                                                ₹{Number(item.amount).toFixed(2)}
                                            </p>

                                            <p className="text-xs text-slate-500 mt-1">
                                                Awaiting your confirmation
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                disabled={settlementLoading}
                                                onClick={() => handleConfirmSettlement(item.id)}
                                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                                            >
                                                <CheckCircle size={16} />
                                                Confirm
                                            </button>

                                            <button
                                                disabled={settlementLoading}
                                                onClick={() => handleRejectSettlement(item.id)}
                                                className="flex items-center gap-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                                            >
                                                <XCircle size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </section>

                {/* Settlement History */}
                <section className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">

                    <div className="flex items-center gap-2 mb-5">
                        <ArrowRightLeft className="text-green-600" size={21} />
                        <h2 className="text-lg font-bold text-slate-900">
                            Settlement History
                        </h2>
                    </div>

                    {settlementHistory.length === 0 ? (

                        <p className="text-sm text-slate-500 text-center py-6">
                            No settlement records yet.
                        </p>

                    ) : (

                        <div className="space-y-3">
                            {settlementHistory.map(item => (

                                <div
                                    key={item.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-800">
                                            {item.fromUser} → {item.toUser}
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-900">
                                            ₹{Number(item.amount).toFixed(2)}
                                        </span>

                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                            item.status === "CONFIRMED"
                                                ? "bg-green-100 text-green-700"
                                                : item.status === "REJECTED"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-amber-100 text-amber-700"
                                        }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>


                {/* Members */}
                <section className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Group Members
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                People sharing expenses in this group.
                            </p>
                        </div>

                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {group.members.length} Members
                        </span>
                    </div>

                    <div className="space-y-3">
                        {group.members.map((member) => (
                            <div
                                key={member.userId}
                                className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl p-4"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-11 h-11 shrink-0 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                                        {member.fullName?.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-slate-800 truncate">
                                            {member.fullName}
                                        </h3>
                                        <p className="text-sm text-slate-500 truncate">
                                            {member.email}
                                        </p>
                                    </div>
                                </div>

                                <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                                    member.role === "ADMIN"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-slate-100 text-slate-600"
                                }`}>
                                    {member.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Expense placeholder */}
                <section className="bg-white rounded-2xl border border-slate-200 p-6 mt-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5">
                    Recent Expenses
                </h2>

                {expenses.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-slate-500">
                            No expenses yet. Start by adding your first expense.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {expenses.map((expense) => (
                            <div
                                key={expense.id}
                                className="border border-slate-200 rounded-xl p-4"
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">
                                            {expense.description}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Paid by {expense.paidBy}
                                        </p>
                                    </div>

                                    <p className="font-bold text-slate-900">
                                        ₹{Number(expense.totalAmount).toFixed(2)}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100">
                                    <p className="text-xs text-slate-500 mb-2">
                                        SPLIT AMONG
                                    </p>

                                    {expense.splits.map((split) => (
                                        <div
                                            key={split.userId}
                                            className="flex justify-between text-sm py-1"
                                        >
                                            <span className="text-slate-600">
                                                {split.fullName}
                                            </span>
                                            <span className="font-medium text-slate-800">
                                                ₹{Number(split.shareAmount).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            </div>
            {showExpenseModal && (
            <AddExpenseModal
                    group={group}
                    onClose={() => setShowExpenseModal(false)}
                    onExpenseCreated={(newExpense) => {
                        setExpenses((previous) => [newExpense, ...previous]);
                    }}
                />
            )}
            {showSettlementModal && selectedSettlement && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

                    <form
                        onSubmit={handleCreateSettlement}
                        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
                    >
                        <h2 className="text-xl font-bold text-slate-900">
                            Record Payment
                        </h2>

                        <p className="text-sm text-slate-500 mt-2">
                            You're recording a payment to{" "}
                            <span className="font-semibold text-slate-800">
                                {selectedSettlement.toUser}
                            </span>.
                        </p>

                        <div className="mt-5">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Payment Amount (₹)
                            </label>

                            <input
                                type="number"
                                min="0.01"
                                max={Number(selectedSettlement.amount)}
                                step="0.01"
                                required
                                value={settlementAmount}
                                onChange={e => setSettlementAmount(e.target.value)}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                            />

                            <p className="text-xs text-slate-500 mt-2">
                                Suggested amount: ₹
                                {Number(selectedSettlement.amount).toFixed(2)}
                            </p>
                        </div>

                        <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg mt-4">
                            The receiver must confirm that they received the money.
                            This action does not transfer money automatically.
                        </p>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowSettlementModal(false)}
                                className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={settlementLoading}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                            >
                                {settlementLoading ? "Recording..." : "Confirm Payment"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}