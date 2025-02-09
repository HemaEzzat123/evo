module.exports = (client) => {
  require("dotenv").config();

  client.on("messageCreate", async (message) => {
    // Replace with your target channel ID
    const targetChannelId = "1336266187801235502";

    // Ignore messages from bots and ensure it's in the correct channel
    if (message.author.bot || message.channel.id !== targetChannelId) return;

    try {
      // React with multiple emojis
      await message.react("❤");
      await message.react("💙");
      await message.react("💌");
    } catch (error) {
      console.error("❌ Failed to react:", error);
    }
  });
};
