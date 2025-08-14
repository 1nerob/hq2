module.exports.config = {
  name: "coinflip",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "RUDRA", // Credit locked
  description: "Flip a coin and get heads or tails.",
  commandCategory: "game",
  usages: "[coinflip]",
  cooldowns: 3
};

const realCredit = "RUDRA"; // Locking credit

module.exports.run = async function({ api, event }) {
  try {
    if (module.exports.config.credits !== realCredit) {
      return api.sendMessage("❌ Credits পরিবর্তন করা যাবে না! (Locked by RUDRA)", event.threadID, event.messageID);
    }

    const outcomes = [
      "🪙 **Heads** 🎯",
      "🪙 **Tails** 🎯"
    ];

    const result = outcomes[Math.floor(Math.random() * outcomes.length)];

    return api.sendMessage(
      `🎲 Coin Flip Result:\n\n${result}`,
      event.threadID,
      event.messageID
    );

  } catch (e) {
    return api.sendMessage("❌ কিছু ভুল হয়েছে, পরে আবার চেষ্টা করুন।", event.threadID, event.messageID);
  }
};
