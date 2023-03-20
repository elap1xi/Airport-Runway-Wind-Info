var { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token, AVWX_key, AirportDB_Key } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    function waitTwoSeconds() {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, 5000);
        });
    }

    if (message.webhookId === '494888240617095168') {   // Automatically response when Discord "AvBot" is used
        await waitTwoSeconds();
        var Embed_title = message.embeds[0].data.title; // To Get ICAO Code from AvBot's Embed
        // var Embed_description = message.embeds[0].data.description;
        var Embed_color = message.embeds[0].data.color;
        if(Embed_color==39423){
            var Embed_title = Embed_title.replace("METAR: `","");
            var icao = Embed_title.replace("`","");
            async function Parse(ICAO, AVWX_key, AirportDB_Key){
                const URL_ADB = `https://airportdb.io/api/v1/airport/${ICAO}?apiToken=${AirportDB_Key}`;
                const URL_AVWX = `https://avwx.rest/api/metar/${ICAO}`;
                var json_avwx = await fetch(URL_AVWX, {
                    headers:{
                        'Authorization':AVWX_key
                    }
                })
                .then(res => res.json())
                .catch(error => erq(error));
            
                Wind_dir = json_avwx.wind_direction.value;
                Wind_spd = json_avwx.wind_speed.value;
                
                var json_ADB = await fetch(URL_ADB)
                .then(res => res.json())
                .catch(error => erq(error));
                
                var RWY_num=[], RWY_dir=[]; RWY_le=[]; RWY_he=[];
                Runway_length = json_ADB.runways.length;
                for(i=0; i<Runway_length; i++){
                // Runway Number
                    RWYNUM_le = json_ADB.runways[i].le_ident;
                    RWYNUM_he = json_ADB.runways[i].he_ident;
                    RWY_num.push(RWYNUM_le);
                    RWY_num.push(RWYNUM_he);
                    RWY_le.push(RWYNUM_le);
                    RWY_he.push(RWYNUM_he);
                // Runway Heading
                    RWYHDG_le = json_ADB.runways[i].le_heading_degT;
                    RWYHDG_he = json_ADB.runways[i].he_heading_degT;
                    if(RWYHDG_le==''){
                        RWYNUM_le = RWYNUM_le.replace(/[A-Za-z]/g, ''); // Remove Alphabet
                        if (RWYNUM_le.startsWith('0')) {
                            RWYNUM_le = RWYNUM_le.substring(1) * 10;
                        } else {
                            RWYNUM_le = RWYNUM_le * 10;
                        }
                        RWYHDG_le = RWYNUM_le;
                    }
                    if(RWYHDG_he==''){
                        RWYNUM_he = RWYNUM_he.replace(/[A-Za-z]/g, '');
                        if (RWYNUM_he.startsWith('0')) {
                            RWYNUM_he = RWYNUM_he.substring(1) * 10;
                        } else {
                            RWYNUM_he = RWYNUM_he * 10;
                        }
                        RWYHDG_he = RWYNUM_he;
                    }
                    RWY_dir.push(RWYHDG_le);
                    RWY_dir.push(RWYHDG_he);
                    // End
                }
                var Result = [];
                for(l=0; l<RWY_num.length; l++){
                    var Runway_direction = RWY_dir[l];
                    var Cross_wind = (((Math.sin((Wind_dir - Runway_direction) * Math.PI / 180))*Wind_spd));
                    var Head_wind = (((Math.cos((Wind_dir - Runway_direction) * Math.PI / 180))*Wind_spd));
                // Crosswind Calculate
                    if(Cross_wind>0){ 
                        var crs_dir = 'Right';
                        Cross_wind = Math.round(Cross_wind); }
                    else if(Cross_wind<0){ 
                        var crs_dir = 'Left';
                        Cross_wind = Math.round(Cross_wind); }
                    else{ 
                        var crs_dir = " ";
                        Cross_wind = Math.round(Cross_wind); }
                // Head(Tail)wind Calculate
                    if(Head_wind>0){
                        var wnd_type = '🟢 Headwind'
                        Head_wind = Math.round(Head_wind);  }
                    else if(Head_wind<0){
                        var wnd_type = '⚪ Tailwind'
                        Head_wind =  Math.round(Head_wind);  }
                    else{
                        var wnd_type = " ";
                        Head_wind = Math.round(Head_wind);  }
                // Runway Group
                    if((l+1)%2==0){
                        var GR_rwy = RWY_le[((l+1)/2)-1];
                    } else {
                        var GR_rwy = RWY_he[((l+2)/2)-1]
                    }
                    var Result_text = `Runway : ${RWY_num[l]}(${wnd_type}/${Math.abs(Head_wind)}kts)\nCrosswind : ${Math.abs(Cross_wind)}kts / from ${crs_dir}\nInverted Mark : ${GR_rwy}\n`;
            
                    Result.push(Result_text);
                }
                return Result;
            }
            Result = await Parse(icao, AVWX_key, AirportDB_Key);
            result_txt = String(Result.join('\n'))
            const chk_embds = new EmbedBuilder()
            .setColor(0xffffff).setTitle(`${icao} Wind Info`)
            .setDescription(`${result_txt}`)
            .setTimestamp()
            .setFooter({text: `Source : AVWX, AirportsDB API`})
            await message.channel.send({ embeds: [chk_embds]});
        }
    }
});

client.login(token);
