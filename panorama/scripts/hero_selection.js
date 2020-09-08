"use strict";
/* This file contains the scripts associated with hero_selection.xml.
 * This UI element provides a custom hero selection screen.
 *
 * By: Perry
 * Date: July 2015 */

//Define variables
var playerPanels = {};
let selectedHero = "";
let clickedReady = false;

//Panels
const HudMain = $.GetContextPanel().GetParent().GetParent().GetParent();
const Hud = HudMain.FindChildTraverse("lower_hud");
const Timer = HudMain.FindChildTraverse("topbar");
const Minimap = HudMain.FindChildTraverse("minimap_container");
const Panel = HudMain.FindChildTraverse("stackable_side_panels");
const Chat = HudMain.FindChildTraverse("HudChat");
const PauseInfo = HudMain.FindChildTraverse("PausedInfo");
const scoreBoardScreen = $.GetContextPanel()
  .GetParent()
  .GetParent()
  .FindChildTraverse("CustomUIContainer_FlyoutScoreboard");
const resourcePanelScreen = $.GetContextPanel()
  .GetParent()
  .FindChildTraverse("ResourceLumber")
  .GetParent();

//Subscribe to events
GameEvents.Subscribe("picking_done", OnPickingDone);
GameEvents.Subscribe("picking_time_update", OnTimeUpdate);
GameEvents.Subscribe("picking_player_pick", OnPlayerPicked);

/* Event Handlers
=========================================================================*/

/* Picking phase is done, allow the player to enter the game */
function OnPickingDone(data) {
  $.Msg("Picking Done");

  if (selectedHero.length === 0) {
    const random = Math.round(Math.random());
    if (random === 1) {
      selectedHero = "npc_dota_hero_keeper_of_the_light";
    } else {
      selectedHero = "npc_dota_hero_nevermore";
    }
    SelectHero();
  }

  if (!clickedReady) {
    GameEvents.SendCustomGameEventToServer("hero_selected", {
      HeroName: selectedHero,
    });
  }

  EnterGame();
}

/* Visual timer update */
function OnTimeUpdate(data) {
  $("#TimerTxt").text = data.time;
}

/* A player has picked a hero */
function OnPlayerPicked(data) {
  PlayerPicked(data.PlayerID, data.HeroName);
}

/* Functionality
=========================================================================*/

/* Add an empty element for each player in the game (steam avatar plus space for hero portrait) */
function LoadPlayers() {
  //Get the players for both teams
  var radiantPlayers = Game.GetPlayerIDsOnTeam(DOTATeam_t.DOTA_TEAM_GOODGUYS);
  var direPlayers = Game.GetPlayerIDsOnTeam(DOTATeam_t.DOTA_TEAM_BADGUYS);

  //Assign radiant players
  $.Each(radiantPlayers, function (player) {
    $.Msg("test", player);
    var playerPanel = Modular.Spawn("picking_player", $("#LeftPlayers"));
    playerPanel.SetPlayer(player);

    //Save the panel for later
    playerPanels[player] = playerPanel;
  });

  //Assign dire players
  $.Each(direPlayers, function (player) {
    var playerPanel = Modular.Spawn("picking_player", $("#RightPlayers"));
    playerPanel.SetPlayer(player);
    playerPanel.SetIsRight(true);

    //Save the panel for later
    playerPanels[player] = playerPanel;
  });
}

/* A player has picked a hero, update the status screen. */
function PlayerPicked(player, hero) {
  //Update the player panel
  playerPanels[player].SetHero(hero);

  //Disable the hero button
  $("#" + hero).AddClass("taken");

  //Check if the pick was by the local player
  if (player == Players.GetLocalPlayer()) {
    SwitchToHeroPreview(hero);
  }
}

/* Show the picked hero animation. */
function SwitchToHeroPreview(heroName) {
  $("#HeroPreview") && $("#HeroPreview").DeleteAsync(0.0);
  $("#BuilderInfo") && $("#BuilderInfo").DeleteAsync(0.0);

  var previewPanel = $.CreatePanel(
    "Panel",
    $("#FactionSelector"),
    "HeroPreview"
  );

  var textPanel = $.CreatePanel(
    "Label",
    $("#CustomisationSelector"),
    "BuilderInfo"
  );

  let factionNamePreview;
  let factionDescriptionHash;

  if (heroName === "npc_dota_hero_keeper_of_the_light") {
    factionNamePreview = "Ling";
    factionDescriptionHash="#bm_lore_ling";
    selectedHero = "npc_dota_hero_keeper_of_the_light";
  } else if (heroName === "npc_dota_hero_nevermore") {
    factionNamePreview = "Xoya";
    factionDescriptionHash="#bm_lore_xoo";
    selectedHero = "npc_dota_hero_nevermore";
  } else {
    factionNamePreview = "Random";
    factionDescriptionHash="#bm_lore_random";
    const random = Math.round(Math.random());

    if (random === 1) {
      selectedHero = "npc_dota_hero_keeper_of_the_light";
    } else {
      selectedHero = "npc_dota_hero_nevermore";
    }
  }

  textPanel.BLoadLayoutFromString(
    '<root><Label text="' + factionDescriptionHash +'" /></root>',
    false,
    false
  );
  previewPanel.BLoadLayoutFromString(
    '<root><Panel style="horizontal-align: center; flow-children: down;"><DOTAScenePanel particleonly="false" style="width: 330px; height: 330px; margin-top: 20px; opacity-mask: url(\'s2r://panorama/images/masks/softedge_box_png.vtex\');" unit="' +
      heroName +
      '" /><Label style="horizontal-align: center; vertical-align: center; margin-top: 20px;" text="' +
      factionNamePreview +
      '" /></Panel></root>',
    false,
    false
  );
  $("#FactionSelector").MoveChildAfter(previewPanel, $("#FactionIcon"));
  $("#CustomisationSelector").MoveChildAfter(textPanel);
}

/* Select a hero, called when a player clicks a hero panel in the layout */
function SelectHero() {
  if (selectedHero.length === 0) {
    const random = Math.round(Math.random());
    if (random === 1) {
      selectedHero = "npc_dota_hero_keeper_of_the_light";
    } else {
      selectedHero = "npc_dota_hero_nevermore";
    }
  }
  //Send the pick to the server
  GameEvents.SendCustomGameEventToServer("hero_selected", {
    HeroName: selectedHero,
  });

  $("#ReadyBtn") && $("#ReadyBtn").AddClass("disabled");
  $("#ReadyBtnTxt").text = "Waiting for others";
}

/* Enter the game by removing the picking screen, called when the player
 * clicks a button in the layout. */
function EnterGame() {
  $.GetContextPanel().FindChildTraverse("SelectionContainer").DeleteAsync(0.0);
  $.GetContextPanel().FindChildTraverse("StatusContainer").DeleteAsync(0.0);
  $.GetContextPanel().FindChildTraverse("GameInfoContainer").DeleteAsync(0.0);

  //Show score board overlay
  scoreBoardScreen.style.opacity = 1;

  //Show resource panel
  resourcePanelScreen.style.opacity = 1;

  //Show HUD elements
  Hud.style.opacity = 1;

  //Show Timer
  Timer.style.opacity = 1;

  //Show Minimap
  Minimap.style.opacity = 1;

  //Show Side Panels
  Panel.style.opacity = 1;

  //Reposition back Chat Bar
  Chat.style.y = "-240px";

  //Show Pause Game element
  PauseInfo.style.opacity = 1;

  GameEvents.SendCustomGameEventToServer("set_player_color_unselected", {});
}

function SelectColor(color) {
  GameEvents.SendCustomGameEventToServer("set_player_color", { color: color });
}

/* Initialisation - runs when the element is created
=========================================================================*/
(function () {
  //Hide scoreboard screen
  scoreBoardScreen.style.opacity = 0;

  //Hide resource panel
  resourcePanelScreen.style.opacity = 0;

  //Hide HUD elements
  Hud.style.opacity = 0;

  //Hide Timer
  Timer.style.opacity = 0;

  //Hide Minimap
  Minimap.style.opacity = 0;

  //Hide Side Panels
  Panel.style.opacity = 0;

  //Reposition Chat Bar
  Chat.style.y = "-20px";

  //Hide Pause Game element
  PauseInfo.style.opacity = 0;

  ///Load player elements
  LoadPlayers();
})();
