require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    Routes,
    EmbedBuilder
} = require('discord.js');

const { REST } = require('@discordjs/rest');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ✅ PUT YOUR IDS HERE
const APPLICATION_ID = "1503726778571816980";
const GUILD_ID = "1184927046103736350";

// ✅ Slash Command
const commands = [
    new SlashCommandBuilder()
        .setName('image')
        .setDescription('Generate beautiful AI image')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Describe your image')
                .setRequired(true)
        )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// ✅ Register Guild Commands (Instant)
(async () => {
    try {
        console.log("🔄 Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID),
            { body: commands }
        );

        console.log("✅ Slash commands registered!");
    } catch (error) {
        console.error("❌ Command register error:", error);
    }
})();

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} is online!`);
});

// ✅ Interaction Handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'image') {
        try {
            await interaction.deferReply();

            const prompt = interaction.options.getString('prompt');

            if (!prompt) {
                return await interaction.editReply("❌ Please provide a prompt.");
            }

            const imageUrl =
                `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024`;

            const embed = new EmbedBuilder()
                .setColor("#8A2BE2")
                .setTitle("🎨 AI Image Generated")
                .setDescription(`✨ **Prompt:** ${prompt}`)
                .setImage(imageUrl)
                .setFooter({ text: "Free Image Bot 🚀" })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Image command error:", error);

            if (interaction.deferred) {
                await interaction.editReply("❌ Failed to generate image. Try again.");
            } else {
                await interaction.reply("❌ Something went wrong.");
            }
        }
    }
});

client.login(process.env.TOKEN);
