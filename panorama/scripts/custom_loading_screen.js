"use strict";
GameEvents.Subscribe("leaderboard_data_update", OnLeaderBoardUpdate);

function OnLeaderBoardUpdate(data) {
  let results = Object.values(data.results);
  results.sort(function(a,b) {
      return b.bmPoints - a.bmPoints
  })

for (let index = 0; index < results.length; index++) {
    const entry = results[index]; 
    const rank = index + 1;
    const steamId = entry.objectId;
    const bmPoints = entry.bmPoints;
    let leaderboardEntryPanel = $.CreatePanel( "Panel", $("#BM_Ladder"), "player_root" );
    leaderboardEntryPanel.BLoadLayoutFromString( '<root><Panel style="flow-children: right; margin-top: 10px; margin-bottom: 10px; horizontal-align: center;"><Panel style="vertical-align: center; width: 20px; margin-left: 10px;"><Label style="horizontal-align: left; color:white; font-size: 16px;" text="' + rank + '" /></Panel><Panel><DOTAAvatarImage steamid="' + steamId + '" style="width: 35px; height: 35px; z-index: 1; horizontal-align: center; margin-right: 10px; margin-left: 5px;" /></Panel><Panel style="vertical-align: center; width: 110px;"><DOTAUserName style="color:white; font-size: 16px;" steamid="' + steamId + '"/></Panel><Panel style="vertical-align: center; horizontal-align: right; text-align: right;"><Label style="color:white; font-size: 16px;" text="' + bmPoints + '" /></Panel></Panel></root>', false, false );
  }
}