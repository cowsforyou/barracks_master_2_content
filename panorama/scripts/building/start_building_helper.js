function StartBuildingHelper( params )
{
    if (params !== undefined)
    {
        // Set the parameters passed by AddBuilding
        localHeroIndex = Players.GetPlayerHeroEntityIndex( Players.GetLocalPlayer() );
        state = params.state;
        size = params.size;
        range = params.range;
        overlay_size = size + alt_grid_squares * 2;
        builderIndex = params.builderIndex;
        var scale = params.scale;
        var entindex = params.entindex;
        var propScale = params.propScale;
        offsetZ = params.offsetZ;
        modelOffset = params.modelOffset;

        requires = GetRequiredGridType(entindex)
        distance_to_gold_mine = HasGoldMineDistanceRestriction(entindex)
        
        // If we chose to not recolor the ghost model, set it white
        var ghost_color = COLOR_GREEN
        if (!recolor_ghost)
            ghost_color = COLOR_WHITE

        pressedShift = GameUI.IsShiftDown();

        if (modelParticle !== undefined) {
            Particles.DestroyParticleEffect(modelParticle, true)
        }
        if (propParticle !== undefined) {
            Particles.DestroyParticleEffect(propParticle, true)
        }
        if (gridParticles !== undefined) {
            for (var i in gridParticles) {
                Particles.DestroyParticleEffect(gridParticles[i], true)
            }
        }
        if (overlayParticles !== undefined) {
            for (var i in overlayParticles) {
                Particles.DestroyParticleEffect(overlayParticles[i], true)
            }
        }
        if (rangeOverlay !== undefined) {
            Particles.DestroyParticleEffect(rangeOverlay, true)
        }

        // Building Ghost
        modelParticle = Particles.CreateParticle("particles/buildinghelper/ghost_model.vpcf", ParticleAttachment_t.PATTACH_CUSTOMORIGIN, 0);
        Particles.SetParticleControlEnt(modelParticle, 1, entindex, ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, "follow_origin", Entities.GetAbsOrigin(entindex), true)
        Particles.SetParticleControl(modelParticle, 2, ghost_color)
        Particles.SetParticleControl(modelParticle, 3, [model_alpha,0,0])
        Particles.SetParticleControl(modelParticle, 4, [scale,0,0])

        // Grid squares
        gridParticles = [];
        for (var x=0; x < size*size; x++)
        {
            var particle = Particles.CreateParticle("particles/buildinghelper/square_sprite.vpcf", ParticleAttachment_t.PATTACH_CUSTOMORIGIN, 0)
            Particles.SetParticleControl(particle, 1, [32,0,0])
            Particles.SetParticleControl(particle, 3, [grid_alpha,0,0])
            gridParticles.push(particle)
        }

        // Prop particle attachment
        if (params.propIndex !== undefined)
        {
            propParticle = Particles.CreateParticle("particles/buildinghelper/ghost_model.vpcf", ParticleAttachment_t.PATTACH_CUSTOMORIGIN, 0);
            Particles.SetParticleControlEnt(propParticle, 1, params.propIndex, ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, "attach_hitloc", Entities.GetAbsOrigin(params.propIndex), true)
            Particles.SetParticleControl(propParticle, 2, ghost_color)
            Particles.SetParticleControl(propParticle, 3, [model_alpha,0,0])
            Particles.SetParticleControl(propParticle, 4, [propScale,0,0])
        }
            
        rangeOverlayActive = false;
        overlayParticles = [];
    }

    if (state == 'active')
    {
        $.Schedule(frame_rate, StartBuildingHelper);

        // Get all the visible entities
        var entities = Entities.GetAllEntitiesByClassname('npc_dota_building')
        var hero_entities = Entities.GetAllHeroEntities()
        var creature_entities = Entities.GetAllEntitiesByClassname('npc_dota_creature')
        var dummy_entities = Entities.GetAllEntitiesByName('npc_dota_thinker')
        var building_entities = Entities.GetAllBuildingEntities()
        entities = entities.concat(hero_entities)
        entities = entities.concat(building_entities)
        entities = entities.concat(creature_entities)
        entities = entities.concat(dummy_entities)

        // Build the entity grid with the construction sizes and entity origins
        entityGrid = []
        for (var i = 0; i < entities.length; i++)
        {
            if (!Entities.IsAlive(entities[i]) || Entities.IsOutOfGame(entities[i])) continue
            var entPos = Entities.GetAbsOrigin( entities[i] )
            var squares = GetConstructionSize(entities[i])
            
            if (squares > 0)
            {
                // Block squares centered on the origin
                BlockGridSquares(entPos, squares, GRID_TYPES["BLOCKED"])
            }
            else
            {
                // Put tree dummies on a separate table to skip trees
                if (Entities.GetUnitName(entities[i]) == 'npc_dota_thinker')
                {
                    if (Entities.GetAbilityByName(entities[i], "dummy_tree") != -1)
                        cutTrees[entPos] = entities[i]
                }
                // Block 2x2 squares if its an enemy unit
                else if (Entities.GetTeamNumber(entities[i]) != Entities.GetTeamNumber(builderIndex))
                {
                    BlockGridSquares(entPos, 2, GRID_TYPES["BLOCKED"])
                }
            }

            var specialGrid = GetCustomGrid(entities[i])
            if (specialGrid)
            {
                for (var gridType in specialGrid)
                {
                    if (specialGrid[gridType].Square)
                    {
                        //$.Msg("Setting ",specialGrid[gridType].Square," grid squares with ",gridType.toUpperCase()," [",GRID_TYPES[gridType.toUpperCase()],"]")
                        BlockGridSquares(entPos, Number(specialGrid[gridType].Square), GRID_TYPES[gridType.toUpperCase()])
                    }
                    else if (specialGrid[gridType].Radius)
                    {
                        //$.Msg("Setting ",specialGrid[gridType].Radius," grid radius with ",gridType.toUpperCase()," [",GRID_TYPES[gridType.toUpperCase()],"]")
                        BlockGridInRadius(entPos, Number(specialGrid[gridType].Radius), GRID_TYPES[gridType.toUpperCase()])
                    }
                }              
            }
        }

        // Update treeGrid (slowly, as its the most expensive)
        if (update_trees)
        {
            var time = Game.GetGameTime()
            var time_since_last_tree_update = time - last_tree_update
            if (time_since_last_tree_update > tree_update_interval)
            {
                last_tree_update = time
                tree_entities = Entities.GetAllEntitiesByClassname('ent_dota_tree')
                treeGrid = [];
                for (var i = 0; i < tree_entities.length; i++)
                {
                    var treePos = Entities.GetAbsOrigin(tree_entities[i])
                    // Block the grid if the tree isn't chopped
                    if (cutTrees[treePos] === undefined)
                        BlockGridSquares(treePos, 2, "TREE")                    
                }
            }
        }

        var mPos = GameUI.GetCursorPosition();
        var GamePos = Game.ScreenXYToWorld(mPos[0], mPos[1]);
        if ( GamePos !== null ) 
        {
            SnapToGrid(GamePos, size)

            var invalid;
            var color = COLOR_GREEN
            var part = 0
            var halfSide = (size/2)*64
            var boundingRect = {}
            boundingRect["leftBorderX"] = GamePos[0]-halfSide
            boundingRect["rightBorderX"] = GamePos[0]+halfSide
            boundingRect["topBorderY"] = GamePos[1]+halfSide
            boundingRect["bottomBorderY"] = GamePos[1]-halfSide

            if (GamePos[0] > 10000000) return

            var closeToGoldMine = TooCloseToGoldmine(GamePos)

            // Building Base Grid
            for (var x=boundingRect["leftBorderX"]+32; x <= boundingRect["rightBorderX"]-32; x+=64)
            {
                for (var y=boundingRect["topBorderY"]-32; y >= boundingRect["bottomBorderY"]+32; y-=64)
                {
                    var pos = SnapHeight(x,y,GamePos[2])
                    if (part>size*size)
                        return

                    var gridParticle = gridParticles[part]
                    Particles.SetParticleControl(gridParticle, 0, pos)     
                    part++; 

                    // Grid color turns red when over invalid position
                    color = COLOR_GREEN
                    if (IsBlocked(pos) || closeToGoldMine)
                    {
                        color = COLOR_RED
                        invalid = true
                    }

                    Particles.SetParticleControl(gridParticle, 2, color)   
                }
            }

            // Overlay Grid, visible with Alt pressed
            altDown = permanent_alt_grid || GameUI.IsAltDown();
            if (altDown)
            {
                // Create the particles
                if (overlayParticles && overlayParticles.length == 0)
                {
                    for (var y=0; y < overlay_size*overlay_size; y++)
                    {
                        var particle = Particles.CreateParticle("particles/buildinghelper/square_overlay.vpcf", ParticleAttachment_t.PATTACH_CUSTOMORIGIN, 0)
                        Particles.SetParticleControl(particle, 1, [32,0,0])
                        Particles.SetParticleControl(particle, 3, [alt_grid_alpha,0,0])
                        overlayParticles.push(particle)
                    }
                }

                color = COLOR_WHITE
                var part2 = 0
                var halfSide2 = (overlay_size/2)*64
                var boundingRect2 = {}
                boundingRect2["leftBorderX"] = GamePos[0]-halfSide2
                boundingRect2["rightBorderX"] = GamePos[0]+halfSide2
                boundingRect2["topBorderY"] = GamePos[1]+halfSide2
                boundingRect2["bottomBorderY"] = GamePos[1]-halfSide2

                for (var x2=boundingRect2["leftBorderX"]+32; x2 <= boundingRect2["rightBorderX"]-32; x2+=64)
                {
                    for (var y2=boundingRect2["topBorderY"]-32; y2 >= boundingRect2["bottomBorderY"]+32; y2-=64)
                    {
                        var pos2 = SnapHeight(x2,y2,GamePos[2])
                        if (part2>=overlay_size*overlay_size)
                            return

                        color = COLOR_WHITE //White on empty positions
                        var overlayParticle = overlayParticles[part2]
                        Particles.SetParticleControl(overlayParticle, 0, pos2)     
                        part2++;

                        if (IsBlocked(pos2) || TooCloseToGoldmine(pos2))
                            color = COLOR_YELLOW     

                        Particles.SetParticleControl(overlayParticle, 2, color)
                    }
                }
            }
            else
            {
                // Destroy the particles, only once
                if (overlayParticles && overlayParticles.length != 0)
                {
                    for (var i in overlayParticles) {
                        Particles.DestroyParticleEffect(overlayParticles[i], true)
                    }
                    overlayParticles = [];
                }
            }

            var modelPos = SnapHeight(GamePos[0],GamePos[1],GamePos[2])

            // Destroy the range overlay if its not a valid building location
            if (invalid)
            {
                // DebugPrint("not sure what this does")
                if (rangeOverlayActive && rangeOverlay !== undefined)
                {
                    Particles.DestroyParticleEffect(rangeOverlay, true)
                    rangeOverlayActive = false
                }
            }
            else
            {
                if (!rangeOverlayActive)
                {
                    rangeOverlay = Particles.CreateParticle("particles/buildinghelper/range_overlay.vpcf", ParticleAttachment_t.PATTACH_CUSTOMORIGIN, localHeroIndex)
                    Particles.SetParticleControl(rangeOverlay, 1, [range,0,0])
                    Particles.SetParticleControl(rangeOverlay, 2, COLOR_WHITE)
                    Particles.SetParticleControl(rangeOverlay, 3, [range_overlay_alpha,0,0])
                    rangeOverlayActive = true
                }
            }

            if (rangeOverlay !== undefined)
                Particles.SetParticleControl(rangeOverlay, 0, modelPos)

            // Update the model particle
            modelPos[2]+=modelOffset
            Particles.SetParticleControl(modelParticle, 0, modelPos)

            if (propParticle !== undefined)
            {
                var pedestalPos = SnapHeight(GamePos[0],GamePos[1],GamePos[2])
                pedestalPos[2]+=offsetZ
                Particles.SetParticleControl(propParticle, 0, pedestalPos)
            }

            // Turn the model red if we can't build there
            if (turn_red){
                invalid ? Particles.SetParticleControl(modelParticle, 2, COLOR_RED) : Particles.SetParticleControl(modelParticle, 2, COLOR_WHITE)
                if (propParticle !== undefined)
                    invalid ? Particles.SetParticleControl(propParticle, 2, COLOR_RED) : Particles.SetParticleControl(propParticle, 2, COLOR_WHITE)
            }
        }

        if ( (!GameUI.IsShiftDown() && pressedShift) || !Entities.IsAlive( builderIndex ) )
        {
            EndBuildingHelper();
        }
    }
}
