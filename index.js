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
                        inputs: prompt,
                        options: { wait_for_model: true }
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("HF Error:", errorText);
                return await interaction.editReply("❌ Model loading or API error. Try again in 30 seconds.");
            }

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
            console.error("Generation Error:", error);
            await interaction.editReply("❌ SDXL generation failed. Server busy.");
        }
    }
});
