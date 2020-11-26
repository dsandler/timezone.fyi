const functions = require('firebase-functions');
// const moment = require('moment-timezone');
const dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc') // dependent on utc plugin
var timezone = require('dayjs/plugin/timezone')
var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

var overrides = {
  GMT: 0,
  EDT: "America/New_York",
  EST: "America/New_York",
  ET: "America/New_York",
  CDT: "America/Chicago",
  CST: "America/Chicago",
  MDT: "America/Denver",
  MST: "America/Denver",
  PDT: "America/Los_Angeles",
  PST: "America/Los_Angeles",
  PT: "America/Los_Angeles",
  LON: "Europe/London",
  NYC: "America/New_York",
  BOS: "America/New_York",
  CAM: "America/New_York",
  SF: "America/Los_Angeles",
  SEA: "America/Los_Angeles",
  MTV: "America/Los_Angeles",
  MPO: "America/Los_Angeles",
  TOK: "Asia/Tokyo",
  "CGK":"Asia/Jakarta", "DFW":"America/Chicago", "ATL":"America/New_York", "DEN":"America/Denver", "DEL":"Asia/Kolkata", "ORD":"America/Chicago", "CAN":"Asia/Shanghai", "CLT":"America/New_York", "HND":"Asia/Tokyo", "KMG":"Asia/Shanghai", "CKG":"Asia/Shanghai", "PEK":"Asia/Shanghai", "XIY":"Asia/Shanghai", "SZX":"Asia/Shanghai", "CTU":"Asia/Shanghai", "PVG":"Asia/Shanghai", "SEA":"America/Los_Angeles", "MEX":"America/Mexico_City", "SHA":"Asia/Shanghai", "YYZ":"America/Toronto", "BOM":"Asia/Kolkata", "HGH":"Asia/Shanghai", "LAX":"America/Los_Angeles", "LHR":"Europe/London", "AMS":"Europe/Amsterdam", "PHX":"America/Phoenix", "BLR":"Asia/Kolkata", "NKG":"Asia/Shanghai", "PKX":"Asia/Shanghai", "IAH":"America/Chicago", "LAS":"America/Los_Angeles", "IST":"Europe/Istanbul", "MSP":"America/Chicago", "SVO":"Europe/Moscow", "CGO":"Asia/Shanghai", "CSX":"Asia/Shanghai", "DTW":"America/Detroit", "DMK":"Asia/Bangkok", "CDG":"Europe/Paris", "SLC":"America/Denver", "MNL":"Asia/Manila", "KWE":"Asia/Shanghai", "TAO":"Asia/Shanghai", "SUB":"Asia/Jakarta", "MAD":"Europe/Madrid", "HYD":"Asia/Kolkata", "FRA":"Europe/Berlin", "SFO":"America/Los_Angeles", "XMN":"Asia/Shanghai", "DXB":"Asia/Dubai", "KUL":"Asia/Kuala_Lumpur", "WUH":"Asia/Shanghai", "URC":"Asia/Shanghai", "YVR":"America/Vancouver", "EWR":"America/New_York", "DME":"Europe/Moscow", "TSN":"Asia/Shanghai", "HAK":"Asia/Shanghai", "MCO":"America/New_York", "CCU":"Asia/Kolkata", "BKK":"Asia/Bangkok", "HRB":"Asia/Shanghai", "MAA":"Asia/Kolkata", "CJU":"Asia/Seoul", "SAW":"Europe/Istanbul", "ICN":"Asia/Seoul", "UPG":"Asia/Makassar", "SGN":"Asia/Ho_Chi_Minh", "PHL":"America/New_York", "JNB":"Africa/Johannesburg", "FUK":"Asia/Tokyo", "BOS":"America/New_York", "CPH":"Europe/Copenhagen", "BWI":"America/New_York", "JFK":"America/New_York", "SHE":"Asia/Shanghai", "DLC":"Asia/Shanghai", "TNA":"Asia/Shanghai", "VIE":"Europe/Vienna", "GRU":"America/Sao_Paulo", "OSL":"Europe/Oslo", "ITM":"Asia/Tokyo", "CTS":"Asia/Tokyo", "YYC":"America/Edmonton", "MIA":"America/New_York", "SYX":"Asia/Shanghai", "DUB":"Europe/Dublin", "HNL":"Pacific/Honolulu", "LED":"Europe/Moscow", "BOG":"America/Bogota", "HET":"Asia/Shanghai", "VKO":"Europe/Moscow", "GMP":"Asia/Seoul", "DOH":"Asia/Qatar", "IAD":"America/New_York", "FLL":"America/New_York", "BNA":"America/Chicago", "YUL":"America/Toronto", "NNG":"Asia/Shanghai", "LHW":"Asia/Shanghai"
}

var hourMoji = ["🕛","🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘","🕙","🕚"];
var halfHourMoji = ["🕧","🕜","🕝","🕞","🕟","🕠","🕡","🕢","🕣","🕤","🕥","🕦","🕧"];


exports.index = functions.https.onRequest((req, res) => {
  var path = req.params[0];


  var error;
  var zones = path.split(/[_,.]/);
  console.log(path,zones)
  if (zones.length > 1) {
    try {
      var timeString = decodeURIComponent(zones.shift());
      // Handle difference in params[0] on local vs server (firebase) looking at leading slash
      var timeRE = /\/?(?<h1>\d+)?:?(?<m1>\d\d)?(?<p1>[aph])?m?-?(?<h2>\d+)?:?(?<m2>\d\d)?(?<p2>[aph])?m?/
      var match = timeString.match(timeRE);
      var groups = match.groups;
      console.log("timeString: ",timeString,"match: ",match)

      var start = dayjs().hour(groups.h1).minute(groups.m1 || 0)
      if (groups.p1 == "p") start = start.add(12, 'hour')
    
      var end = undefined;       //TODO: Fix the code to assume an end time
      if (groups.h2) {
        end = start
        end.hour(groups.h2)
        end.minute(groups.m2 || 0)
        if (groups.p2 == "p") end.add(12, 'hour')
      }

      var zone1 = zones[0];
      zone1 = overrides[zone1.toUpperCase()] || zone1;

      start = start.tz(zone1,true);
      end = end ? end.tz(zone1,true) : undefined;

      console.log("start", start)
      console.log("end  ", end)

      var zoneHTML = []
      var zoneStrings = []
      zones.forEach(zone => {
        var tzName = overrides[zone.toUpperCase()] || zone;
        if (zone.length) {
          var zoneStart = start.tz(tzName)
          var extraDay = start.day() < zoneStart.day()
          var startString = zoneStart.format("h:mm a").replace(" pm", "ᴘᴍ").replace(" am", "ᴀᴍ")
         
          var endString = "";
          if (end) {
            var zoneEnd = end.tz(tzName)
            endString = zoneEnd.format("h:mm a").replace(" pm", "ᴘᴍ").replace(" am", "ᴀᴍ")
          }
          console.log("tzName: ", zoneStart, zoneEnd, startString, endString)

          var emoji = hourMoji[zoneStart.hour() % 12];
          var description = `${emoji} ${startString}${endString ? "–" + endString : ""} ${zone.toUpperCase()} ${extraDay ? " +1":""}`
          zoneStrings.push(description);
          
          var night = (zoneStart.hour() > 18 || zoneStart.hour <= 6) ? "night" : ""
          zoneHTML.push(`
          <div class="zone ${night}">
            <div class="emoji">${emoji}</div>
            
            <div class="time">${startString}  ${extraDay ? "&#8314;&#185;":""}</div>
            <div class="zone">${zone.toUpperCase()}</div>
          </div>`);
          //zoneInfos.push({e: emoji, t:tz, z: zone, d: description);
          }
        }
      )

      var debugInfo = `
      ${zone1}
      ${start}
      ${start.format("h:mm a Z")}
      `
      var description = zoneStrings.join("   ");

      res.status(200).send(`<!doctype html>
        <!--${debugInfo}-->
        <head>
          <link rel="stylesheet" type="text/css" href="/index.css">
          <title>${description}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
          <meta property="og:title" content="${description}">
          <meta property="og:description" content="timezone.fyi">
          <meta property="og:type" content="website"> 
        </head>
        <body style="font-family:sans-serif">
        
        <div class="content">

        <div class="clock"></div>
        <h1><a href="/">timezone.fyi</a></h1>
        The following times are equivalent:
        <h2>${zoneHTML.join("")}</h2>


        </div>
          
        </body>
      </html>`);
      return;
    } catch (e) {
      error = e;
    }
  }

  res.status(200).send(`<!doctype html>
    <head>
      <link rel="stylesheet" type="text/css" href="/index.css">
      <title>timezone.fyi</title>
    </head>
    <body style="font-family:sans-serif">
    <div class="content">
    <div class="clock"></div>
    <h1>timezone.fyi</h1>
    This site lets you quickly share a time across multiple time zones.
    <p>Simply type a url with the following structure:
    <br><b><a href="/10:30am,pst,est">http://timezone.fyi/10:30am,pst,est</a></b>
    <p>The first listed time zone will be treated as the primary. <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones">List of time zone names</a>

    <br>When you send these via Slack, SMS, and other modern chat clients, 
    <br>they'll expand to show times in every listed zone.
    <div class="error">${error ? error.message : ""}</div>
    </div>
    </body>
    </html>`);
  
});