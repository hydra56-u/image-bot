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
    await rest.put(
        Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID),
        { body: commands }
    );
})();

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} is online!`);
});

client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'image') {

        await interaction.deferReply();

        const prompt = interaction.options.getString('prompt');

        try {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.HF_TOKEN}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        inputs: prompt
                    })
                }
            );

            const buffer = await response.arrayBuffer();
            const image = Buffer.from(buffer);

            const embed = new EmbedBuilder()
                .setColor(Math.floor(Math.random() * 16777215))
                .setTitle("🎨 SDXL Image")
                .setDescription(`✨ **Prompt:** ${prompt}`)
                .setImage("attachment://image.png")
                .setTimestamp();

            await interaction.editReply({
                embeds: [embed],
                files: [{ attachment: image, name: "image.png" }]
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply("❌ SDXL generation failed.");
        }
    }

});

client.login(process.env.TOKEN);
