
import { getIO, getOnlineUsers } from "../lib/soket.js";
import Group from "../models/Group.js";
import Message from "../models/Message.js";


export const sendMessage = async (req, res) => {
  try {
    const { groupId, content } = req.body;
    const userId = req.user._id;

    //  Check if user is part of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.includes(userId);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    //  Create and save message
    const message = await Message.create({
      group: groupId,
      sender: userId,
      content,
    });

    const populatedMessage = await message.populate("sender", "name");

 //  Emit to online users in the group
       const io = getIO();
    const onlineUsers = getOnlineUsers();

    for (const memberId of group.members) {
      const socketId = onlineUsers.get(memberId.toString());


      if (socketId && memberId.toString() !== userId.toString()) {
        io.to(socketId).emit("new-group-message", {
      
          groupId,
          message: populatedMessage,
        });
       
      }
    }


    res.status(200).json(populatedMessage);
  } catch (error) {
    console.error("❌ Error in sendMessage controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get All Messages for Group
export const getAllMessages = async (req, res) => {
  try {
   

const {groupId}=req.params;
const userId=req.user._id;
    //  Check if user is part of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

 const isMember = group.members.includes(userId);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }



    const groupMessages = await Message.find({ group: groupId })
      .sort({ createdAt: -1 })
      .populate("sender", "name profileImg");

    res.status(200).json(groupMessages);
  } catch (error) {
    console.log("❌ Error in getAllMessages controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
