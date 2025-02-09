module.exports = (client) => {
  // const config = require("./config.json");
  client.login(process.env.TOKEN);

  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.api);

  // قاموس للردود المحددة
  const predefinedResponses = {
    "السلام عليكم": "وعليكم السلام ورحمة الله وبركاته",
    "صباح الخير": "صباح النور",
    "كيف حالك": "الحمد لله بخير",
    paypal: "123",
    cash: "12345",
  };

  async function run(msg, message) {
    // التحقق من وجود رد محدد للرسالة
    if (predefinedResponses[msg]) {
      message.reply(predefinedResponses[msg]);
    } else {
      // إذا لم يكن هناك رد محدد، استخدم Gemini للرد
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([msg]);
      message.reply(result.response.text());
    }
  }

  client.on("messageCreate", async (message) => {
    if (!message.author.bot) {
      const msg = message.content;
      run(msg, message);
    }
  });
};
