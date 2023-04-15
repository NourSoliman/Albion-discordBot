require(`dotenv`).config()
const express = require(`express`)
const app = express()
const { Client, GatewayIntentBits,  Embed, EmbedBuilder , MessageEmbed   } = require(`discord.js`)
const token = process.env.DISCORD_BOT_TOKEN;
const client = new Client({
    intents :[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
})
client.on(`ready` , () => {
    console.log(`Logged as ${client.user.tag}`);
})
client.on(`messageCreate` , async message => {
    if(message.author.bot) return;
    if(message.content.startsWith(`!P `)) {
        const args = message.content.split(` `);
        const itemName = args[1]
        const cities = args.slice(2 , 5);
        const searchUrl = `https://www.albion-online-data.com/api/v2/stats/prices/${itemName}?locations=${cities.map(city => city.toLowerCase()).join(',')}`; 
        
        try {
            const response = await fetch(searchUrl)

            const data = await response.json()
            // const itemName = data[0]?.localized_names?.[message.guild.preferredLocale ?? 'EN-US'] ?? args[1];

            console.log(data);
            const fields = []
            if (!data || data.length === 0) {
                throw new Error('No data available for the given item or cities.');
            }
        if (data && data.length > 0) {
            data.forEach((cityData)=>{
                const cityName= cityData.city
                const qualityLevel = cityData.quality_level || `N/A`;
                fields.push(
                    {name:`${cityName} Lowest Price` , value:`${cityData.sell_price_min}`, inline:true},
                    {name:`${cityName} Highest Buy Order` , value:`${cityData.buy_price_max}`, inline:true},
                )
            })
        }

        const embedBuilder = new EmbedBuilder()
        .setTitle(`${itemName} Prices in ${cities}`)
        .setDescription('The current buy and sell prices of the item in the city.')
        .setColor('#0099ff')
        .setTimestamp()
        .setFields(fields.slice(0 , 2))
        message.channel.send({ embeds: [embedBuilder] });
        } catch (error) {
            console.log(error)
            message.channel.send('Failed to fetch item data.');
        }
    }
})
client.login(token)