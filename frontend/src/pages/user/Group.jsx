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

  const joinGroup = async (groupId) => {
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
              <h3 className="text-md font-semibold">🔔 Notifications</h3>
              <button
                className="btn btn-xs btn-outline btn-info"
                onClick={fetchNotifications}
              >
                Refresh
              </button>
            </div>
          <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin pr-1">
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
          className="card shadow-sm bg-base-100 border border-base-300 p-4"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm">
              {n.fromUser?.name || "System"}
            </h3>
            <span className="badge badge-xs badge-secondary text-[10px]">
              {new Date(n.createdAt).toLocaleString()}
            </span>
          </div>

          <p className="text-sm text-gray-600">{n.message}</p>

          {n.groupId && (
            <p className="text-xs text-blue-500 mt-1">
              Group: <span className="font-medium">{n.groupId.name}</span>
            </p>
          )}

          <div className="mt-3 flex flex-col gap-2">
            <button
              className="btn btn-xs btn-outline btn-error w-full"
              onClick={() => handleDeleteNotification(n._id)}
            >
              <i className="mr-1 ri-delete-bin-line" /> Delete
            </button>

            {n.type === "invite" && n.groupId && (
              <button
                className="btn btn-xs btn-success w-full"
                onClick={() => joinGroup(n.groupId._id)}
              >
                <i className="mr-1 ri-group-line" /> Join Group
              </button>
            )}
          </div>
        </div>
      ))
  )}
</div>

          </div>

          {/* Create Group */}
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-sm input-bordered w-full"
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
                    <h3 className="font-semibold">{group.name}</h3>
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
