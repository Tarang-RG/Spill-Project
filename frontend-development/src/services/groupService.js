import api from "./api";

export const createGroup = async (groupData) => {
    const response = await api.post("/groups", groupData);
    return response.data;
};

export const getMyGroups = async () => {
    const response = await api.get("/groups/my-groups");
    return response.data;
};

export const joinGroup = async (inviteCode) => {
    const response = await api.post("/groups/join", {
        inviteCode
    });
    return response.data;
};
export const getGroupDetails = async (groupId) => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
};
export const createExpense = async (groupId, expenseData) => {
    const response = await api.post(
        `/groups/${groupId}/expenses`,
        expenseData
    );
    return response.data;
};
export const getGroupExpenses = async (groupId) => {
    const response = await api.get(
        `/groups/${groupId}/expenses`
    );

    return response.data;
};
export const getGroupBalances = async (groupId) => {
    const response = await api.get(
        `/groups/${groupId}/expenses/balances`
    );
    return response.data;
};

export const getGroupSettlements = async (groupId) => {
    const response = await api.get(
        `/groups/${groupId}/expenses/settlements`
    );
    return response.data;
};

// Create a settlement (debtor marks payment as made)
export const createSettlement = async (groupId, settlementData) => {
    const response = await api.post(
        `/groups/${groupId}/settlements`,
        settlementData
    );
    return response.data;
};

// Confirm a settlement (receiver confirms payment)
export const confirmSettlement = async (groupId, settlementId) => {
    const response = await api.patch(
        `/groups/${groupId}/settlements/${settlementId}/confirm`
    );
    return response.data;
};

// Reject a settlement (receiver rejects payment)
export const rejectSettlement = async (groupId, settlementId) => {
    const response = await api.patch(
        `/groups/${groupId}/settlements/${settlementId}/reject`
    );
    return response.data;
};

// Fetch settlement history
export const getSettlementHistory = async (groupId) => {
    const response = await api.get(
        `/groups/${groupId}/settlements/history`
    );
    return response.data;
};