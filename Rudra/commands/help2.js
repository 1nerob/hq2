 module.exports.config = {
	name: "help2",
	version: "1.0.2",
	hasPermssion: 0,
	credits: "PetterSever",
	description: "Beginner's Guide",
	commandCategory: "system",
	usages: "[Tên module]",
	cooldowns: 1,
	envConfig: {
		autoUnsend: true,
		delayUnsend: 300
	}
};

module.exports.languages = {
	//"vi": {
	//	"moduleInfo": "「 %1 」\n%2\n\n❯ Cách sử dụng: %3\n❯ Thuộc nhóm: %4\n❯ Thời gian chờ: %5 giây(s)\n❯ Quyền hạn: %6\n\n» Module code by %7 «",
	//	"helpList": '[ Hiện tại đang có %1 lệnh có thể sử dụng trên bot này, Sử dụng: "%2help nameCommand" để xem chi tiết cách sử dụng! ]"',
	//	"user": "Người dùng",
  //      "adminGroup": "Quản trị viên nhóm",
  //      "adminBot": "Quản trị viên bot"
//	},
	"en": {
		"moduleInfo": "「 %1 」\n%2\n\n❯ Usage: %3\n❯ Category: %4\n❯ Waiting time: %5 seconds(s)\n❯ Permission: %6\n\n» Module code by %7 «",
		"helpList": '[ There are %1 commands on this bot, Use: "%2help nameCommand" to know how to use! ]',
		"user": "User",
        "adminGroup": "Admin group",
        "adminBot": "Admin bot"
	}
};

module.exports.handleEvent = function ({ api, event, getText }) {
	const { commands } = global.client;
	const { threadID, messageID, body } = event;

	if (!body || typeof body == "undefined" || body.indexOf("help") != 0) return;
	const splitBody = body.slice(body.indexOf("help")).trim().split(/\s+/);
	if (splitBody.length == 1 || !commands.has(splitBody[1].toLowerCase())) return;
	const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
	const command = commands.get(splitBody[1].toLowerCase());
	const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;
	return api.sendMessage(getText("moduleInfo", command.config.name, command.config.description, `${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`, command.config.commandCategory, command.config.cooldowns, ((command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot")), command.config.credits), threadID, messageID);
}

module.exports.run = function({ api, event, args, getText }) {
	const { commands } = global.client;
	const { threadID, messageID } = event;
	const command = commands.get((args[0] || "").toLowerCase());
	const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
	const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
	const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

	// If user typed: help2 [command]
	if (command) {
		return api.sendMessage(getText("moduleInfo",
			command.config.name,
			command.config.description,
			`${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
			command.config.commandCategory,
			command.config.cooldowns,
			((command.config.hasPermssion == 0)
				? getText("user")
				: (command.config.hasPermssion == 1)
					? getText("adminGroup")
					: getText("adminBot")),
			command.config.credits), threadID, messageID);
	}

	// Default help list
	const arrayInfo = [];
	const page = parseInt(args[0]) || 1;
	const numberOfOnePage = 9999; // Show all
	let i = 0;
	let msg = "";

	for (let [name] of commands) {
		arrayInfo.push(name);
	}

	arrayInfo.sort();
	const startSlice = numberOfOnePage * (page - 1);
	i = startSlice;
	const returnArray = arrayInfo.slice(startSlice, startSlice + numberOfOnePage);

	// 💅 Styled Command List
	for (let item of returnArray) {
		msg += `🖤 ✧ ${prefix}${item}\n`;
	}

	// 🎀 Stylish Header and Footer
	const header = `╔═════ ∘◦ ✿ ◦∘ ═════╗\n      ✨ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐌𝐄𝐍𝐔 ✨\n╚═════ ∘◦ ❀ ◦∘ ═════╝\n`;
	const footer = `\n━━━━━━━━━━━━━━━━━━━━\n📄 Page: (${page}/${Math.ceil(arrayInfo.length / numberOfOnePage)})\n👤 Made by: 𝐍𝐌 𝐍𝐞𝐫𝐨𝐛 🖤`;

	// Send fancy help message
	return api.sendMessage(header + msg + footer, threadID, async (error, info) => {
		if (autoUnsend) {
			await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
			return api.unsendMessage(info.messageID);
		}
	}, messageID);
};
