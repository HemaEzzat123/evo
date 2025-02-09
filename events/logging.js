const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {
  client.on("guildMemberAdd", async (member) => {
    const logChannel = client.channels.cache.get(client.config.LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor("#00FF00") // لون أخضر مميز
      .setTitle("🎉 عضو جديد انضم إلى السيرفر! 🎉")
      .setDescription(
        `**مرحباً بك يا ${member.user.username}!
      نتمنى لك وقتاً ممتعاً معنا!**`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 })) // صورة العضو
      .setImage(member.guild.bannerURL({ size: 1024 })) // صورة بانر السيرفر
      .addFields(
        { name: "👤 اسم المستخدم", value: member.user.tag, inline: true },
        { name: "🆔 الايدي", value: member.id, inline: true },
        {
          name: "📅 تاريخ الانضمام",
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
          inline: false,
        }
      )
      .setFooter({ text: `عدد الأعضاء الآن: ${member.guild.memberCount}` })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
