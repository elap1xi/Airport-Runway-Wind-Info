var { AVWX_key, AirportDB_Key, AVWX_key } = require('./config.json');
var ICAO = 'RKSI';  // Airport ICAO Code

async function Parse(ICAO, AVWX_key, AirportDB_Key){
    const URL_ADB = `https://airportdb.io/api/v1/airport/${ICAO}?apiToken=${AirportDB_Key}`;
    const URL_AVWX = `https://avwx.rest/api/metar/${ICAO}`;
    var json_avwx = await fetch(URL_AVWX, {
        headers:{
            'Authorization':AVWX_key
        }
    })
    .then(res => res.json())
    .catch(error => console.log(error));

    Wind_dir = json_avwx.wind_direction.value;  // Wind Direction
    Wind_spd = json_avwx.wind_speed.value;      // Wind Speed
    
    var json_ADB = await fetch(URL_ADB)
    .then(res => res.json())
    .catch(error => console.log(error));
    
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
    // Inverted Runway
        if((l+1)%2==0){
            var GR_rwy = RWY_le[((l+1)/2)-1];
        } else {
            var GR_rwy = RWY_he[((l+2)/2)-1]
        }
        var Result_text = `Runway : ${RWY_num[l]}(${wnd_type}/${Math.abs(Head_wind)}kts)\nCrosswind : ${Math.abs(Cross_wind)}/from ${crs_dir}\nInverted Mark : ${GR_rwy}`;  // This made for Discord Embed
        Result.push(Result_text);
    }
    console.log(Result);
}

Parse(ICAO, AVWX_key, AirportDB_Key);  
