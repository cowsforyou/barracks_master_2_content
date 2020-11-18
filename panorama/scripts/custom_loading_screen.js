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
    // file://{resources}/layout/custom_game/modules/leaderboard_entry.xml
    // Why are we adding in a comment here with the file path?
    // modular.js load a layout referring to a dynamic file pathing ( MODULE_BASE_PATH + name + ".xml") but resourcecompiler finds xml files to compile using a simple regexp-like match
    // If we want to refer to layouts dynamically, at the very least we have to reference a static file path somehow (in any file, even in comment)
    // thanks to ark120202 on ModDota for the insight.
    var leaderboardEntryPanel = Modular.Spawn("leaderboard_entry", $("#BM_Ladder"));
    leaderboardEntryPanel.SetPlayer(entry.objectId, entry.bmPoints);
}
}