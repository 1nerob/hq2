const fs = require("fs-extra");
const path = require("path");

const lockNickDataPath = path.join(__dirname, "locknick.json");
let lockNickData = fs.existsSync(lockNickDataPath) ? JSON.parse(fs.readFileSync(lockNickDataPath)) : {};

function saveLockData() {
  fs.writeFileSync(lockNickDataPath, JSON.stringify(lockNickData, null, 2));
}

module.exports = {
  config: {
    name: "locknick",
    version: "1.0.0",
    author: "Raj",
    countDown: 5,
    role: 1,
    shortDescription: "Lock all members' nicknames in a group",
    longDescription: "Prevents members from changing their nicknames",
    category: "group",
    guide: "{p}locknick on/off"
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;

    if (!args[0]) return message.reply("⚠️ इस्तेमाल करें: locknick on/off");

    if (args[0].toLowerCase() === "on") {
      const threadInfo = await api.getThreadInfo(threadID);
      const nicknames = {};

      for (const user of threadInfo.userInfo) {
        nicknames[user.id] = user.nickname || "";
      }

      lockNickData[threadID] = nicknames;
      saveLockData();

      return message.reply("🔒 सभी members के nicknames लॉक कर दिए गए।");
    }

    if (args[0].toLowerCase() === "off") {
      if (!lockNickData[threadID]) return message.reply("⚠️ Nickname पहले से unlocked हैं!");

      delete lockNickData[threadID];
      saveLockData();
      return message.reply("✅ Nickname lock हटा दिया गया।");
    }

    return message.reply("❌ Invalid option! Use: locknick on/off");
  },

  onEvent: async function ({ event, api }) {
    const { threadID, logMessageType, logMessageData } = event;

    if (!lockNickData[threadID]) return;

    if (logMessageType === "log:thread-nickname") {
      const userID = logMessageData.participant_id;
      const lockedNick = lockNickData[threadID][userID] || "";

      if (logMessageData.nickname !== lockedNick) {
        await api.changeNickname(lockedNick, threadID, userID);
        api.sendMessage(
          `🔄 "${logMessageData.nickname || "blank"}" nickname detect हुआ था।\nपुराना nickname वापस set कर दिया गया।`,
          threadID
        );
      }
    }
  }
};
