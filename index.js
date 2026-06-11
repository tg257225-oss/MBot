require("dotenv").config();
const axios = require("axios")

const { App } = require("@slack/bolt")

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true
});

app.command("/m-ping", async ({ command, ack, respond}) => {
    const start = Date.now();
    await ack();
    const latency = Date.now() - start;
    await respond({ text: `Ping!\nLatency: ${latency}ms` });
});

(async () => {
    await app.start();
    console.log("bot is running!");
})();

app.command("/m-help", async ({ ack, respond }) => {
    await ack();
    await respond({
        text:
        `Available Commands:
    /m-ping - Check bot latency
    /m-catfact - Shows a random cat fact
    /m-dogfact - Shows a random dog fact
    /m-coinflip (heads/tails) - Plays a game of coinflip
    /m-qotd - Shows a random quote
    `
    });
});

app.command("/m-catfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "Failed to fetch a cat fact." });
  }
});

app.command("/m-dogfact", async ({ ack, respond }) => {
    await ack();

    try {
        const response = await axios.get("https://dogapi.dog/api/v1/facts")
        const dogFact = response.data.facts[0];
        await respond({ text: `Dog Fact:\n${dogFact}` });
    } catch (err) {
        await respond({ text: "Failed to fetch a dog fact."});
    }
})

app.command("/m-coinflip", async ({ command, ack, respond }) => {
    await ack();

    const userChoice = command.text.trim().toLowerCase();
    if (userChoice !== 'heads' && userChoice !== 'tails') {
        await respond({
            text: 'Please choose either "heads" or "tails"! Example: /m-coinflip heads',
            response_type: 'ephemeral'
        });
        return;
    }

    const coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
    if (userChoice === coinResult) {
        await respond({ text: `You flipped ${userChoice} and won! 🎉` });
    } else {
        await respond({ text: `You flipped ${userChoice} but it was ${coinResult}. Better luck next time!` });
    }
});

app.command("/m-qotd", async ({ ack, respond }) => {
    await ack();
    try {
        // 1. Fetch from the unlimited public CDN endpoint
        const response = await axios.get("https://type.fit/api/quotes");
        
        // 2. Pick a random quote from the array
        const quotes = response.data;
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        
        // 3. Fix: Extract using .text (instead of .q) and handle the author formatting
        const quoteText = randomQuote.text;
        const authorName = randomQuote.author ? randomQuote.author.split(',')[0].trim() : "Unknown";
        
        // 4. Send the clean text to Slack
        await respond({ text: `QOTD:\n"${quoteText}" — ${authorName}` });
    } catch (err) {
        console.error(err);
        await respond({ text: "Failed to fetch a quote." });
    }
});