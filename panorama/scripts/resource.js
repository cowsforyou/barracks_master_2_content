"use strict";

// Variables for resources mouseover title and description
const toolTips = {
	gold: {
		toolTipUI: $("#ResourceGold"),
		title: `Gold`,
		toolTip: `Gold is earned by killing enemy units and structures.`,
	},
	lumber: {
		toolTipUI: $("#ResourceLumber"),
		title: `Lumber`,
		toolTip: `Lumber is earned by mining from Giant Trees.`,
	},
	tutorial: {
		toolTipUI: $("#ResourceTutorialID"),
		title: `Tutorial`,
		toolTip: `Click to view the Barracks Master 2 tutorial.`,
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
