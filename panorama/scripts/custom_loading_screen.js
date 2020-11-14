"use strict";
GameEvents.Subscribe("leaderboard_data_update", OnLeaderBoardUpdate);

function OnLeaderBoardUpdate(data) {
  let results = Object.values(data.results);
  results.sort(function(a,b) {
      return b.bmPoints - a.bmPoints
  })
//   $.Msg(JSON.stringify(results));

for (let index = 0; index < results.length; index++) {
    const entry = results[index]; 
    var leaderboardEntryPanel = Modular.Spawn("leaderboard_entry", $("#BM_Ladder"));
    leaderboardEntryPanel.SetPlayer(entry.objectId, entry.bmPoints);
}
}