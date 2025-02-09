require("dotenv").config();
const { MessageActionRow, MessageButton } = require("discord.js");

module.exports = (client) => {
  // عندما ينضم عضو جديد
  client.on("guildMemberAdd", async (member) => {
    const verificationChannel = client.channels.cache.get(
      client.config.VERIFICATION_CHANNEL_ID
    );
    if (!verificationChannel) return;

    // إنشاء الزر
    const verifyButton = new MessageButton()
      .setCustomId("verify") // ID فريد للزر
      .setLabel("Verify") // نص الزر
      .setStyle("PRIMARY"); // نوع الزر (يمكنك تغييره حسب الحاجة)

    // إنشاء صف من الرسائل
    const row = new MessageActionRow().addComponents(verifyButton);

    // إرسال الرسالة مع الزر
    await verificationChannel.send({
      content: `👋 مرحبًا ${member}, من فضلك اضغط على الزر لتأكيد أنك لست بوت.`,
      components: [row],
    });
  });

  // التعامل مع التفاعل عند الضغط على الزر
  client.on("interactionCreate", async (interaction) => {
    // التأكد من أن التفاعل هو زر وأنه من قناة التحقق
    if (!interaction.isButton()) return;
    if (interaction.customId !== "verify") return;
    if (interaction.channel.id !== client.config.VERIFICATION_CHANNEL_ID)
      return;

    try {
      // إضافة الدور للعضو
      await interaction.member.roles.add("1335727492450746448"); // أدخل ID الدور المناسب هنا
      await interaction.reply("✅ **تم التحقق منك!**");
    } catch (error) {
      console.error("خطأ أثناء إضافة الدور:", error);
      await interaction.reply("❌ هناك مشكلة أثناء التحقق منك. حاول مرة أخرى.");
    }
  });
};
