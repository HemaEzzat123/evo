const messageCache = new Map();

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;
    const now = Date.now();

    if (!messageCache.has(userId)) {
      messageCache.set(userId, []);
    }

    const timestamps = messageCache.get(userId);
    timestamps.push(now);

    while (timestamps.length > 0 && timestamps[0] < now - 5000) {
      timestamps.shift();
    }

    if (timestamps.length > 5) {
      await message.member.timeout(10 * 400000, "🚨 سبام تم اكتشافه!");
      await message.reply("🚫 **تم توقيفك مؤقتًا بسبب السبام!**");
    }
  });
};
