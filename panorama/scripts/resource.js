"use strict";

function OnPlayerLumberChanged ( playerData ) {
	//$.Msg("Player "+iPlayerID+" Lumber: "+lumber);
	$('#LumberText').text = playerData.lumber;
}

(function () {
	GameEvents.Subscribe( "player_lumber_changed", OnPlayerLumberChanged );
})();

(function UpdateGold () {
	const playerGold = Players.GetGold(Players.GetLocalPlayer());
	$('#GoldText').text = playerGold;
	$.Schedule(0.1, UpdateGold);
})();