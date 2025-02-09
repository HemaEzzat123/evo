const { EmbedBuilder } = require("discord.js");

module.exports = {
  async handleButtonInteraction(interaction) {
    try {
      // Check if there's an embed to update
      if (interaction.customId === "confirm_payment") {
        if (!interaction.message.embeds[0]) {
          return interaction.reply({
            content: "❌ **لم يتم العثور على المعلومات في الرسالة.**",
            ephemeral: true,
          });
        }

        const embed = EmbedBuilder.from(interaction.message.embeds[0]);
        embed.spliceFields(4, 1, {
          name: "🟢 الحالة:",
          value: "✅ PAID",
          inline: true,
        });

        await interaction.update({ embeds: [embed], components: [] });
        await interaction.followUp({
          content: "💰 **تم تأكيد الدفع بنجاح!**",
          ephemeral: true,
        });
      } else if (interaction.customId === "cancel_invoice") {
        await interaction.message.delete();
        await interaction.reply({
          content: "❌ **تم إلغاء الفاتورة.**",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error handling button interaction:", error);
      await interaction.reply({
        content: "❌ حدث خطأ أثناء التعامل مع التفاعل.",
        ephemeral: true,
      });
    }
  },
};
