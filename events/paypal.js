const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const paypal = require("@paypal/checkout-server-sdk");
const fs = require("fs");

// PayPal Configuration
const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

// Store invoices in memory
const invoices = new Map();

module.exports = {
  name: "paypal-handler",

  async createInvoice(interaction, amount, description, currency = "USD") {
    try {
      // Validate input
      if (!amount || typeof amount !== "number" || amount <= 0) {
        throw new Error("المبلغ غير صالح");
      }

      if (!description || typeof description !== "string") {
        throw new Error("الوصف غير صالح");
      }

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            description: description,
          },
        ],
      });

      const order = await paypalClient.execute(request);
      const orderId = order.result.id;

      // Store invoice details
      invoices.set(orderId, {
        userId: interaction.user.id,
        channelId: interaction.channel.id,
        amount: amount,
        currency: currency,
        description: description,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      });

      // Save to file
      this.saveInvoices();

      return orderId;
    } catch (error) {
      console.error("PayPal Create Order Error:", error);
      throw error;
    }
  },

  async capturePayment(orderId) {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      const capture = await paypalClient.execute(request);

      if (invoices.has(orderId)) {
        const invoice = invoices.get(orderId);
        invoice.status = "PAID";
        invoice.paidAt = new Date().toISOString();
        this.saveInvoices();
      }

      return capture;
    } catch (error) {
      console.error("PayPal Capture Payment Error:", error);
      throw error;
    }
  },

  saveInvoices() {
    try {
      if (!fs.existsSync("./data")) {
        fs.mkdirSync("./data", { recursive: true });
      }
      const invoicesArray = Array.from(invoices.entries());
      fs.writeFileSync(
        "./data/invoices.json",
        JSON.stringify(invoicesArray, null, 2)
      );
    } catch (error) {
      console.error("Error saving invoices:", error);
    }
  },

  loadInvoices() {
    try {
      const data = fs.readFileSync("./data/invoices.json", "utf8");
      const invoicesArray = JSON.parse(data);
      invoices.clear();
      for (const [key, value] of invoicesArray) {
        invoices.set(key, value);
      }
    } catch (error) {
      console.log("No existing invoices found or error loading invoices");
    }
  },

  async handlePaymentCommand(interaction, client) {
    if (!interaction.isCommand()) return;
    if (interaction.commandName !== "create-payment") return;

    try {
      // التحقق من وجود الخيارات
      if (!interaction.options) {
        return await interaction.reply({
          content: "❌ خطأ: الخيارات غير موجودة",
          ephemeral: true,
        });
      }

      // استخراج القيم مع التحقق منها
      const amount = interaction.options.getNumber("amount", true); // مطلوب
      const description = interaction.options.getString("description", true);

      // طباعة القيم للتحقق
      console.log("📌 Amount:", amount);
      console.log("📌 Description:", description);

      if (!amount || isNaN(amount) || amount <= 0) {
        return await interaction.reply({
          content: "❌ يرجى تحديد مبلغ صالح (أكبر من 0)",
          ephemeral: true,
        });
      }

      if (!description || description.trim().length === 0) {
        return await interaction.reply({
          content: "❌ يرجى إضافة وصف صحيح للفاتورة",
          ephemeral: true,
        });
      }

      // إنشاء الفاتورة
      const orderId = await this.createInvoice(
        interaction,
        amount,
        description
      );

      console.log("✅ Order ID:", orderId);

      // إنشاء زر الدفع والرسالة
      const paymentEmbed = new EmbedBuilder()
        .setColor("#00A2E8")
        .setTitle("🛒 فاتورة دفع جديدة")
        .setDescription(
          `**الوصف:** ${description}\n**المبلغ:** $${amount.toFixed(2)}`
        )
        .addFields(
          { name: "حالة الدفع", value: "في انتظار الدفع", inline: true },
          { name: "رقم الفاتورة", value: orderId, inline: true }
        )
        .setTimestamp();

      const payButton = new ButtonBuilder()
        .setCustomId(`pay_${orderId}`)
        .setLabel("الدفع عبر PayPal")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("💳");

      const cancelButton = new ButtonBuilder()
        .setCustomId(`cancel_${orderId}`)
        .setLabel("إلغاء")
        .setStyle(ButtonStyle.Danger);

      const viewButton = new ButtonBuilder()
        .setCustomId(`view_${orderId}`)
        .setLabel("عرض الفاتورة")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(
        payButton,
        viewButton,
        cancelButton
      );

      await interaction.reply({
        embeds: [paymentEmbed],
        components: [row],
      });
    } catch (error) {
      console.error("❌ Payment Command Error:", error);
      await interaction.reply({
        content: `❌ حدث خطأ أثناء إنشاء الفاتورة: ${error.message}`,
        ephemeral: true,
      });
    }
  },

  async handlePaymentInteraction(interaction, client) {
    if (!interaction.isButton()) return;

    const [action, orderId] = interaction.customId.split("_");
    const invoice = invoices.get(orderId);

    if (!invoice) {
      return await interaction.reply({
        content: "❌ لم يتم العثور على الفاتورة",
        ephemeral: true,
      });
    }

    switch (action) {
      case "pay":
        try {
          // Generate PayPal checkout URL
          const paypalUrl = `https://www.paypal.com/checkoutnow?token=${orderId}`;

          await interaction.reply({
            content: `🔗 يرجى النقر على الرابط التالي لإكمال الدفع:\n${paypalUrl}`,
            ephemeral: true,
          });
        } catch (error) {
          console.error("Payment URL Error:", error);
          await interaction.reply({
            content: "❌ حدث خطأ أثناء إنشاء رابط الدفع",
            ephemeral: true,
          });
        }
        break;

      case "view":
        try {
          const invoiceEmbed = new EmbedBuilder()
            .setColor("#00A2E8")
            .setTitle("📋 تفاصيل الفاتورة")
            .addFields(
              { name: "رقم الفاتورة", value: orderId },
              { name: "المبلغ", value: `$${invoice.amount.toFixed(2)}` },
              { name: "الوصف", value: invoice.description },
              { name: "الحالة", value: invoice.status },
              {
                name: "تاريخ الإنشاء",
                value: new Date(invoice.createdAt).toLocaleString("ar-SA"),
              }
            );

          if (invoice.paidAt) {
            invoiceEmbed.addFields({
              name: "تاريخ الدفع",
              value: new Date(invoice.paidAt).toLocaleString("ar-SA"),
            });
          }

          await interaction.reply({
            embeds: [invoiceEmbed],
            ephemeral: true,
          });
        } catch (error) {
          console.error("View Invoice Error:", error);
          await interaction.reply({
            content: "❌ حدث خطأ أثناء عرض الفاتورة",
            ephemeral: true,
          });
        }
        break;

      case "cancel":
        try {
          if (invoice.status === "PAID") {
            return await interaction.reply({
              content: "❌ لا يمكن إلغاء فاتورة مدفوعة",
              ephemeral: true,
            });
          }

          invoice.status = "CANCELLED";
          this.saveInvoices();

          const cancelEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("❌ تم إلغاء الفاتورة")
            .setDescription(`تم إلغاء الفاتورة رقم: ${orderId}`);

          await interaction.update({
            embeds: [cancelEmbed],
            components: [],
          });
        } catch (error) {
          console.error("Cancel Invoice Error:", error);
          await interaction.reply({
            content: "❌ حدث خطأ أثناء إلغاء الفاتورة",
            ephemeral: true,
          });
        }
        break;
    }
  },

  // Initialize the handler
  init() {
    this.loadInvoices();
  },
};
