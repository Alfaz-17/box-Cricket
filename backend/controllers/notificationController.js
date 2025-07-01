import Notification from "../models/Notification.js"



export const groupNotification =async(req,res)=>{
    try {
        
        const Notifications =await Notification.find()
           .sort({ createdAt: -1 })
            .populate('toUser', 'name')
      .populate('groupId', 'name').populate('fromUser','name')


res.status(200).json(Notifications);
    
    } catch (error) {
           res.status(500).json({ error: 'internal server error' });
           console.log("error in group notification controoler",error)
        
    }


}

export const deleteNotification =async(req,res)=>{
    try {
        const { notificationId } = req.params;
        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error("Error deleting notification:", error);
        res.status(500).json({ error: 'Internal server error' });  
    }
}