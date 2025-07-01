import { useEffect, useState, useRef, useContext } from "react";
import api from "../../utils/api";
import { ArrowLeft, Send } from "lucide-react"; 
import AuthContext from "../../context/AuthContext";
import socket from "../../utils/soket";
import { Link, useParams } from "react-router-dom";


const GroupChat = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef(null);
const {groupId,groupName}=useParams();

  // ✅ Connect socket once per user login
// GroupChat.jsx


  // ✅ Fetch messages and add listener per group
  useEffect(() => {
    if (!groupId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/all/${groupId}`);
        setMessages(res.data.reverse());
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };

    fetchMessages();

    const handleNewGroupMessage = (data) => {
      if (data.groupId === groupId) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    socket.on("new-group-message", handleNewGroupMessage);

    return () => {
      socket.off("new-group-message", handleNewGroupMessage); // Cleanup listener
    };
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;

    try {
      const res = await api.post("/messages/send", {
        groupId,
        content: newMsg,
      });

      setMessages((prev) => [...prev, res.data]);
      setNewMsg("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

return (

  
  <div className="flex flex-col h-screen w-full bg-base-100">
    {/* Header */}
{/* Header */}
<Link to={`/groupInfo/${groupName}/${groupId}`} >
<div
  className="flex items-center gap-4 p-4 border-b bg-base-200 cursor-pointer"
  
>
  <Link to={`/groups`}>

  <button className="btn btn-sm btn-ghost" >
    <ArrowLeft />
  </button>
  </Link>
  <h2 className="text-xl font-bold">{groupName}</h2>
</div>
</Link>

   


    {/* Messages */}
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {messages.map((msg, i) => {
        const isOwn = msg.sender?._id === user?._id;

        return (
          <div
            key={i}
            className={`chat ${isOwn ? "chat-end" : "chat-start"} items-end`}
          >
            {!isOwn && (
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                 <img
  src={
    msg.sender?.profileImg ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      msg.sender?.name || "User"
    )}&background=random`
  }
  alt={msg.sender?.name}
  className="w-10 h-10 rounded-full"
/>

                </div>
              </div>
            )}
            <div className="chat-header text-sm text-gray-500 mb-1">
              {isOwn ? "You" : msg.sender?.name}
            </div>
            <div
              className={`chat-bubble ${
                isOwn ? "bg-primary text-primary-content" : "bg-base-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef}></div>
    </div>

    {/* Input */}
    <div className="p-4 border-t flex items-center gap-2 bg-base-100">
      <input
        type="text"
        className="input input-bordered w-full text-[16px]"
        placeholder="Type a message"
        value={newMsg}
        onChange={(e) => setNewMsg(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button className="btn btn-primary btn-square" onClick={handleSend}>
        <Send size={18} />
      </button>
    </div>
  </div>
);

};

export default GroupChat;
