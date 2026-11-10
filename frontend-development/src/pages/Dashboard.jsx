import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import OverviewCards from "../components/dashboard/OverviewCards";
import GroupList from "../components/dashboard/GroupList";
import RecentActivity from "../components/dashboard/RecentActivity";

import { getCurrentUser, logoutUser } from "../services/authservice";
import { getMyGroups } from "../services/groupService";

export default function Dashboard() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("Dashboard");

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
            <OverviewCards />

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