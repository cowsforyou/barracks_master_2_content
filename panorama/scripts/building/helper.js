'use strict';

GameUI.SetRenderBottomInsetOverride( 0 );

var state = 'disabled';
var frame_rate = 1/30;
var tree_update_interval = 1;
var size = 0;
var overlay_size = 0;
var range = 0;
var pressedShift = false;
var altDown = false;
var requires;
var modelParticle;
var propParticle;
var propScale;
var offsetZ;
var modelOffset;
var gridParticles;
var overlayParticles;
var rangeOverlay;
var rangeOverlayActive;
var builderIndex;
var entityGrid = [];
var tree_entities = [];
var distance_to_gold_mine;
var last_tree_update = Game.GetGameTime();
var treeGrid = [];
var cutTrees = [];

var height_restriction
if (CustomNetTables.GetTableValue( "building_settings", "height_restriction") !== undefined)
    height_restriction = CustomNetTables.GetTableValue( "building_settings", "height_restriction").value;

var GRID_TYPES = CustomNetTables.GetTableValue( "building_settings", "grid_types")
CustomNetTables.SubscribeNetTableListener( "building_settings", function() {
    GRID_TYPES = CustomNetTables.GetTableValue( "building_settings", "grid_types")
})

var localHeroIndex


function SendBuildCommand( params )
{
    pressedShift = GameUI.IsShiftDown();
    var mainSelected = Players.GetLocalPlayerPortraitUnit(); 

    var mPos = GameUI.GetCursorPosition();
    var GamePos = Game.ScreenXYToWorld(mPos[0], mPos[1]);

    GameEvents.SendCustomGameEventToServer( "building_helper_build_command", { "builder": mainSelected, "X" : GamePos[0], "Y" : GamePos[1], "Z" : GamePos[2] , "Queue" : pressedShift } );

    // Cancel unless the player is holding shift
    if (!GameUI.IsShiftDown())
    {
        EndBuildingHelper(params);
        return true;
    }
    return true;
}

function SendCancelCommand( params )
{
    EndBuildingHelper();
    GameEvents.SendCustomGameEventToServer( "building_helper_cancel_command", {} );
}

function RegisterGNV(msg){
    // $.Msg('msgmsg', msg)
    var GridNav = [];
    var squareX = msg.squareX
    var squareY = msg.squareY
    var boundX = msg.boundX
    var boundY = msg.boundY
    // $.Msg("Registering GNV ["+squareX+","+squareY+"] ","Min Bounds: X="+boundX+", Y="+boundY)

    var arr = [];
    // Thanks to BMD for this method
    for (var i=0; i<msg.gnv.length; i++){
        var code = msg.gnv.charCodeAt(i)-32;
        for (var j=4; j>=0; j-=2){
            var g = (code & (3 << j)) >> j;
            if (g != 0)
              arr.push(g);
        }
    }

    // Load the GridNav
    var x = 0;
    for (var i = 0; i < squareY; i++) {
        GridNav[i] = []
        for (var j = 0; j < squareX; j++) {
          GridNav[i][j] = (arr[x] == 1) ? GRID_TYPES["BUILDABLE"] : GRID_TYPES["BLOCKED"]
          x++
        }
    }

    Root.GridNav = GridNav
    Root.squareX = squareX
    Root.squareY = squareY
    Root.boundX = boundX
    Root.boundY = boundY

    // ASCII Art
    
    // for (var i = 0; i<squareY; i++) {
    //     var a = [];
    //     for (var j = 0; j<squareX; j++){
    //         a.push((GridNav[i][j] == 1 ) ? '=' : '.');
    //     }

    //     $.Msg(a.join(''))
    // }

    // Debug Prints
    var tab = {"0":0, "1":0, "2":0, "3":0};
    for (i=0; i<arr.length; i++)
    {
        tab[arr[i].toString()]++;
    }
    // $.Msg("Free: ",tab["1"]," Blocked: ",tab["2"])
}

// Ask the server for the Terrain grid
function RequestGNV () {
    GameEvents.SendCustomGameEventToServer( "gnv_request", {} )
}

//-----------------------------------

function SnapToGrid(vec, size) {
    // Buildings are centered differently when the size is odd.
    if (size % 2 != 0) 
    {
        vec[0] = SnapToGrid32(vec[0])
        vec[1] = SnapToGrid32(vec[1])
    } 
    else 
    {
        vec[0] = SnapToGrid64(vec[0])
        vec[1] = SnapToGrid64(vec[1])
    }
}

function SnapToGrid64(coord) {
    return 64*Math.floor(0.5+coord/64);
}

function SnapToGrid32(coord) {
    return 32+64*Math.floor(coord/64);
}

function SnapHeight(x,y,z){
    return [x, y, z - ((z+1)%128)]
}

function checkIt(variable, name) {
    $.Msg("START " + name + " START")
    $.Msg(variable)
    $.Msg("END " + name +" END")
}

function IsBlocked(position) {
    var y = WorldToGridPosX(position[0]) - Root.boundX
    var x = WorldToGridPosY(position[1]) - Root.boundY
    // $.Msg('x: ', x, 'y: ', y)

    //{"BLIGHT":8,"BUILDABLE":2,"GOLDMINE":4,"BLOCKED":1}
    // Check height restriction
    var isNotValidHeight =  height_restriction !== undefined && position[2] < height_restriction
    // checkIt(isNotValidHeight , 'isNotValidHeight')
    if (isNotValidHeight) {
        return true
    }
 
    // Merge grids together into the same value
    // checkIt(Root.GridNav, 'Root.GridNav')                                                                                              
    var flag = Root.GridNav[x][y]
    // $.Msg('Root.GridNav: ', Root.GridNav)
    // var entGridValue = (entityGrid[x] !== undefined && entityGrid[x][y] !== undefined) ? entityGrid[x][y] : GRID_TYPES["BUILDABLE"]
    if (entityGrid[x] && entityGrid[x][y])
        flag = flag | entityGrid[x][y]

    // Don't count buildable if its blocked
    // $.Msg('GRID_TYPES', GRID_TYPES)
    var adjust = (GRID_TYPES["BUILDABLE"] + GRID_TYPES["BLOCKED"])
    if ((flag & adjust)==adjust)
        flag-=GRID_TYPES["BUILDABLE"]

    // $.Msg('GRID:',Root.GridNav[x][y],' ENTGRID:',entGridValue,' FLAG:',flag,' REQUIRES:', requires)

    // If the bits don't match, its invalid
    var bitsDontMatch = (flag & requires) != requires
    // checkIt(bitsDontMatch, 'bitsDontMatch')
    if (bitsDontMatch)
        return true

    // If there's a tree standing, its invalid
    var hasTreeInPath =  update_trees && treeGrid[x] && (treeGrid[x][y] & GRID_TYPES["BLOCKED"]);
    // checkIt(hasTreeInPath, "hasTreeInPath")
    if (hasTreeInPath)
        return true

    return false
}

function BlockEntityGrid(position, gridType) {
    var y = WorldToGridPosX(position[0]) - Root.boundX
    var x = WorldToGridPosY(position[1]) - Root.boundY

    if (entityGrid[x] === undefined) entityGrid[x] = []
    if (entityGrid[x][y] === undefined) entityGrid[x][y] = 0

    entityGrid[x][y] = entityGrid[x][y] | gridType
}

// Trees block 2x2
function BlockTreeGrid (position) {
    var y = WorldToGridPosX(position[0]) - Root.boundX
    var x = WorldToGridPosY(position[1]) - Root.boundY

    if (treeGrid[x] === undefined) treeGrid[x] = []

    treeGrid[x][y] = GRID_TYPES["BLOCKED"]
}

function BlockGridSquares (position, squares, gridType) {
    var halfSide = (squares/2)*64
    var boundingRect = {}
    boundingRect["leftBorderX"] = position[0]-halfSide
    boundingRect["rightBorderX"] = position[0]+halfSide
    boundingRect["topBorderY"] = position[1]+halfSide
    boundingRect["bottomBorderY"] = position[1]-halfSide

    if (gridType == "TREE")
    {
        for (var x=boundingRect["leftBorderX"]+32; x <= boundingRect["rightBorderX"]-32; x+=64)
        {
            for (var y=boundingRect["topBorderY"]-32; y >= boundingRect["bottomBorderY"]+32; y-=64)
            {
                BlockTreeGrid([x,y,0])
            }
        }
    }
    else
    {
        for (var x=boundingRect["leftBorderX"]+32; x <= boundingRect["rightBorderX"]-32; x+=64)
        {
            for (var y=boundingRect["topBorderY"]-32; y >= boundingRect["bottomBorderY"]+32; y-=64)
            {
                BlockEntityGrid([x,y,0], gridType)
            }
        }
    }
}

function BlockGridInRadius (position, radius, gridType) {
    var boundingRect = {}
    boundingRect["leftBorderX"] = position[0]-radius
    boundingRect["rightBorderX"] = position[0]+radius
    boundingRect["topBorderY"] = position[1]+radius
    boundingRect["bottomBorderY"] = position[1]-radius

    for (var x=boundingRect["leftBorderX"]+32; x <= boundingRect["rightBorderX"]-32; x+=64)
    {
        for (var y=boundingRect["topBorderY"]-32; y >= boundingRect["bottomBorderY"]+32; y-=64)
        {
            if (Length2D(position, [x,y,0]) <= radius)
            {
                BlockEntityGrid([x,y,0], gridType)
            }
        }
    }
}

function WorldToGridPosX(x){
    return Math.floor(x/64)
}

function WorldToGridPosY(y){
    return Math.floor(y/64)
}

function GetConstructionSize(entIndex) {
    var entName = Entities.GetUnitName(entIndex)
    var table = CustomNetTables.GetTableValue( "construction_size", entName)
    return table ? table.size : 0
}

function GetRequiredGridType(entIndex) {
    var entName = Entities.GetUnitName(entIndex)
    var table = CustomNetTables.GetTableValue( "construction_size", entName)
    if (table && table.requires !== undefined)
    {
        var types = table.requires.split(" ")
        var value = 0
        for (var i = 0; i < types.length; i++)
        {
            value+=GRID_TYPES[types[i]]
        }
        return value
    }
    else
        return GRID_TYPES["BUILDABLE"]
}

function GetCustomGrid(entIndex) {
    var entName = Entities.GetUnitName(entIndex)
    var table = CustomNetTables.GetTableValue( "construction_size", entName)
    if (table && table.grid !== undefined)
        return table.grid
}

function HasGoldMineDistanceRestriction(entIndex) {
    var entName = Entities.GetUnitName(entIndex)
    var table = CustomNetTables.GetTableValue( "construction_size", entName)
    return table ? table.distance_to_gold_mine : 0
}

function GetClosestDistanceToGoldMine(position) {
    var building_entities = Entities.GetAllEntitiesByClassname('npc_dota_building')

    var minDistance = 99999
    for (var i = 0; i < building_entities.length; i++)
    {
        if (Entities.GetUnitName(building_entities[i]) == "gold_mine")
        {
            var distance_to_this_mine = Length2D(position, Entities.GetAbsOrigin(building_entities[i]))
            if (distance_to_this_mine < minDistance)
                minDistance = distance_to_this_mine
        }
    }
    return minDistance
}

function TooCloseToGoldmine(position) {
    return (distance_to_gold_mine > 0 && GetClosestDistanceToGoldMine(position) < distance_to_gold_mine)
}

function Length2D(v1, v2) {
    return Math.sqrt( (v2[0]-v1[0])*(v2[0]-v1[0]) + (v2[1]-v1[1])*(v2[1]-v1[1]) )
}

function PrintGridCoords(x,y) {
    $.Msg('(',x,',',y,') = [',WorldToGridPosX(x),',',WorldToGridPosY(y),']')
}