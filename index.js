require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
// const config = require("./config.json");

// استيراد الوحدات
const paypalHandler = require("./events/paypal");
const buttonHandler = require("./events/buttonHandler");
const invoice = require("./events/invoice");

// استيراد ملفات الحماية والأحداث
const eventFiles = [
  "./events/antiNuke",
  "./events/antiSpam",
  "./events/antiPhishing",
  "./events/logging",
  "./events/verification",
  "./events/ownerProtection",
  "./events/allMembersMessage",
  "./events/welcome",
  "./events/autoReactMessages",
  "./events/tickets",
  "./commands/security",
];

// إنشاء العميل (Client)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
  ],
});

// إعدادات البوت
client.config = {
  PREFIX: process.env.PREFIX,
  VERIFICATION_CHANNEL_ID: process.env.VERIFICATION_CHANNEL_ID,
  LOG_CHANNEL_ID: process.env.LOG_CHANNEL_ID,
  TOKEN: process.env.TOKEN,
  GUILD_ID: process.env.GUILD_ID,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  PAYPAL_MODE: process.env.PAYPAL_MODE,
  api: process.env.api,
};
client.commands = new Collection();

// تحميل الفواتير عند بدء التشغيل
paypalHandler.loadInvoices();

// تحميل ملفات الحماية والأحداث
eventFiles.forEach((file) => require(file)(client));

// حدث "ready" - عندما يكون البوت جاهزًا
client.once("ready", () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

// حدث "interactionCreate" - معالجة التفاعلات
// client.on("interactionCreate", async (interaction) => {
//   try {
//     if (interaction.isButton()) {
//       await buttonHandler.handleButtonInteraction(interaction, client);
//     }

//     // معالجة أوامر الدفع والتفاعلات
//     // await paypalHandler.handlePaymentCommand(interaction, client);
//     // await paypalHandler.handlePaymentInteraction(interaction, client);
//     await invoice.handleInvoiceInteraction(interaction, client);
//   } catch (error) {
//     console.error("Error handling interaction:", error);
//   }
// });

// حدث "error" - معالجة الأخطاء
client.on("error", (error) => {
  console.error("Client error:", error);
});

// معالجة الرفض غير المعالج (Unhandled Rejections)
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

// تسجيل دخول البوت
client.login(process.env.TOKEN);
