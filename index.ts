import { Client, Events, GatewayIntentBits } from "discord.js";
import { configDotenv } from "dotenv";

configDotenv();
const TOKEN = process.env.TOKEN;

const client = new Client({
  intents: GatewayIntentBits.Guilds,
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(TOKEN);
