const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors")
 
const token = "6092762702:AAF3RGrHqmU2I_WrTmk7CXum1MtwCPbbcK0";
const webAppUrl = "https://inspiring-alfajores-f78deb.netlify.app";
const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json())
app.use(cors())

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await bot.sendMessage(chatId, "Нижче з*явиться кнопка, заповни форму", {
      reply_markup: {
        keyboard: [
          [{ text: "Заповнити форму", web_app: { url: webAppUrl + "/form" } }],
        ],
      },
    });
    await bot.sendMessage(
      chatId,
      "Заходь в наш інтернет магазин по кнопці нижче",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Зробити замовлення", web_app: { url: webAppUrl } }],
          ],
        },
      }
    );
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      console.log(data)
      await bot.sendMessage(chatId, "Дякую за зворотній звязок!");
      await bot.sendMessage(chatId, "Ваша країна: " + data?.country);
      await bot.sendMessage(chatId, "Ваша вулиця: " + data?.street);

      setTimeout(async () => {
        await bot.sendMessage(
          chatId,
          "Всю інформацію ви отримаєте в цьому чаті"
        );
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  }
});

app.post('/web-data', async (req, res) => {
  const { queryId, products, totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Успішна покупка",
      input_message_content: {message_text: 'Вітаю з покупкою, ви придбали товар на суму ' + totalPrice}
    })
    return res.status(200).json({})
  } catch (e) {
        await bot.answerWebAppQuery(queryId, {
          type: "article",
          id: queryId,
          title: "Не вдалось здійснити покупку",
          input_message_content: {
            message_text:
              "Не вдалось здійснити покупку",
          },
        });
    return res.status(500).json({});
}
  
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT ))
