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

const APPLICATION_ID = "1503726778571816980";
const GUILD_ID = "1184927046103736350";

const commands = [
    new SlashCommandBuilder()
        .setName('image')
        .setDescription('Generate SDXL realistic image')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Describe your image')
                .setRequired(true)
        )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID),
            { body: commands }
        );
        console.log("✅ Slash commands registered!");
    } catch (err) {
        console.error(err);
    }
})();

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} is online!`);
});

client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'image') {

        await interaction.deferReply();

        const prompt = interaction.options.getString('prompt');

        // ✅ SDXL style optimized prompt
        const enhancedPrompt = `ultra realistic photo, 8k, cinematic lighting, highly detailed, ${prompt}`;

        const imageUrl =
            `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&model=sdxl&seed=${Math.floor(Math.random()*100000)}`;

        const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215))
            .setTitle("🎨 SDXL Realistic Image")
            .setDescription(`✨ **Prompt:** ${prompt}`)
            .setImage(imageUrl)
            .setFooter({ text: "SDXL Powered 🚀" })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
});

client.login(process.env.TOKEN);
