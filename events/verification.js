module.exports = (client) => {
  client.on("guildMemberAdd", async (member) => {
    const verificationChannel = client.channels.cache.get(
      client.config.VERIFICATION_CHANNEL_ID
    );
    if (!verificationChannel) return;

    await verificationChannel.send(
      `👋 مرحبًا ${member}, من فضلك أدخل **!verify** لتأكيد أنك لست بوت.`
    );
  });

  client.on("messageCreate", async (message) => {
    if (
      message.content === "!verify" &&
      message.channel.id === client.config.VERIFICATION_CHANNEL_ID
    ) {
      await message.member.roles.add("1335727492450746448");
      await message.reply("✅ **تم التحقق منك!**");
    }
  });
};
