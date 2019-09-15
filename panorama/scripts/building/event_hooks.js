(function () {    
    RequestGNV()

    GameEvents.Subscribe( "building_helper_enable", StartBuildingHelper);
    GameEvents.Subscribe( "building_helper_end", EndBuildingHelper);
    GameEvents.Subscribe( "gnv_register", RegisterGNV);
})();
