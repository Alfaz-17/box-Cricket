// GroupInfo.jsx
import { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import AuthContext from "../../context/AuthContext";
import { ArrowLeft, Trash2, LogOut } from "lucide-react";
import toast from "react-hot-toast";

const GroupInfo = () => {
  const { user } = useContext(AuthContext);
  const [admin, setAdmin] = useState(null);
  const [members, setMembers] = useState([]);
  const{groupId,groupName}=useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const res = await api.post(`/group/getMembers/${groupId}`);
        setAdmin(res.data.admin);
        setMembers(res.data.members);
      } catch (err) {
        console.error("Error fetching group info:", err);
      }
    };

    fetchGroupInfo();
  }, [groupId]);



const handleLeaveGroup = async () => {
  try {
    const res = await api.post(`/group/leave/${groupId}`);
      if (!res.data.ok) {
      toast.error(res.data.message || "Failed to leave the group.");
    navigate("/groups"); // Safe redirect to group list
    }
    
  } catch (err) {
        console.error("Error:", err);
    const message =
      err.response?.data?.message || "Something went wrong while leaving the group.";
    toast.error(message);
  }
};

const handleDeleteGroup = async () => {
  try {
    const res = await api.post(`/group/delete/${groupId}`);
    if (res.status === 200) {
      toast.success("Group deleted successfully.");
        navigate("/groups"); // Safe redirect to group list

     
    }

  } catch (err) {
    console.error("Failed to delete group:", err);
    toast.error("An error occurred while deleting the group.");
  }
};


  return (
    <div className="flex flex-col h-screen bg-base-100">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-base-200">
       <Link to={`/groupChat/${groupName}/${groupId}`}>

        <button className="btn btn-sm btn-ghost">
          <ArrowLeft />
        </button>
        </Link>
        <h2 className="text-xl font-bold">{groupName}  Info</h2>
      </div>

      {/* Admin */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Admin</h3>
        <div className="flex items-center gap-3 mt-2">
          <img
            src={admin?.profileImg}
            alt={admin?.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <div className="font-medium">{admin?.name}</div>
            <div className="text-sm text-gray-500">{admin?.contactNumber}</div>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="p-4 overflow-auto">
        <h3 className="text-lg font-semibold mb-2">Members ({members.length})</h3>
        {members.map((member) => (
          <div key={member._id} className="flex items-center gap-3 mb-3">
            <img
              src={member?.profileImg}
              alt={member?.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-medium">{member.name}</div>
              <div className="text-sm text-gray-500">
                {member.contactNumber}
                {admin._id === member._id && " (Admin)"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-4 mt-auto flex flex-col gap-2 border-t">
        <button onClick={handleLeaveGroup} className="btn btn-outline btn-error">
          <LogOut size={18} /> Leave Group
        </button>
        {user?._id === admin?._id && (
          <button onClick={handleDeleteGroup} className="btn btn-error">
            <Trash2 size={18} /> Delete Group
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupInfo;
