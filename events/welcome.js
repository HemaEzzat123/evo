const { AttachmentBuilder } = require("discord.js");
require("dotenv").config();

module.exports = (client) => {
  client.on("guildMemberAdd", async (member) => {
    const channelId = "1336246820908830791"; // ضع هنا ID القناة
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    // إعداد صورة الترحيب
    const welcomeImageUrl =
      "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0"; // صورة خلفية ثابتة

    // تحميل صورة البروفايل
    const avatarUrl = member.user.displayAvatarURL({
      extension: "jpg",
      size: 256,
    });

    // إنشاء مرفق للصورة
    const attachment = new AttachmentBuilder(welcomeImageUrl, {
      name: "welcome-image.png",
    });

    // إرسال رسالة الترحيب إلى القناة
    channel.send({
      content: `🎉 Welcome <@${member.id}> to **${member.guild.name}**!`,
      files: [attachment],
    });

    // إرسال رسالة ترحيب خاصة للعضو الجديد
    try {
      await member.send(
        `👋 Hey **${member.user.username}**, welcome to **${member.guild.name}**! 🎉\n\n📜 **Rules:**\n1️⃣ Be respectful\n2️⃣ No spam\n3️⃣ Follow Discord's ToS\n\nEnjoy your stay! 😊`
      );
    } catch (err) {
      console.log(`❌ لم أستطع إرسال رسالة خاصة إلى ${member.user.tag}`);
    }
  });
};
