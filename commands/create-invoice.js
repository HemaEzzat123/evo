const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

// إعداد البوت
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Access guilds (servers)
    GatewayIntentBits.GuildMessages, // Access messages in guilds
    GatewayIntentBits.MessageContent, // Access message content (required for bots that need to read message contents)
  ],
});

client.on("ready", () => {
  console.log(`${client.user.tag} has logged in.`);
});

// الكود الأساسي لإضافة الزر وإنشاء الفاتورة
module.exports = {
  data: {
    name: "create_invoice", // اسم الأمر
    description: "إنشاء فاتورة عند الضغط على الزر",
  },

  async execute(interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId === "create_invoice_button") {
      const amount = 100; // المبلغ الثابت هنا يمكنك تعديله أو استخراجه من التفاعل
      const buyer = "المشتري"; // يمكن تعديل اسم المشتري هنا أو استخراجه من التفاعل
      const invoiceId = `Invoice#${Math.floor(
        1000 + Math.random() * 9000
      )}_Ticket#${Math.floor(Math.random() * 10)}`;

      // استرجاع القناة من خلال المعرف
      const invoiceChannelId = "1336474198960377951"; // قم بوضع معرف القناة التي تريد إرسال الفاتورة إليها
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

      // إرسال الفاتورة في القناة المحددة
      await invoiceChannel.send({ embeds: [embed], components: [buttons] });

      // رد خاص لمنشئ الطلب
      await interaction.reply({
        content: "✅ **تم إنشاء الفاتورة بنجاح في القناة المحددة!**",
        ephemeral: true,
      });
    }
  },

  // دالة لمعالجة التفاعل مع الأزرار
  async handleInvoiceInteraction(interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId === "confirm_payment") {
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
  },

  // دالة لإضافة زر "إنشاء فاتورة" في مكان معين
  async addCreateInvoiceButton(interaction) {
    const button = new ButtonBuilder()
      .setLabel("إنشاء فاتورة")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("create_invoice_button");

    const row = new ActionRowBuilder().addComponents(button);

    // إرسال الزر في القناة
    await interaction.reply({
      content: "💳 اضغط على الزر لإنشاء الفاتورة.",
      components: [row],
      ephemeral: true,
    });
  },
};

// إدارة الأحداث عند إرسال رسائل
client.on("messageCreate", async (message) => {
  if (message.content === "!createInvoice") {
    // إرسال الزر لإنشاء الفاتورة عند كتابة الأمر
    await module.exports.addCreateInvoiceButton(message);
  }
});

// التعامل مع التفاعلات
client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    await module.exports.handleInvoiceInteraction(interaction);
  }
});

// تسجيل الدخول باستخدام التوكن الخاص بالبوت
client.login(process.env.TOKEN);
