module.exports.config = {
	name: "penis",
	version: "1.0.2",
	hasPermssion: 0,
	credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
	description: "Bangla flirty random text",
	commandCategory: "random-text",
	cooldowns: 1
};

module.exports.run = ({ event, api }) => {
	const length = Math.floor(Math.random() * 10) + 3;
	const penis = `8${'='.repeat(length)}D`;

	const banglaFlirts = [
		"তুমি আমার লাইনের চেয়েও লম্বা! 😘",
		"এত লম্বা দেখলাম, বুঝলাম তুমি প্রস্তুত! 😉",
		"তোমার হাসির চেয়ে বড় একটা আছে মনে হয়! 😏",
		"যত বড়, তত ভালবাসা বেশি! ❤️",
		"এইটা দেখেই আমার মন গলছে! 🔥",
		"তুমি কি আমার জন্যই এত বড়? 😜",
		"এত লম্বা দেখে তো আমি শিহরিত! 😍",
		"তুমি যদি আমার পাশে থাকো, আমি জিতব সব যুদ্ধ! 💪",
		"আমার গোপন ইচ্ছের সঙ্গী তুমি! 💖",
		"এইটা দেখেই বুঝলাম, তুমি পারফেক্ট! 💯"
	];

	const msg = banglaFlirts[Math.floor(Math.random() * banglaFlirts.length)];

	return api.sendMessage(`${penis}\n\n${msg}`, event.threadID, event.messageID);
};
