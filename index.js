require('dotenv').config();

const { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    Routes 
} = require('discord.js');

const { REST } = require('@discordjs/rest');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ✅ Replace these two IDs
const APPLICATION_ID = "1503726778571816980"; // Your Application ID
const GUILD_ID = "1184927046103736350"; // Your Server ID

// ✅ Slash Command
const commands = [
    new SlashCommandBuilder()
        .setName('image')
        .setDescription('Generate free AI image')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Describe your image')
                .setRequired(true)
        )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// ✅ Register Guild Commands (Instant)
(async () => {
    try {
        console.log("🔄 Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID),
            { body: commands }
        );

        console.log("✅ Slash commands registered instantly!");
    } catch (error) {
        console.error(error);
    }
})();

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} is online!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'image') {
        const prompt = interaction.options.getString('prompt');

        await interaction.deferReply();

        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024`;

        await interaction.editReply({
            content: `🎨 Image for: **${prompt}**`,
            files: [imageUrl]
        });
    }
});

client.login(process.env.TOKEN);
