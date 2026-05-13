require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    Routes,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} = require('discord.js');

const { REST } = require('@discordjs/rest');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const APPLICATION_ID = "1503726778571816980";
const GUILD_ID = "1184927046103736350";

function randomColor() {
    return Math.floor(Math.random() * 16777215);
}

// ✅ Slash Command
const commands = [
    new SlashCommandBuilder()
        .setName('image')
        .setDescription('Generate advanced AI images')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Describe your image')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('quality')
                .setDescription('Image quality')
                .setRequired(false)
                .addChoices(
                    { name: 'Normal (1024px)', value: '1024' },
                    { name: 'HD (2048px)', value: '2048' }
                )
        )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    await rest.put(
        Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID),
        { body: commands }
    );
    console.log("✅ Slash commands registered!");
})();

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} is online!`);
});

client.on('interactionCreate', async interaction => {

    // ✅ Slash Command
    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'image') {

            await interaction.deferReply();

            const prompt = interaction.options.getString('prompt');
            const quality = interaction.options.getString('quality') || "1024";

            const styledPrompt = prompt;

            const embeds = [];

            for (let i = 0; i < 4; i++) {
                const imageUrl =
                    `https://image.pollinations.ai/prompt/${encodeURIComponent(styledPrompt)}?width=${quality}&height=${quality}&seed=${Math.floor(Math.random()*100000)}`;

                const embed = new EmbedBuilder()
                    .setColor(randomColor())
                    .setTitle(`🎨 AI Image ${i + 1}`)
                    .setDescription(`✨ **Prompt:** ${prompt}`)
                    .setImage(imageUrl)
                    .setFooter({ text: "Free AI Image Bot 🚀" })
                    .setTimestamp();

                embeds.push(embed);
            }

            const regenerateButton = new ButtonBuilder()
                .setCustomId(`regen_${prompt}_${quality}`)
                .setLabel("🔄 Regenerate")
                .setStyle(ButtonStyle.Primary);

            const styleMenu = new StringSelectMenuBuilder()
                .setCustomId(`style_${prompt}_${quality}`)
                .setPlaceholder("🎭 Choose Style")
                .addOptions([
                    { label: "Anime", value: "anime" },
                    { label: "Realistic", value: "realistic" },
                    { label: "Fantasy", value: "fantasy" }
                ]);

            const row1 = new ActionRowBuilder().addComponents(regenerateButton);
            const row2 = new ActionRowBuilder().addComponents(styleMenu);

            await interaction.editReply({
                embeds: embeds,
                components: [row1, row2]
            });
        }
    }

    // ✅ Regenerate Button
    if (interaction.isButton()) {

        if (interaction.customId.startsWith("regen_")) {

            await interaction.deferUpdate();

            const parts = interaction.customId.split("_");
            const prompt = parts[1];
            const quality = parts[2];

            const embeds = [];

            for (let i = 0; i < 4; i++) {
                const imageUrl =
                    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${quality}&height=${quality}&seed=${Math.floor(Math.random()*100000)}`;

                const embed = new EmbedBuilder()
                    .setColor(randomColor())
                    .setTitle(`🎨 AI Image ${i + 1}`)
                    .setDescription(`✨ **Prompt:** ${prompt}`)
                    .setImage(imageUrl)
                    .setTimestamp();

                embeds.push(embed);
            }

            await interaction.editReply({ embeds: embeds });
        }
    }

    // ✅ Style Selector
    if (interaction.isStringSelectMenu()) {

        if (interaction.customId.startsWith("style_")) {

            await interaction.deferUpdate();

            const selectedStyle = interaction.values[0];
            const parts = interaction.customId.split("_");
            const prompt = parts[1];
            const quality = parts[2];

            const styledPrompt = `${selectedStyle} style ${prompt}`;

            const embeds = [];

            for (let i = 0; i < 4; i++) {
                const imageUrl =
                    `https://image.pollinations.ai/prompt/${encodeURIComponent(styledPrompt)}?width=${quality}&height=${quality}&seed=${Math.floor(Math.random()*100000)}`;

                const embed = new EmbedBuilder()
                    .setColor(randomColor())
                    .setTitle(`🎨 ${selectedStyle.toUpperCase()} Image ${i + 1}`)
                    .setDescription(`✨ **Prompt:** ${styledPrompt}`)
                    .setImage(imageUrl)
                    .setTimestamp();

                embeds.push(embed);
            }

            await interaction.editReply({ embeds: embeds });
        }
    }

});

client.login(process.env.TOKEN);
