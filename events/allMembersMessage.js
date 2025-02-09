const { PermissionsBitField } = require("discord.js"); // تأكد من استيراد PermissionsBitField

module.exports = (client) => {
  require("dotenv").config();
  client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(process.env.PREFIX) || message.author.bot)
      return;

    const args = message.content
      .slice(process.env.PREFIX.length)
      .trim()
      .split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "createchannel") {
      try {
        // Create a private channel
        const guild = message.guild;

        const channel = await guild.channels.create({
          name: "📢・announcements",
          type: 0, // 0 = Text channel
          permissionOverwrites: [
            {
              id: guild.id, // @everyone role
              deny: [PermissionsBitField.Flags.ViewChannel], // Prevents everyone from seeing it
            },
            {
              id: client.user.id, // Bot
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
              ],
            },
          ],
        });

        message.reply(`✅ Created private channel: ${channel}`);
      } catch (err) {
        console.error(err);
        message.reply("❌ There was an error creating the channel.");
      }
    }

    if (command === "announce") {
      if (!args.length) {
        return message.reply("⚠️ Please provide a message to send.");
      }

      const announcement = args.join(" ");
      const guild = message.guild;

      // Send a private message to all members
      guild.members.cache.forEach((member) => {
        if (!member.user.bot) {
          member
            .send(
              `📢 **Announcement from ${message.guild.name}**:\n\n${announcement}`
            )
            .catch((err) => {
              console.log(`❌ Couldn't DM ${member.user.tag}`);
              console.error(err); // Log the error for further inspection
            });
        }
      });

      message.reply("✅ Announcement sent to all members.");
    }
  });
};
