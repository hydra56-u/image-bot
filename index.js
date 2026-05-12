require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

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

(async () => {
    await rest.put(
        Routes.applicationCommands("1503715390323294340"), // Replace this
        { body: commands }
    );
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