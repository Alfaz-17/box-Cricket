import { useState, useEffect, useContext } from "react";
import api from "../../utils/api";
import { User, User2, Users2 } from "lucide-react";
import GroupChat from "./GroupChat";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import socket from "../../utils/soket";
import toast from "react-hot-toast";

const Group = () => {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const { user } = useContext(AuthContext);

  const fetchGroups = async () => {
    try {
      const res = await api.get("/group/myGroups");
      setGroups(res.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const res = await api.post("/group/join", {
        userIdToInvite: user._id,
        groupId,
      });
      toast.success("Joined group successfully");
      fetchGroups();
    } catch (error) {
      console.error("Error joining group", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/group/notification");
      setNotifications(res.data);
   
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };
  
  useEffect(() => {
    fetchGroups();
    fetchNotifications();

    socket.on("group-invite", (data) => {
      toast.success(data.message);
      fetchNotifications();
    });

    socket.on("group-join-success", (data) => {
      toast.success(data.message);
      fetchNotifications();
    });

    socket.on("group-joined", (data) => {
      toast.success(data.message);
      fetchNotifications();
    });

    return () => {
      socket.off("group-invite");
      socket.off("group-join-success");
      socket.off("group-joined");
    };
  }, []);

  const createGroup = async () => {
    if (!groupName.trim()) return;
    try {
      setLoading(true);
      await api.post("/group/create", { name: groupName });
      setGroupName("");
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification=async(notificationId)=>{
    try {
      const res =await api.post(`/group/deleteNotification/${notificationId}`)
      if (res.status === 200) {
        toast.success("Notification deleted successfully");
        setNotifications((prev) => prev.filter(n => n._id !== notificationId));
      }
    } catch (error) {
      toast.error("Error deleting notification");
      console.log(error);
    }
  };


  if (activeGroup) {
    return (
      <GroupChat
        groupId={activeGroup._id}
        groupName={activeGroup.name}
        onBack={() => navigate("/groups")}
      />
    );
  }

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-base-200">
      {/* Left Sidebar */}
      <aside className="w-full md:w-1/3 lg:w-1/4 border-r border-base-300 flex flex-col h-full">
        <div className="p-4 bg-base-100 border-b border-base-300">

          <h2 className="text-xl font-bold text-center mb-3"> My Groups</h2>

{/* Notifications */}

<div className="mb-4">
  <div className="flex justify-between items-center mb-2">
    <h3 style={{ fontFamily: "Bebas Neue" }}  className="text-lg font-bold">🔔 Notifications</h3>
    <button
      className="btn btn-sm btn-outline btn-info"
      onClick={fetchNotifications}
    >
      Refresh
    </button>
  </div>

  <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
    {notifications.length === 0 ? (
      <div className="text-center text-sm text-gray-500">
        No new notifications
      </div>
    ) : (
      notifications
        .filter((n) => !n.isRead)
        .map((n) => (
          <div
            key={n._id}
            className="relative bg-base-100 border border-base-300 rounded-lg p-4 shadow hover:shadow-md transition-all"
          >
                 {/* Top Row: Sender + Date */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {n.fromUser?.profileImg && (
                  <img
                    src={n.fromUser.profileImg}
                    alt="User"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <h4   className="font-medium text-md text-base-content">
                  {n.fromUser?.name || "System"}
                </h4>
              </div>
              <span className="text-[11px] text-gray-400 whitespace-nowrap mt-2 ml-4">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>

            {/* Main Message */}
            <p className="text-sm text-base-content font-semibold mt-2">
              {n.message}
            </p>

            {/* Group Info & Join Button */}
            {n.groupId && (
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-blue-600">
                  Group: <span className="font-medium">{n.groupId.name}</span>
                </p>

             
                     {n.type === "invite" && (
                  <button
                    onClick={() => handleJoinGroup(n.groupId._id)}
                    className="tooltip text-blue-500 hover:text-blue-700 transition"
                    data-tip="Join Group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M16 14c2.21 0 4 1.79 4 4v2h-4v-2c0-.73-.19-1.41-.52-2H20c0-1.1-.9-2-2-2h-2zm-8 0c2.21 0 4 1.79 4 4v2H4v-2c0-2.21 1.79-4 4-4zm8-2c1.66 0 3-1.34 3-3S17.66 6 16 6s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 6 8 6 5 7.34 5 9s1.34 3 3 3z" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Delete Button (top-right corner) */}
            <button
              onClick={() => handleDeleteNotification(n._id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
              aria-label="Delete"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))
    )}
  </div>
</div>


          {/* Create Group */}
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-sm input-bordered w-full text-[16px]"
              placeholder="New Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <button
              className="btn btn-sm btn-primary"
              onClick={createGroup}
              disabled={loading}
            >
              {loading ? "..." : "Create"}
            </button>
          </div>
        </div>

        {/* Group List */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2 scrollbar-thin">
          {groups.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">No groups found</p>
          ) : (
            groups.map((group) => (
              <Link to={`/groupChat/${group.name}/${group._id}`}>

              <div
                key={group._id}
                className="card bg-base-100 border border-base-300 p-3 hover:bg-base-300 transition cursor-pointer"
              >
                

                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-10">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 style={{ fontFamily: "Bebas Neue" }}  className="font-semibold">{group.name}</h3>
                    <p className="text-xs text-gray-500">
                      Admin: {group.admin?.name}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Users2 className="w-4 h-4" />
                      {group.members?.length} Members
                    </p>
                  </div>
                </div>
                <Link to={`/invite/${group._id}`}>
                  <button className="btn btn-sm btn-outline btn-secondary w-full mt-3">
                    Invite Users
                  </button>
                </Link>
              </div>
              </Link>

            ))
          )}
        </div>
      </aside>

      {/* Right Section */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-xl font-semibold">Select a group to start chatting</p>
          <p className="text-sm mt-2 text-gray-400">Messages will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default Group;
