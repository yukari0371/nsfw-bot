import { SlashCommandBuilder } from "@discordjs/builders";
import pkg from 'discord.js';
const { MessageActionRow, ButtonBuilder, ButtonStyle } = pkg;
import axios from "axios";

const urls = [
    "https://waifu.pics/api/nsfw/waifu",
    "https://waifu.pics/api/nsfw/neko",
    "https://waifu.pics/api/nsfw/blowjob",
    "https://waifu.pics/api/nsfw/trap"
];

let mado = 0;

export default {
    data: new SlashCommandBuilder()
    .setName("random-image")
    .setDescription("Displays a random image.")
    .addStringOption(option =>
        option.setName("category")
        .setDescription("Category selection.")
        .setRequired(true)
        .addChoices(
            { name: "random", value: "random" },
            { name: "waifu", value:  urls[0] },
            { name: "neko", value: urls[1] },
            { name: "blowjob", value: urls[2] },
            { name: "trap", value: urls[3] }
        )
    ),
    async execute(interaction) {
        if (!interaction.channel.nsfw) {
            return await interaction.reply({
                embeds: [
                    {
                        title: "Oops, you there",
                        description: "🥵This command can only be used in NSFW channels.",
                        color: 0xED4245
                    }
                ],
            });
        }        
        let targetUrl = "";
        const category = interaction.options.getString("category");
        targetUrl = category;

        let msg;
        const imageUrls = [];
        let currentIndex = 0;

        try {
            if (category === "random") {
                targetUrl = urls[Math.floor(Math.random() * urls.length)];
            }
            const response = await axios.get(targetUrl);
            if (response.status === 200) {
                const resUrl = response.data.url;
                imageUrls.push(resUrl);
                msg = await interaction.reply({
                    embeds: [
                        {
                            title: "Random image",
                            image: {
                                url: resUrl
                            },
                            color: 0xFFDEF4
                        }
                    ],
                    fetchReply: true
                });
                const row = {
                    type: 1,
                    components: [
                        new ButtonBuilder()
                            .setCustomId('back')
                            .setLabel('⬅️')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('➡️')
                            .setStyle(ButtonStyle.Primary)
                    ]
                };                       

                await msg.edit({ components: [row] });

                const filter = (buttonInteraction) => !buttonInteraction.user.bot && buttonInteraction.message.id === msg.id && buttonInteraction.user.id === interaction.user.id;
                const buttonCollector = msg.createMessageComponentCollector({ filter, time: 180000 });
                buttonCollector.on('collect', async (buttonInteraction) => {
                    switch (buttonInteraction.customId) {
                        case "back":
                            if (currentIndex === 0) return;
                            currentIndex--;
                            await buttonInteraction.update({
                                embeds: [
                                    {
                                        title: "Random image",
                                        image: {
                                            url: imageUrls[currentIndex]
                                        },
                                        color: 0xFFDEF4
                                    }
                                ]
                            });
                        break;
                        case "next":
                            if (currentIndex + 1 < imageUrls.length) {
                                currentIndex++;
                                return await buttonInteraction.update({
                                    embeds: [
                                        {
                                            title: "Random image",
                                            image: {
                                                url: imageUrls[currentIndex]
                                            }
                                        }
                                    ]
                                });
                            }
                            if (category === "random") {
                                targetUrl = urls[Math.floor(Math.random() * urls.length)];
                            }
                            const response_1 = await axios.get(targetUrl);
                            if (response_1.status === 200) {
                                const resUrl_1 = response_1.data.url;
                                imageUrls.push(resUrl_1);
                                currentIndex++;
                                await buttonInteraction.update({
                                    embeds: [
                                        {
                                            title: "Random image",
                                            image: {
                                                url: resUrl_1
                                            },
                                            color: 0xFFDEF4
                                        }
                                    ]
                                });
                            } else {
                                return await interaction.reply({
                                    embeds: [
                                        {
                                            title: "Error",
                                            description: `Response status: ${response.status}`,
                                            color: 0xED4245
                                        }
                                    ],
                                });
                            }
                        break;
                        default:
                            return;
                    }
                });
                buttonCollector.on('end', async collected => {
                    await msg.edit({ components: [] });
                    await msg.edit({
                        embeds: [
                            {
                                title: "Timeout",
                                description: "Three minutes have passed."
                            }
                        ]
                    });
                });
            } else {
                return await msg.edit({
                    embeds: [
                        {
                            title: "Error",
                            description: `Response status: ${response.status}`,
                            color: 0xED4245
                        }
                    ],
                });
            }
        } catch (e) {
            return await interaction.reply({
                embeds: [
                    {
                        title: "Error",
                        description: e.message,
                        color: 0xED4245
                    }
                ],
            });
        }
    }
}