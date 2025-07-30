import { getIO, getOnlineUsers } from "../lib/soket.js";
import Group from "../models/Group.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    const group = await Group.create({
      name,
      admin: userId,
      members: [userId],
    });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: "Failed to create group" });
  }
};

export const inviteToGroup = async (req, res) => {
  try {
    const { groupId, userIdToInvite } = req.body;
    const group = await Group.findById(groupId);
    const fromUser = req.user._id;

    if (!group) return res.status(404).json({ error: "Group not found" });

    //only admin can invite user
    if (String(group.admin) !== String(fromUser)) {
      return res.status(403).json({ error: "Only admin can invite" });
    }

    //check if user can already in invite list
    if (!group.invites.includes(userIdToInvite)) {
      group.invites.push(userIdToInvite);
      await group.save();

      // 🔔 Send invite notification
      await Notification.create({
        toUser: userIdToInvite,
        fromUser,
        type: "invite",
        status: "pending",
        groupId: group._id,
        message: `You've been invited to join the group "${group.name}"`,
      });
    }

    // {add Real Time Notificayion using socket}
    const io = getIO();
    const onlineUsers = getOnlineUsers();
    const soketId = onlineUsers.get(String(userIdToInvite));

    //means user is online
    if (soketId) {
      io.to(soketId).emit("group-invite", {
        groupId: group._id,
        groupName: group.name,
        fromUser,
        message: `You've been invited to join the group "${group.name}"`,
      });
    }

    res.status(200).json({ message: "User invited and notified." });
  } catch (err) {
    res.status(500).json({ error: "Failed to invite user" });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Must be invited first
    if (!group.invites.includes(userId)) {
      return res.status(403).json({ error: "You are not invited to join" });
    }

    // Add to members if not already
    if (!group.members.includes(userId)) {
      group.members.push(userId);
    }

    // Remove from invite list
    group.invites = group.invites.filter((id) => String(id) !== String(userId));
    await group.save();

    // Update previous invite notification for the user
    await Notification.updateOne(
      {
        toUser: userId,
        fromUser: group.admin,
        type: "invite",
        status: "pending",
        groupId: group._id,
      },
      {
        $set: {
          type: "added",
          status: "accepted",
          message: `You have joined the group "${group.name}"`,
          isRead: false,
          createdAt: new Date(),
        },
      }
    );

    // Notify the admin
    await Notification.create({
      fromUser: userId,
      toUser: group.admin,
      type: "added",
      status: "accepted",
      groupId: group._id,
      message: `${req.user.name} has joined the group "${group.name}"`,
    });

    // 🔌 SOCKET EMITS
    const io = getIO();
    const onlineUsers = getOnlineUsers();

    const adminSocketId = onlineUsers.get(String(group.admin));
    const userSocketId = onlineUsers.get(String(userId));

    // Notify Admin (group owner)
    if (adminSocketId) {
      io.to(adminSocketId).emit("group-joined", {
        type: "admin-notify",
        groupId: group._id,
        groupName: group.name,
        message: `${req.user.name} has joined your group.`,
      });
    }

    // Notify User (who joined)
    if (userSocketId) {
      io.to(userSocketId).emit("group-join-success", {
        type: "user-confirm",
        groupId: group._id,
        groupName: group.name,
        message: `You have successfully joined "${group.name}".`,
      });
    }

    res.status(200).json({ message: "Joined group successfully" });
  } catch (err) {
    console.error("Join Group Error:", err);
    res.status(500).json({ error: "Failed to join group" });
  }
};

export const myGroups = async (req, res) => {
  try {
    const group = await Group.find({ members: req.user._id })
      .populate("members", "name email") // populate members
      .populate("admin", "name email"); // populate admin

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("❌ Error in allGroupMember controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupMembers = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const membersId = group.members.map((member) => member._id);

    const members = await User.find({ _id: { $in: membersId } });

    const admin = await User.findById(group.admin);

    if (!members) {
      return res
        .status(404)
        .json({ message: "No members found in this group" });
    }

    res.status(200).json({ admin: admin, members: members });
  } catch (error) {
    console.error("❌ Error in getGroup members controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.admin.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only group admin can delete the group" });
    }

    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: "Group deleted SucessFully" });
  } catch (error) {
    console.log("❌ Error in deleteGroup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // If user is not a member
    if (!group.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are not a member of this group" });
    }

    // Prevent admin from leaving their own group (optional, you can allow it if desired)
    if (group.admin.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ message: "Admin cannot leave their own group" });
    }

    // Remove user from members
    group.members = group.members.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );

    await group.save();

    return res
      .status(200)
      .json({ message: "You have left the group successfully" });
  } catch (error) {
    console.error("Error leaving group:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
