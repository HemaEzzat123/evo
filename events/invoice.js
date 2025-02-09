module.exports = {
  data: require("../commands/create-invoice"),
  async execute(interaction) {
    try {
      const amount = interaction.options.getNumber("amount");
      const buyer = interaction.options.getString("buyer");
      const invoiceId = `Invoice#${Math.floor(
        1000 + Math.random() * 9000
      )}_Ticket#${Math.floor(Math.random() * 10)}`;

      // Replace with the channel ID you want to use
      const invoiceChannelId = "1336474198960377951"; // <-- Add the channel ID here
      const invoiceChannel =
        interaction.guild.channels.cache.get(invoiceChannelId);

      if (!invoiceChannel) {
        return interaction.reply({
          content: "❌ **لا يوجد قناة بالمعرف المحدد!**",
          ephemeral: true,
        });
      }

      // إنشاء الـ Embed
      const embed = new EmbedBuilder()
        .setTitle("💳 **فاتورة جديدة**")
        .setDescription(`💰 **إجمالي المبلغ المستحق:** \`$${amount}\``)
        .setColor("#0079C1")
        .addFields(
          { name: "👤 المشتري:", value: buyer, inline: true },
          { name: "📌 معرف الفاتورة:", value: invoiceId, inline: true },
          { name: "🛒 العناصر:", value: "1", inline: true },
          {
            name: "🔄 المدفوعات التلقائية:",
            value: `[${invoiceId}](https://www.paypal.com/invoice/p/#${invoiceId})`,
            inline: false,
          },
          { name: "🟡 الحالة:", value: "❌ UNPAID", inline: true }
        )
        .setThumbnail("https://www.paypalobjects.com/webstatic/icon/pp258.png")
        .setImage(
          "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.paypal.com/invoice/p/#" +
            invoiceId
        );

      // إنشاء الأزرار
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("رابط الفاتورة")
          .setStyle(ButtonStyle.Link)
          .setURL(`https://www.paypal.com/invoice/p/#${invoiceId}`),

        new ButtonBuilder()
          .setLabel("تأكيد الدفع")
          .setStyle(ButtonStyle.Success)
          .setCustomId("confirm_payment"),

        new ButtonBuilder()
          .setLabel("إلغاء الفاتورة")
          .setStyle(ButtonStyle.Danger)
          .setCustomId("cancel_invoice")
      );

      console.log("Sending invoice to channel...");

      // إرسال الفاتورة في القناة المحددة
      await invoiceChannel.send({ embeds: [embed], components: [buttons] });

      // رد خاص لمنشئ الطلب
      await interaction.reply({
        content: "✅ **تم إنشاء الفاتورة بنجاح في القناة المحددة!**",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error in creating invoice:", error);
      await interaction.reply({
        content: "❌ **حدث خطأ أثناء إنشاء الفاتورة.**",
        ephemeral: true,
      });
    }
  },

  async handleInvoiceInteraction(interaction) {
    if (!interaction.isButton()) return;

    try {
      // Helper function for replying with ephemeral content
      const sendEphemeralReply = async (content) => {
        await interaction.reply({
          content,
          ephemeral: true,
        });
      };

      if (interaction.customId === "confirm_payment") {
        const embed = EmbedBuilder.from(interaction.message.embeds[0]);

        // Update embed with payment confirmation
        embed.spliceFields(4, 1, {
          name: "🟢 الحالة:",
          value: "✅ PAID",
          inline: true,
        });

        // Update message embed and remove buttons
        await interaction.update({ embeds: [embed], components: [] });

        // Provide confirmation feedback
        await sendEphemeralReply("💰 **تم تأكيد الدفع بنجاح!**");
      } else if (interaction.customId === "cancel_invoice") {
        // Confirm deletion and notify user
        await interaction.message.delete();
        await sendEphemeralReply("❌ **تم إلغاء الفاتورة.**");
      } else {
        // Handle unexpected interaction type
        await sendEphemeralReply("⚠️ **الحدث غير معروف.**");
      }
    } catch (error) {
      console.error("Error in handling interaction:", error);

      // Provide error feedback to the user
      await interaction.reply({
        content: `❌ **حدث خطأ أثناء معالجة التفاعل: ${error.message}**`,
        ephemeral: true,
      });
    }
  },
};
