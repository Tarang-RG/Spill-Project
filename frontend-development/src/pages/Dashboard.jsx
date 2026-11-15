import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import OverviewCards from "../components/dashboard/OverviewCards";
import GroupList from "../components/dashboard/GroupList";
import RecentActivity from "../components/dashboard/RecentActivity";

import { getCurrentUser, logoutUser } from "../services/authservice";
import { getMyGroups, getGroupBalances } from "../services/groupService";

export default function Dashboard() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("Dashboard");
  const [overallBalances, setOverallBalances] = useState({ youOwe: 0, youreOwed: 0, });

  async function fetchOverallBalances() {
      try {
          const groups = await getMyGroups();

          const storedUser = JSON.parse(
              localStorage.getItem("user") || "null"
          );

          const currentUserId = storedUser?.userId;

          if (!currentUserId) return;

          // Fetch balances from every group
          const balanceResults = await Promise.all(
              groups.map(group => getGroupBalances(group.id))
          );

          let youOwe = 0;
          let youreOwed = 0;

          balanceResults.forEach(balanceData => {
              const myBalance = balanceData.members?.find(
                  member =>
                      Number(member.userId) === Number(currentUserId)
              );

              if (!myBalance) return;

              const netBalance = Number(myBalance.netBalance);

              if (netBalance < 0) {
                  youOwe += Math.abs(netBalance);
              } else if (netBalance > 0) {
                  youreOwed += netBalance;
              }
          });

          setOverallBalances({
              youOwe,
              youreOwed,
          });

      } catch (error) {
          console.error("Error fetching overall balances:", error);
      }
  }


  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getCurrentUser();

        setUser(data);

        localStorage.setItem(
          "user",
          JSON.stringify({
            userId: data.userId,
            fullName: data.fullName,
            email: data.email,
          })
        );
        fetchOverallBalances();
      } catch (error) {
        logoutUser();
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
      try {
          const groupData = await getMyGroups();
          setGroups(groupData);
      } catch (error) {
          console.error("Failed to fetch groups:", error);
      } finally {
          setGroupsLoading(false);
      }
    }

    fetchUser();
  }, [navigate]);

  function handleLogout() {
    logoutUser();
    navigate("/", { replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Spill...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-8 md:p-10">
        <Header user={user} />

        {activePage === "Dashboard" && (
          <>
            <OverviewCards youOwe={overallBalances.youOwe} youreOwed={overallBalances.youreOwed} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <GroupList
                  groups={groups}
                  loading={groupsLoading}
                  onGroupCreated={(newGroup) =>
                    setGroups((previousGroups) => [newGroup, ...previousGroups])
                  }
                />
              </div>

              <RecentActivity />
            </div>
          </>
        )}

        {activePage !== "Dashboard" && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">
              {activePage}
            </h2>

            <p className="text-slate-500 mt-2">
              This section is coming soon.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}