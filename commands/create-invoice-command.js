const { SlashCommandBuilder } = require("discord.js");

const createPaymentCommand = new SlashCommandBuilder()
  .setName("create-invoice")
  .setDescription("إنشاء فاتورة دفع جديدة")
  .addNumberOption((option) =>
    option
      .setName("amount")
      .setDescription("المبلغ المطلوب دفعه")
      .setRequired(true)
      .setMinValue(0.01)
  )
  .addStringOption((option) =>
    option
      .setName("description")
      .setDescription("وصف الفاتورة")
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(100)
  );

module.exports = createPaymentCommand.toJSON();
