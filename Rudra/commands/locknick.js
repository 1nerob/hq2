const fs = require("fs-extra");
const path = require("path");

const NICKNAME_LOCK_FILE = path.join(__dirname, "locked_nicknames.json");

// फंक्शन जो निकनेम डेटा को लोड करता है
function loadLockedNicknames() {
    try {
        if (fs.existsSync(NICKNAME_LOCK_FILE)) {
            return JSON.parse(fs.readFileSync(NICKNAME_LOCK_FILE, "utf8"));
        }
    } catch (error) {
        console.error("Error loading locked nicknames:", error);
    }
    return {}; // यदि फ़ाइल मौजूद नहीं है या कोई त्रुटि है तो खाली ऑब्जेक्ट लौटाएं
}

// फंक्शन जो निकनेम डेटा को सेव करता है
function saveLockedNicknames(data) {
    try {
        fs.writeFileSync(NICKNAME_LOCK_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (error) {
        console.error("Error saving locked nicknames:", error);
    }
}

let lockedNicknames = loadLockedNicknames(); // बॉट स्टार्ट होने पर डेटा लोड करें

module.exports = {
  config: {
    name: "locknick",
    version: "2.0.0", // New version
    author: "Your Name", // आप अपना नाम यहाँ डाल सकते हैं
    countDown: 5,
    role: 1, // 1 = Admin, 0 = User. अगर आप टेस्ट कर रहे हैं, तो इसे अस्थायी रूप से 0 कर सकते हैं।
    shortDescription: "ग्रुप में निकनेम लॉक/अनलॉक करें",
    longDescription: "ग्रुप के सदस्यों को उनके निकनेम बदलने से रोकता है।",
    category: "group",
    guide: "{p}locknick [on/off]"
  },

  // यह फ़ंक्शन तब चलता है जब कमांड चलाई जाती है
  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    const command = args[0] ? args[0].toLowerCase() : "";

    // अगर कोई आर्गुमेंट नहीं दिया गया
    if (command === "") {
      return message.reply("⚠️ कृपया उपयोग करें: `{p}locknick on` या `{p}locknick off`");
    }

    // "on" कमांड के लिए
    if (command === "on") {
      if (lockedNicknames[threadID]) {
        return message.reply("🔒 यह ग्रुप पहले से ही निकनेम लॉक मोड में है।");
      }

      try {
        const threadInfo = await api.getThreadInfo(threadID);
        if (!threadInfo || !threadInfo.userInfo) {
            return message.reply("ग्रुप की जानकारी प्राप्त करने में असमर्थ। सुनिश्चित करें कि बॉट ग्रुप में है और उसके पास अनुमतियाँ हैं।");
        }

        const currentNicks = {};
        for (const user of threadInfo.userInfo) {
          // बॉट का खुद का निकनेम लॉक न करें और अन्य सदस्यों के निकनेम स्टोर करें
          if (user.id !== api.getCurrentUserID()) {
            currentNicks[user.id] = user.nickname || ""; // अगर कोई निकनेम नहीं है तो खाली स्ट्रिंग
          }
        }

        lockedNicknames[threadID] = currentNicks;
        saveLockedNicknames(lockedNicknames); // डेटा सेव करें

        return message.reply("🔒 इस ग्रुप के सभी सदस्यों के निकनेम सफलतापूर्वक लॉक कर दिए गए हैं।");

      } catch (error) {
        console.error("locknick 'on' कमांड में त्रुटि:", error);
        return message.reply("निकनेम लॉक करते समय कोई त्रुटि हुई। कृपया लॉग जांचें।");
      }
    }
    // "off" कमांड के लिए
    else if (command === "off") {
      if (!lockedNicknames[threadID]) {
        return message.reply("⚠️ यह ग्रुप पहले से ही निकनेम अनलॉक मोड में है!");
      }

      try {
        delete lockedNicknames[threadID]; // ग्रुप का डेटा हटाएं
        saveLockedNicknames(lockedNicknames); // डेटा सेव करें

        return message.reply("✅ निकनेम लॉक सफलतापूर्वक हटा दिया गया। अब सदस्य अपना निकनेम बदल सकते हैं।");
      } catch (error) {
        console.error("locknick 'off' कमांड में त्रुटि:", error);
        return message.reply("निकनेम लॉक हटाते समय कोई त्रुटि हुई। कृपया लॉग जांचें।");
      }
    }
    // अमान्य कमांड
    else {
      return message.reply("❌ अमान्य विकल्प! कृपया उपयोग करें: `{p}locknick on` या `{p}locknick off`");
    }
  },

  // यह फ़ंक्शन तब चलता है जब कोई इवेंट होता है (जैसे कोई निकनेम बदलता है)
  onEvent: async function ({ event, api }) {
    const { threadID, logMessageType, logMessageData, senderID } = event;

    // यदि इस ग्रुप के लिए निकनेम लॉक नहीं है तो कुछ न करें
    if (!lockedNicknames[threadID]) return;

    // यदि यह एक निकनेम बदलने वाला लॉग संदेश है
    if (logMessageType === "log:thread-nickname") {
      const changedUserID = logMessageData.participant_id;
      const newNickname = logMessageData.nickname; // वह निकनेम जो यूजर ने सेट करने की कोशिश की

      // यदि बॉट खुद निकनेम बदल रहा है तो उसे अनदेखा करें ताकि लूप न हो
      if (changedUserID === api.getCurrentUserID()) {
        return;
      }

      const originalLockedNick = lockedNicknames[threadID][changedUserID];

      // यदि यूजर ने निकनेम बदला और यह सेव किए गए निकनेम से अलग है
      if (typeof originalLockedNick !== 'undefined' && newNickname !== originalLockedNick) {
        try {
          // निकनेम को वापस मूल पर सेट करें
          await api.changeNickname(originalLockedNick, threadID, changedUserID);

          // यूजर को सूचित करें कि निकनेम वापस बदल दिया गया है
          api.sendMessage(
            `🔄 "${newNickname || "blank"}" निकनेम का पता चला।\nपुराना निकनेम वापस सेट कर दिया गया: "${originalLockedNick || "blank"}".`,
            threadID
          );
        } catch (error) {
          console.error(`Error resetting nickname for user ${changedUserID} in thread ${threadID}:`, error);
          // यदि निकनेम रीसेट करने में त्रुटि हो तो एडमिन को सूचित कर सकते हैं
          // api.sendMessage(`❌ निकनेम रीसेट करने में त्रुटि हुई। कृपया जांचें।`, threadID);
        }
      }
    }
  }
};
