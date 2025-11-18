const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
	try {
		const notifications = await Notification.find({ user: req.user._id })
			.sort({ createdAt: -1 })
			.limit(50);
		res.json({ success: true, notifications });
	} catch (e) {
		res.status(500).json({ success: false, message: e.message });
	}
};

exports.getUnreadCount = async (req, res) => {
	try {
		const count = await Notification.countDocuments({ user: req.user._id, read: false });
		res.json({ success: true, count });
	} catch (e) {
		res.status(500).json({ success: false, message: e.message });
	}
};

exports.markAllRead = async (req, res) => {
	try {
		await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
		res.json({ success: true });
	} catch (e) {
		res.status(500).json({ success: false, message: e.message });
	}
};

exports.markOneRead = async (req, res) => {
	try {
		const { id } = req.params;
		await Notification.updateOne({ _id: id, user: req.user._id }, { $set: { read: true } });
		res.json({ success: true });
	} catch (e) {
		res.status(500).json({ success: false, message: e.message });
	}
};


