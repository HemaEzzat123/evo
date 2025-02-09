module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(client.config.PREFIX) || message.author.bot)
      return;
    const args = message.content
      .slice(client.config.PREFIX.length)
      .trim()
      .split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "lockall") {
      message.guild.channels.cache.forEach((channel) =>
        channel.permissionOverwrites.edit(message.guild.id, {
          SendMessages: false,
        })
      );
      message.reply("🔒 **تم قفل جميع القنوات!**");
    }

    if (command === "unlockall") {
      message.guild.channels.cache.forEach((channel) =>
        channel.permissionOverwrites.edit(message.guild.id, {
          SendMessages: true,
        })
      );
      message.reply("🔓 **تم فتح جميع القنوات!**");
    }
  });
};
