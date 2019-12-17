"use strict";

// Variables for resources mouseover title and description
const toolTips = {
	gold: {
		toolTipUI: $("#ResourceGold"),
		title: `Gold`,
		toolTip: `This text is meant to be replaced`,
	},
	lumber: {
		toolTipUI: $("#ResourceLumber"),
		title: `Lumber`,
		toolTip: `This text is meant to be replaced`,
	},
};

function showToolTip(resourceType) {
	const {toolTipUI, title, toolTip} = toolTips[resourceType];
	$.DispatchEvent("DOTAShowTitleTextTooltip", toolTipUI, title, toolTip);
}

function OnPlayerLumberChanged(playerData) {
	//$.Msg("Player "+iPlayerID+" Lumber: "+lumber);
	$('#LumberText').text = playerData.lumber;
}

(function () {
	GameEvents.Subscribe("player_lumber_changed", OnPlayerLumberChanged);
})();

(function UpdateGold() {
	const playerGold = Players.GetGold(Players.GetLocalPlayer());
	$('#GoldText').text = playerGold;
	$.Schedule(0.1, UpdateGold);
})();
