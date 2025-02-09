const blockedLinks = [
  "discord.gg",
  "bit.ly",
  "tinyurl.com",
  "free-nitro",
  "fuck you",
  "shit",
  "fuck",
  "bitch",
  "cunt",
  "asshole",
  "nigger",
  "nigga",
  "niga",
  "nig",
  "nig",
  "a7a",
  "احا",
];

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // Check if the message contains any of the blocked links
    if (blockedLinks.some((link) => message.content.includes(link))) {
      await message.delete();
      await message.channel.send("🚫 **ممنوع نشر الروابط المشبوهة!**");
    }
  });
};
