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
let selectedColor = "";
let selectedPerk = "";
let availableColors = {
  Gold: true,
  Red: true,
  Blue: true,
  LightGreen: true,
  Green: true,
  Yellow: true,
  Pink: true,
  LightBlue: true,
  Purple: true,
  Silver: true,
  Black: true,
};

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
GameEvents.Subscribe("hero_preview_pick", onPlayerPreviewed);
GameEvents.Subscribe("player_color_preview_pick", onPlayerColorSelect);
GameEvents.Subscribe("player_color_confirmed_pick", onPlayerColorConfirmed);
GameEvents.Subscribe("get_player_premium_colors", onGetPlayerPremiumColors);
GameEvents.Subscribe("send_map_info", onGetMapInfo);
GameEvents.Subscribe('userinfo_data_update', onUserInfoDataUpdate);

/* Event Handlers
=========================================================================*/

/* Picking phase is done, allow the player to enter the game */
function OnPickingDone(data) {
  $.Msg("Picking Done");
  EnterGame();
}

/* Visual timer update */
function OnTimeUpdate(data) {
  $("#TimerTxt").text = data.time;

  if (data.time === 1) {
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
      SelectHero();
    }
  }
}

/* A player has picked a hero */
function OnPlayerPicked(data) {
  PlayerPicked(data.PlayerID, data.HeroName);
}

/* A player has previewed a hero, update the status screen. */
function onPlayerPreviewed(data) {
  //Update the player panel with latest hero
  playerPanels[data.PlayerID] &&
    playerPanels[data.PlayerID].SetHero(data.HeroName);
}

/* A player has previewed a color, update the status screen. */
function onPlayerColorSelect(data) {
  //Update the player panel with latest selected color
  playerPanels[data.PlayerID] &&
    playerPanels[data.PlayerID].SetColor(data.Color);
}

/* A player has confirmed a color, remove available option */
function onPlayerColorConfirmed(data) {
  const usedColor = data.Color;
  //Check if user selected colour was selected
  if (selectedColor === usedColor) {
    selectedColor = "";
  }

  //Set available colors locally
  availableColors[usedColor] = false;

  //Disable the color from being selected
  let usedColorID = "#";
  switch (usedColor) {
    case "Gold":
      usedColorID = "#SelectColorGold";
      break;
    case "Red":
      usedColorID = "#SelectColorRed";
      break;
    case "Blue":
      usedColorID = "#SelectColorBlue";
      break;
    case "LightGreen":
      usedColorID = "#SelectColorLightGreen";
      break;
    case "Green":
      usedColorID = "#SelectColorGreen";
      break;
    case "Yellow":
      usedColorID = "#SelectColorYellow";
      break;
    case "Pink":
      usedColorID = "#SelectColorPink";
      break;
    case "LightBlue":
      usedColorID = "#SelectColorLightBlue";
      break;
    case "Purple":
      usedColorID = "#SelectColorPurple";
      break;
    case "Silver":
      usedColorID = "#SelectColorSilver";
      break;
    case "Black":
      usedColorID = "#SelectColorBlack";
      break;
  }

  $(usedColorID) && $(usedColorID).AddClass("disabledButtons");
  $(usedColorID).SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
}

function onGetPlayerPremiumColors(colorData) {
  if (colorData.Purple) {
    $("#SelectColorPurple") &&
      $("#SelectColorPurple").RemoveClass("disabledPremiumButtons");
      $("#SelectColorPurple") &&
      $("#SelectColorPurple").RemoveClass("lockedButtons");
    $("#SelectColorPurple").SetPanelEvent("onactivate", function () {
      SelectColor("Purple");
    });
  }

  if (colorData.Silver) {
    $("#SelectColorSilver") &&
      $("#SelectColorSilver").RemoveClass("disabledPremiumButtons");
      $("#SelectColorSilver") &&
      $("#SelectColorSilver").RemoveClass("lockedButtons");
    $("#SelectColorSilver").SetPanelEvent("onactivate", function () {
      SelectColor("Silver");
    });
  }

  if (colorData.Black) {
    $("#SelectColorBlack") &&
      $("#SelectColorBlack").RemoveClass("disabledPremiumButtons");
      $("#SelectColorBlack") &&
      $("#SelectColorBlack").RemoveClass("lockedButtons");
    $("#SelectColorBlack").SetPanelEvent("onactivate", function () {
      SelectColor("Black");
    });
  }

  if (colorData.LightGreen) {
    $("#SelectColorLightGreen") &&
      $("#SelectColorLightGreen").RemoveClass("disabledPremiumButtons");
      $("#SelectColorLightGreen") &&
      $("#SelectColorLightGreen").RemoveClass("lockedButtons");
    $("#SelectColorLightGreen").SetPanelEvent("onactivate", function () {
      SelectColor("LightGreen");
    });
  }

  if (colorData.Blue) {
    $("#SelectColorBlue") &&
      $("#SelectColorBlue").RemoveClass("disabledPremiumButtons");
      $("#SelectColorBlue") &&
      $("#SelectColorBlue").RemoveClass("lockedButtons");
    $("#SelectColorBlue").SetPanelEvent("onactivate", function () {
      SelectColor("Blue");
    });
  }

  if (colorData.LightBlue) {
    $("#SelectColorLightBlue") &&
      $("#SelectColorLightBlue").RemoveClass("disabledPremiumButtons");
      $("#SelectColorLightBlue") &&
      $("#SelectColorLightBlue").RemoveClass("lockedButtons");
    $("#SelectColorLightBlue").SetPanelEvent("onactivate", function () {
      SelectColor("LightBlue");
    });
  }
}

function onGetMapInfo(mapData) {
  $("#MapInfoMapName").text = mapData.mapName.toUpperCase();
  const maxPlayerPerTeam = mapData.maxPlayer / 2;
  $("#MapInfoMaxPlayers").text = maxPlayerPerTeam + " VS " + maxPlayerPerTeam;
  if (mapData.mapName === "bm2_legacy") {
    $("#Map").AddClass("MapLegacy");
  } else if (mapData.mapName === "bm2_mexican_standoff") {
    $("#Map").AddClass("MapMexicanStandOff");
  }
}

function onUserInfoDataUpdate(userInfoData) {
  var statPanel = Modular.Spawn("player_stats", $("#InformationPreview"));
  statPanel.SetPlayer(Game.GetLocalPlayerID());
  statPanel.SetRating(userInfoData.totalBMPoints);
  statPanel.SetGameData(userInfoData.gamesPlayed, userInfoData.gamesWon);

  let favouriteRace = 'Ling';
  let favouriteRaceCount = userInfoData.playedAsLing;
  
  if (userInfoData.playedAsXoo > favouriteRaceCount) {
    favouriteRace = 'Xoo';
    favouriteRaceCount = userInfoData.playedAsXoo;
  }

  if (userInfoData.playedAsRandom > favouriteRaceCount) {
    favouriteRace = 'Random';
    favouriteRaceCount = userInfoData.playedAsRandom;
  }

  statPanel.SetMostPlayedFaction(favouriteRace);

  let favoriteColorContainer = [
    {
      color: 'Green',
      value: userInfoData.playedAsColorGreen || 0
    },
    {
      color: 'Yellow',
      value: userInfoData.playedAsColorYellow || 0
    },
    {
      color: 'Red',
      value: userInfoData.playedAsColorRed || 0
    },
    {
      color: 'Pink',
      value: userInfoData.playedAsColorPink || 0
    },
    {
      color: 'Gold',
      value: userInfoData.playedAsColorGold || 0
    },
    {
      color: 'Purple',
      value: userInfoData.playedAsColorPurple || 0
    },
    {
      color: 'Blue',
      value: userInfoData.playedAsColorBlue || 0
    },
    {
      color: 'Silver',
      value: userInfoData.playedAsColorSilver || 0
    },
    {
      color:'Black', 
      value: userInfoData.playedAsColorBlack || 0
    },
    {
      color: 'Light Blue',
      value: userInfoData.playedAsColorLightBlue || 0
    },
    {
      color: 'Light Green',
      value: userInfoData.playedAsColorLightGreen || 0
    }
  ];

  favoriteColorContainer.sort(
    (colorOne, colorTwo) => colorTwo.value - colorOne.value
    );

  statPanel.SetFavoriteColor(favoriteColorContainer[0].color);
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
    var playerPanel = Modular.Spawn("picking_player", $("#Team1Status"));
    playerPanel.SetPlayer(player);
    playerPanel.SetTeam("Team 1");

    //Save the panel for later
    playerPanels[player] = playerPanel;
  });

  //Assign dire players
  $.Each(direPlayers, function (player) {
    var playerPanel = Modular.Spawn("picking_player", $("#Team2Status"));
    playerPanel.SetPlayer(player);
    playerPanel.SetTeam("Team 2");

    //Save the panel for later
    playerPanels[player] = playerPanel;
  });
}

/* A player has picked a hero, update the status screen. */
function PlayerPicked(player, hero) {
  //Update the player panel status
  playerPanels[player].SetStatus("Ready");
}

/* Show the picked hero animation. */
function SwitchToHeroPreview(heroName) {
  $("#HeroPreview") && $("#HeroPreview").DeleteAsync(0.0);
  $("#BuilderInfo") && $("#BuilderInfo").DeleteAsync(0.0);

  var previewPanel = $.CreatePanel(
    "Panel",
    $("#CustomisationSelector"),
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
    factionDescriptionHash = "#bm_ling_lore";
    selectedHero = "npc_dota_hero_keeper_of_the_light";
  } else if (heroName === "npc_dota_hero_nevermore") {
    factionNamePreview = "Xoo";
    factionDescriptionHash = "#bm_xoo_lore";
    selectedHero = "npc_dota_hero_nevermore";
  } else {
    factionNamePreview = "Random";
    factionDescriptionHash = "#bm_random_lore";
    const random = Math.round(Math.random());

    if (random === 1) {
      selectedHero = "npc_dota_hero_keeper_of_the_light";
    } else {
      selectedHero = "npc_dota_hero_nevermore";
    }
  }

  textPanel.BLoadLayoutFromString(
    '<root><Label style="horizontal-align: center; text-align: center; margin-top: 10px;" text="' +
      factionDescriptionHash +
      '" /></root>',
    false,
    false
  );
  previewPanel.BLoadLayoutFromString(
    '<root><Panel style="horizontal-align: center; flow-children: down;"><DOTAScenePanel particleonly="false" style="width: 390px; height: 390px; margin-top: 0px; opacity-mask: url(\'s2r://panorama/images/masks/softedge_box_png.vtex\');" unit="' +
      heroName +
      '" /><Label style="horizontal-align: center; vertical-align: center; margin-top: 10px;" text="' +
      factionNamePreview +
      '" /></Panel></root>',
    false,
    false
  );
  $("#DefaultFactionSelection") && $("#DefaultFactionSelection").DeleteAsync(0);

  //Send the hero preview to the server
  GameEvents.SendCustomGameEventToServer("hero_preview", {
    HeroName: factionNamePreview,
  });
}

/* Set the perk for the player */
function SelectPerk(perk) {
  selectedPerk = perk;

  GameEvents.SendCustomGameEventToServer("perk_selected", {
    perk,
  });
}


/* Mouseover for perks - cows */

const toolTips = {
  rangeperk: {
    toolTipUI: $("#SelectRangePerk"),
    title: "#perk_range_title",
    toolTip: "#perk_range_des",
  },
  damageperk: {
    toolTipUI: $("#SelectDamagePerk"),
    title: "#perk_damage_title",
    toolTip: "#perk_damage_des",
  },
  healthperk: {
    toolTipUI: $("#SelectHealthPerk"),
    title: "#perk_health_title",
    toolTip: "#perk_health_des",
  },
};

function showToolTip(resourceType) {
  const {toolTipUI, title, toolTip} = toolTips[resourceType];
  $.DispatchEvent("DOTAShowTitleTextTooltip", toolTipUI, title, toolTip);
}


/* Confirms a hero and color, called when a player clicks on Ready*/
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

  clickedReady = true;

  $("#ReadyBtn") && $("#ReadyBtn").AddClass("disabled");
  $("#ReadyBtn").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#ReadyBtnTxt").text = "Waiting for others";

  $("#SelectColorGold") && $("#SelectColorGold").AddClass("disabledButtons");
  $("#SelectColorGold").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectColorRed") && $("#SelectColorRed").AddClass("disabledButtons");
  $("#SelectColorRed").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectColorBlue") && $("#SelectColorBlue").AddClass("disabledButtons");
  $("#SelectColorBlue").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectColorLightGreen") &&
    $("#SelectColorLightGreen").AddClass("disabledButtons");
  $("#SelectColorLightGreen").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectColorGreen") && $("#SelectColorGreen").AddClass("disabledButtons");
  $("#SelectColorGreen").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectColorYellow") &&
    $("#SelectColorYellow").AddClass("disabledButtons");
  $("#SelectColorYellow").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectColorPink") && $("#SelectColorPink").AddClass("disabledButtons");
  $("#SelectColorPink").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectColorLightBlue") &&
    $("#SelectColorLightBlue").AddClass("disabledButtons");
  $("#SelectColorLightBlue").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectColorSilver") &&
    $("#SelectColorSilver").AddClass("disabledButtons");
  $("#SelectColorSilver").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectColorPurple") &&
    $("#SelectColorPurple").AddClass("disabledButtons");
  $("#SelectColorPurple").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectColorBlack") && $("#SelectColorBlack").AddClass("disabledButtons");
  $("#SelectColorBlack").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectColorRandom") &&
    $("#SelectColorRandom").AddClass("disabledButtons");
  $("#SelectColorRandom").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectLingFaction") &&
    $("#SelectLingFaction").AddClass("disabledButtons");
  $("#SelectLingFaction").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectXoyaFaction") &&
    $("#SelectXoyaFaction").AddClass("disabledButtons");
  $("#SelectXoyaFaction").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectRandomFaction") &&
    $("#SelectRandomFaction").AddClass("disabledButtons");
  $("#SelectRandomFaction").SetPanelEvent("onactivate", function () {
    $.Msg("disabled");
  });
  $("#SelectHealthPerk") && $("#SelectHealthPerk").AddClass("disabledButtons");
  $("#SelectHealthPerk") &&
    $("#SelectHealthPerk").SetPanelEvent("onactivate", function () {
      $.Msg("disabled");
    });
  $("#SelectDamagePerk") && $("#SelectDamagePerk").AddClass("disabledButtons");
  $("#SelectDamagePerk") &&
    $("#SelectDamagePerk").SetPanelEvent("onactivate", function () {
      $.Msg("disabled");
    });
  $("#SelectRangePerk") && $("#SelectRangePerk").AddClass("disabledButtons");
  $("#SelectRangePerk") &&
    $("#SelectRangePerk").SetPanelEvent("onactivate", function () {
      $.Msg("disabled");
    });

  if (selectedPerk === "perk_health") {
    $("#SelectHealthPerk") &&
      $("#SelectHealthPerk").AddClass("PreviewButtonSelected");
  } else if (selectedPerk === "perk_damage") {
    $("#SelectDamagePerk") &&
      $("#SelectDamagePerk").AddClass("PreviewButtonSelected");
  } else if (selectedPerk === "perk_range") {
    $("#SelectRangePerk") &&
      $("#SelectRangePerk").AddClass("PreviewButtonSelected");
  } else {
    const random = Math.round(Math.random() * 2);

    if (random === 0) {
      $("#SelectRangePerk") &&
      $("#SelectRangePerk").AddClass("PreviewButtonSelected");
      SelectPerk('perk_range')
    } else if (random === 1) {
      $("#SelectDamagePerk") &&
      $("#SelectDamagePerk").AddClass("PreviewButtonSelected");
      SelectPerk('perk_damage')
    } else {
      $("#SelectHealthPerk") &&
      $("#SelectHealthPerk").AddClass("PreviewButtonSelected");
      SelectPerk('perk_health')
    }
  }

  if (selectedHero === "npc_dota_hero_keeper_of_the_light") {
    $("#SelectLingFaction") &&
      $("#SelectLingFaction").AddClass("PreviewButtonSelected");
  } else if (selectedHero === "npc_dota_hero_nevermore") {
    $("#SelectXoyaFaction") &&
      $("#SelectXoyaFaction").AddClass("PreviewButtonSelected");
  } else {
    $("#SelectRandomFaction") &&
      $("#SelectRandomFaction").AddClass("PreviewButtonSelected");
  }

  if (selectedColor === "Gold") {
    $("#SelectColorGold") &&
      $("#SelectColorGold").AddClass("PreviewButtonSelected");
  } else if (selectedColor === "Red") {
    $("#SelectColorRed") &&
      $("#SelectColorRed").AddClass("PreviewButtonSelected");
  } else if (selectedColor === "Blue") {
    $("#SelectColorBlue") &&
      $("#SelectColorBlue").AddClass("PreviewButtonSelected");
  } else if (selectedColor === "LightGreen") {
    $("#SelectColorLightGreen") &&
      $("#SelectColorLightGreen").AddClass("PreviewButtonSelected");
  } else if (selectedColor === "Green") {
    $("#SelectColorGreen") &&
      $("#SelectColorGreen").AddClass("PreviewButtonSelected");
  } else if (selectedColor === "Yellow") {
    $("#SelectColorYellow") &&
      $("#SelectColorYellow").AddClass("PreviewButtonSelected");
  } else if (selectedColor === "Pink") {
    $("#SelectColorPink") &&
      $("#SelectColorPink").AddClass("PreviewButtonSelected");
  } else if (selectedColor === "LightBlue") {
    $("#SelectColorLightBlue") &&
      $("#SelectColorLightBlue").AddClass("PreviewButtonSelected");
  } else if (selectedColor === "Silver") {
    $("#SelectColorSilver") &&
      $("#SelectColorSilver").AddClass("PreviewButtonSelected");
  } else if (selectedColor === "Purple") {
    $("#SelectColorPurple") &&
      $("#SelectColorPurple").AddClass("PreviewButtonSelected");
  } else if (selectedColor === "Black") {
    $("#SelectColorBlack") &&
      $("#SelectColorBlack").AddClass("PreviewButtonSelected");
  } else {
    $("#SelectColorRandom") &&
      $("#SelectColorRandom").AddClass("PreviewButtonSelected");
  }

  if (selectedColor.length === 0 || selectedColor === "Random") {
    const random = Math.round(Math.random() * 5);

    if (availableColors["Gold"] && random === 0) {
      SelectColor("Gold");
    } else if (availableColors["Red"] && random === 1) {
      SelectColor("Red");
    } else if (availableColors["Green"] && random === 2) {
      SelectColor("Green");
    } else if (availableColors["Yellow"] && random === 3) {
      SelectColor("Yellow");
    } else {
      SelectColor("Pink");
    }
  }
  GameEvents.SendCustomGameEventToServer("set_player_color", {
    color: selectedColor,
  });
}

/* Enter the game by removing the picking screen, called when the timer runs to 0 */
function EnterGame() {
  RemoveHeroSelectionElements();
  GameEvents.SendCustomGameEventToServer("set_player_color_unselected", {});
}

function RemoveHeroSelectionElements() {
  //Hide Hero Selection Panel
  const mainHeroSelectionPanel = $.GetContextPanel()
    .FindChildTraverse("GameInfoContainer")
    .GetParent();
  mainHeroSelectionPanel.style.width = 0;
  mainHeroSelectionPanel.style.height = 0;

  //Delete Hero Selection Panel Containers for optimization
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
}

function SelectColor(color) {
  //Send the hero preview to the server
  GameEvents.SendCustomGameEventToServer("set_player_color_preview", {
    Color: color,
  });

  // Set color value locally so we can send it to server once player is ready
  selectedColor = color;
}

/* Initialisation - runs when the element is created
=========================================================================*/
(function () {
  var localInfo = Game.GetPlayerInfo(Game.GetLocalPlayerID()) || {};
  var localTeam = localInfo.player_team_id || -1;
  var spectator = localTeam == -1;

  if (spectator) {
    return RemoveHeroSelectionElements();
  }

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

  //Check Premium Colors
  GameEvents.SendCustomGameEventToServer("check_player_premium_colors", {});
})();
