var HexMapView = Class.create({
    initialize: function(
        theUserId,
        theCSSMainId,
        theHexMapModel,
        theWHex,
        theHHex,
        theWHexMap,
        theHHexMap,
        theWCanvas,
        theHCanvas,
        theHSqrToHexConner,
        theXGlobalOffset,
        theYGlobalOffset,
        theVisibleHexs,
        theUnitSelectedIndicatorImageName,
        theFogOfWarOverlayImageName,
        theFogOfWarSecondOverlayImageName,
        theImageHandler,
        theUserColors
    ) {
        this.userId = theUserId;
        this.cssMainId = theCSSMainId;
        this.hexMapModel = theHexMapModel;                
        this.wHex = theWHex;
        this.hHex = theHHex;
        this.wHexMap = theWHexMap;
        this.hHexMap = theHHexMap;
        this.wCanvas = theWCanvas;
        this.hCanvas = theHCanvas;
        this.hSqrToHexConner = theHSqrToHexConner;
        this.xGlobalOffset = theXGlobalOffset;
        this.yGlobalOffset = theYGlobalOffset;
        this.visibleHexs = theVisibleHexs;
        this.unitSelectedIndicatorImageName = theUnitSelectedIndicatorImageName;
        this.fogOfWarOverlayImageName = theFogOfWarOverlayImageName;
        this.fogOfWarSecondOverlayImageName = theFogOfWarSecondOverlayImageName;
        this.imageHandler = theImageHandler;
        this.userColors = theUserColors;

        this.Z_TERRAIN = 1;
        this.Z_AREA_ELEMENT = 2;
        this.Z_AREA_ELEMENT_LEVL = 3;
        this.Z_UNIT = 4;
        this.Z_HEALT = 5;
        this.Z_SELECT = 6;
        this.Z_POSSIBLE_ORDER =6;
        this.Z_ORDER = 7;
        this.Z_OPACITY_LAYER = 100;
        this.Z_RED_OPACITY_LAYER = 200;
        this.Z_IMAGE_MAP = 1000;
        // this.W_SCREEN = 760;

        // Renamed hm_order_images -> this.orderImages
        this.orderImages = null;
        this.unitImages = null;
        this.healtImages = null;
        // Renamed area_element_images --> areaElementImages
        this.areaElementImages = null; // Each of the images used for drawing the map elements
        this.hexMapImages = null;

        // **********************************
        //  Variables - View layout dynamic
        // **********************************

        // Renamed unit_indi_selected_image --> selectIcon
        this.selectIcon = null;
        this.fogOfWarOverlay = null;
        this.hexImagesHighlighted = null;
        this.hexsWithIndicatorPossibleMove = null;
        this.imagesIndicatorPossibleMove = null;
        this.selectedUnit = null; /* The current selected unit, given by an index in global array units */
        this.selectedUnitInCargo = null;
        this.selectedUnitWithCargo = null;
        this.selectedAreaElement = null; /* The current selected unit, given by an index in global array units */
        this.hexesWithinRange = null; /* Array of hexes within range of the selected unit */
        this.hexesWithinAttackRange = null; /* Array of hexes within range of the min_attack_range and max_attack_range of the unit_type of the selected unit */
        this.orderButtonsPanel = null;
        this.bitmaps = new Array();

        this.createSelectIcon(this.imageHandler.images[this.unitSelectedIndicatorImageName]);
        this.fogOfWarOverlay = this.createFogOfWarOverlay(this.fogOfWarOverlayImageName, this.Z_RED_OPACITY_LAYER);
        this.fogOfWarSecondOverlay = this.createFogOfWarOverlay(this.fogOfWarSecondOverlayImageName, this.Z_OPACITY_LAYER);

        if ($("order_box_panel_parent") != null) {
            this.orderButtonsPanel = new OrderButtonsPanel("order_box_panel_parent", this.hexMapModel, this, this.imageHandler);
        }
    },


    //  -----------------------------------------------------------------------------------------------------------
    // Hexmap draw CORE functions
    //  -----------------------------------------------------------------------------------------------------------

    // Privat
    // Renamed: hex_map_get_area_pixel_x -> getAreaPixelX
    getAreaPixelX: function(x, y)  {
        var dX = 0;
        if (y % 2 == 1) {
            dX = this.wHex/2;
        }

        return x * this.wHex + dX;
    },

    // Privat
    // Renamed: hex_map_get_area_pixel_y -> getAreaPixelY
    getAreaPixelY: function(y) {
        return (this.hHex - this.hSqrToHexConner)*y
    },

    // Privat
    // Renamed: hex_map_draw_bitmap -> drawBitmap
    drawBitmap: function(xHex, yHex, xOffset, yOffset, hexImage, zIndex) {
        var x = this.getAreaPixelX(xHex, yHex) + xOffset + this.xGlobalOffset;
        var y = this.getAreaPixelY(yHex) + yOffset + this.yGlobalOffset;

        var theImage = new Image();
        theImage.src = hexImage.src;
        theImage.style.position = "absolute";
        theImage.style.zIndex = ""+zIndex;
        theImage.style.top = ""+y;
        theImage.style.left = ""+x;

        $(this.cssMainId).appendChild(theImage);

        return theImage;
    },

    //
    addBitmap: function(bitMapType, index, xHex, yHex, xOffset, yOffset, hexImage, zIndex) {
        if (this.bitmaps[bitMapType] == null) {
            this.bitmaps[bitMapType] = new Array();
        }

        this.bitmaps[bitMapType][index] = this.drawBitmap(xHex, yHex, xOffset, yOffset, hexImage, zIndex);

        return this.bitmaps[bitMapType][index];
    },

    removeBitmap: function(bitMapType, index) {
        if ((this.bitmaps[bitMapType] != null)&& (this.bitmaps[bitMapType][index] != null)) {
            $(this.cssMainId).removeChild(this.bitmaps[bitMapType][index]);

            this.bitmaps[bitMapType][index] = null;
            if (this.bitmaps[bitMapType].length == 0) {
                this.bitmaps[bitMapType] = null;
            }
        }
    },

    removeBitmapType: function(bitMapType) {
        if (this.bitmaps[bitMapType] != null) {
            $A(this.bitmaps[bitMapType]).each(function(bitmap){
            	if ((bitmap != undefined) && ($(bitmap).up() != undefined) && ($(bitmap).up() != null)) { // if (($(bitmap).parentNode != undefined) && ($(bitmap).parentNode != null)) {
                    $(bitmap).remove();
                }
            });
        }

        this.bitmaps[bitMapType] = null;
    },


    doBitmapExists: function(bitMapType, index) {
        if ((this.bitmaps[bitMapType] != undefined) && (this.bitmaps[bitMapType][index] != null)) {
            return true;
        }

        return false;
    },

    getBitmap: function(bitMapType, index) {
        return this.bitmaps[bitMapType][index];
    },

    
    // -----------------------------------------------------------------------------------------------------------
    // View - Set Model References
    // -----------------------------------------------------------------------------------------------------------

    setUnits: function(theUnits) {
        this.hexMapModel.units = theUnits;
    },

    setAreaElements: function (theAreaElements) {
        this.hexMapModel.areaElements = theAreaElements;
    },

    setVisibleHexs: function (theVisibleHexs) {
        this.visibleHexs = theVisibleHexs;
    },

    setSemiVisibleHexs: function (theSemiVisibleHexs) {
        this.semiVisibleHexs = theSemiVisibleHexs;
    },

    // -----------------------------------------------------------------------------------------------------------
    // View - Hex map, order drawing functions
    // -----------------------------------------------------------------------------------------------------------

    orderDirection: function (xFrom, yFrom, xDest, yDest) {
        var theDirectionName = null;

        if ((xDest - xFrom) > 0) { // East
            if ((yDest - yFrom) > 0) { // South
                theDirectionName = "_south_east";
            } else if ((yDest - yFrom) == 0) { // Pure east
                theDirectionName = "_east";
            } else {
                theDirectionName = "_north_east";
            }
        }   else { // West
            if ((yDest - yFrom) > 0) { // South
                theDirectionName = "_south_west";
            } else if ((yDest - yFrom) == 0) { // Pure west
                theDirectionName = "_west";
            } else {
                theDirectionName = "_north_west";
            }
        }

        return theDirectionName;
    },
    
    // Public
    drawOrder: function(orderType, theFromHexIndex, theDestHexIndex, theUnitIndex, theOrderIndex, theZIndexOffset) {
        var xDestHex = this.hexMapModel.getHexX(theDestHexIndex);
        var yDestHex = this.hexMapModel.getHexY(theDestHexIndex, xDestHex);

        var xFromHex = this.hexMapModel.getHexX(theFromHexIndex);
        var yFromHex = this.hexMapModel.getHexY(theFromHexIndex, xFromHex);

        var xDest = this.getAreaPixelX(xDestHex, yDestHex)
        var yDest = this.getAreaPixelY(yDestHex)

        var xFrom = this.getAreaPixelX(xFromHex, yFromHex)
        var yFrom = this.getAreaPixelY(yFromHex)

        var theDirectionName = "";
        if (orderType != "upgrad") {
            theDirectionName = this.orderDirection (xFrom, yFrom, xDest, yDest);
        }


       if (this.orderImages[theUnitIndex] == null) {
            this.orderImages[theUnitIndex] = new Array();
       }

      this.orderImages[theUnitIndex][theOrderIndex]  = this.drawBitmap(xDestHex, yDestHex, 0, 0, this.imageHandler.images["order_"+orderType+theDirectionName], this.Z_ORDER+this.Z_RED_OPACITY_LAYER+theZIndexOffset);
    },

    // Public
    // Renamed hex_map_remove_order_image --> removeOrderImage
    removeOrderImage: function(theUnitId, theOrderIndex) {
        $(this.cssMainId).removeChild(this.orderImages[theUnitId][theOrderIndex]);
    },

    // Privat
    // Renamed hex_map_draw_unit_orders --> drawUnitOrders
    drawUnitOrders: function(theUnit, theZIndexOffset) {
        if (this.hexMapModel.units.doUnitHaveOrder(theUnit)) {
            var numOfOrders = this.hexMapModel.units.getUnitNumberOfOrders(theUnit);
            for (var theOrderIndex = 0;theOrderIndex < numOfOrders; theOrderIndex++) {
                var theOrderType = this.hexMapModel.units.getUnitOrderTypeByIndex(theUnit, theOrderIndex);
                var theFromHexIndex = this.hexMapModel.units.getUnitLocationHexIndex (theUnit);
                var theOrderDestHexIndex = this.hexMapModel.units.getUnitOrderDestLocationHexByIndex(theUnit, theOrderIndex);
                var theUnitId = this.hexMapModel.units.getUnitId(theUnit);

                this.drawOrder(theOrderType, theFromHexIndex, theOrderDestHexIndex, theUnitId, theOrderIndex, theZIndexOffset);
            }
        }
    },

    // -----------------------------------------------------------------------------------------------------------
    // View - Hex map, unit drawing functions
    // -----------------------------------------------------------------------------------------------------------

    // Public
    healtImageName: function(healt) {
        var theHealtImageName ="unit_indi_health9";
        if (healt <= 1) { theHealtImageName ="unit_indi_health1"; }
        else if (healt == 2) { theHealtImageName ="unit_indi_health2"; }
        else if (healt == 3) { theHealtImageName ="unit_indi_health3"; }
        else if (healt == 4) { theHealtImageName ="unit_indi_health4"; }
        else if (healt == 5) { theHealtImageName ="unit_indi_health5"; }
        else if (healt == 6) { theHealtImageName ="unit_indi_health6"; }
        else if (healt == 7) { theHealtImageName ="unit_indi_health7"; }
        else if (healt == 8) { theHealtImageName ="unit_indi_health8"; }
        else if (healt == 9) { theHealtImageName ="unit_indi_health9"; }

        return theHealtImageName;
    },
    
    // Privat
    // Renamed hex_map_draw_unit --> drawUnit
    drawUnit: function(theUnits, theUnit, theZIndexOffset) {
        if (theZIndexOffset == null) {
            theZIndexOffset = 0;
        }

        var unitHexIndex = theUnits.getUnitLocationHexIndex(theUnit)
        if (unitHexIndex < 0) {
            return;
        }

        var theUnitType = theUnits.getUnitType(theUnit);
        var xHex = this.hexMapModel.getHexX(unitHexIndex);
        var yHex = this.hexMapModel.getHexY(unitHexIndex, xHex);

        // Draw the unit
        var theImageName = "unit_"+theUnits.getUnitTypeName(theUnitType)+"_"+this.userColors[""+theUnits.getUnitUserId(theUnit)];
        this.unitImages[unitHexIndex] = this.drawBitmap(xHex, yHex, 0, 0, this.imageHandler.images[theImageName], this.Z_UNIT+theZIndexOffset);         

        var theHealtImageName = this.healtImageName(theUnits.getUnitHealt(theUnit)); 
        var theImage = this.imageHandler.images[theHealtImageName];        
        this.healtImages[unitHexIndex] = this.drawBitmap(xHex, yHex, 0, 0, theImage, this.Z_HEALT+theZIndexOffset); // NOTE: ONLY ALLOWS FOR ONE UNIT IN EACH HEX        
    },

    // Privat
    drawUnits: function(theUnits) {
        this.unitImages = new Array();
        this.healtImages = new Array();
        this.orderImages = new Array();

        for (var i in theUnits.units) {
            var theUnitsInHex = theUnits.getAllUnitsAtHexIndex(i);
            for (var j = 0; j < theUnitsInHex.length; j++) {
                this.drawUnit (theUnits, theUnitsInHex[j], 0);
                this.drawUnitOrders(theUnitsInHex[j], 0);
            }
        }
    },

    // -----------------------------------------------------------------------------------------------------------
    // View - Hex map, draw Area Elements
    // -----------------------------------------------------------------------------------------------------------

    
    // Privat
    drawAreaElement: function(theAreaElements, theAreaElement, theZIndex) {
        var areaElementHexIndex = theAreaElements.getAreaElementHexIndex(theAreaElement);
        var theAreaElementType = theAreaElements.getAreaElementType(theAreaElement);
        var xHex = this.hexMapModel.getHexX(areaElementHexIndex);
        var yHex = this.hexMapModel.getHexY(areaElementHexIndex, xHex);

        // Draw the map element
        var theImageName = theAreaElements.getAreaElementTypeName(theAreaElementType);
        var theUserId = theAreaElements.getAreaElementUserId(theAreaElement);
        var theAELevel = theAreaElements.getAreaElementLevel(theAreaElement);

        var theColor = "empty";
        if (theUserId != null) {
            theColor = this.userColors[""+theUserId]
        }

        var theImage =  this.imageHandler.images["area_element_"+theImageName+"_"+theColor];        
        var theImageEle = this.drawBitmap(xHex, yHex, 0, 0, theImage, theZIndex);
        this.areaElementImages[areaElementHexIndex] = theImageEle; // NOTE: ONLY ALLOWS FOR ONE MAP ELEMENT IN EACH HEX
        this.areaElementImages[areaElementHexIndex] = theImageEle; // NOTE: ONLY ALLOWS FOR ONE MAP ELEMENT IN EACH HEX

        if (theAELevel >= 1) {
            var theLevelImage = this.imageHandler.images["ae_level_"+theAELevel];
            this.addBitmap("aeLevel", areaElementHexIndex, xHex, yHex, 0, 0, theLevelImage, theZIndex+1)
        }
    },

    // Privat
    drawAreaElements: function(theAreaElements) {
       this.areaElementImages = new Array();

        for (var i in theAreaElements.areaElements) {
            var theAreaElement = theAreaElements.getAllAreaElementsAtHexIndex(i);
            this.drawAreaElement (theAreaElements, theAreaElement, this.Z_AREA_ELEMENT);
        }
    },

    // -----------------------------------------------------------------------------------------------------------
    // View - Hex map, hex drawing functions
    // -----------------------------------------------------------------------------------------------------------
    
    // Privat
    drawHexMap: function() {
        this.hexMapImages = new Array(); // Sets the global variable
        var numOfAreas = this.hexMapModel.areas.getNumberOfAreas();
        for (var theAreaIndex = 0; theAreaIndex < numOfAreas; theAreaIndex++) {
            var theArea = this.hexMapModel.areas.getAreaAtArrayIndex(theAreaIndex)
            if (theArea != null) {
                var theAreaLocationIndex = this.hexMapModel.areas.getAreaLocationHexIndex(theArea);
                var xHex = this.hexMapModel.getHexX(theAreaLocationIndex);
                var yHex = this.hexMapModel.getHexY(theAreaLocationIndex, xHex);

                var terrainName = this.hexMapModel.areas.getAreaTerrainNameFromArrayIndex(theAreaIndex);

                this.hexMapImages[theAreaLocationIndex] = this.drawBitmap(xHex, yHex, 0, 0, this.imageHandler.images["terrain_"+terrainName], this.Z_TERRAIN);
            }
        }
    },

    //Public
    draw: function() {
        this.drawHexMap();
        this.drawAreaElements(this.hexMapModel.areaElements);
        this.drawUnits(this.hexMapModel.units);
    },

    // Privat
    // Renamed: createSelectedCursor --> createSelectIcon
    createSelectIcon: function (theImage) {
        var zIndex = this.Z_SELECT+this.Z_RED_OPACITY_LAYER;

        this.selectIcon = theImage;
        this.selectIcon.style.position = "absolute";
        this.selectIcon.style.visibility = "hidden";
        this.selectIcon.style.zIndex = ""+zIndex;
        this.selectIcon = theImage;


        $(this.cssMainId).appendChild(this.selectIcon);
    },

    // Privat
    // Renamed: set_element_indi_selected --> showSelectIcon
    showSelectIcon: function(theHexIndex) {
        var xHex = this.hexMapModel.getHexX(theHexIndex);
        var yHex = this.hexMapModel.getHexY(theHexIndex, xHex);
        var x = this.getAreaPixelX(xHex, yHex);
        var y = this.getAreaPixelY(yHex);

        this.selectIcon.style.left = ""+(x+x_graphic_offset);
        this.selectIcon.style.top = ""+(y+y_graphic_offset);
        this.selectIcon.style.zIndex = ""+(this.Z_SELECT+this.Z_RED_OPACITY_LAYER);
        this.selectIcon.style.visibility = "visible";
    },

    // Privat
    hideSelectIcon: function(theHexIndex) {
        this.selectIcon.style.visibility = "hidden";
    },


    // Privat
    createFogOfWarOverlay: function (fowImageName, theZIndex) {
        var imgFOW = this.imageHandler.images[fowImageName];
        var theImage = $(document.createElement("img"));
        theImage.border=0;        
        theImage.src = imgFOW.src;
        theImage.setStyle("position: absolute; z-index: "+theZIndex+"; top: "+this.yGlobalOffset+"px; left: "+this.xGlobalOffset+"px;height: "+this.hCanvas+"; width: "+this.wCanvas+";");
        
        $(this.cssMainId).appendChild(theImage);

        return theImage;
    },

    // Privat
    // Renamed opacity_on --> fogOfWarOn
    fogOfWarOn: function() {
        this.fogOfWarOverlay.style.visibility = "visible";
        this.fogOfWarSecondOverlay.style.visibility = "visible";
    },

    // Privat
    fogOfWarOff: function() {
        this.fogOfWarOverlay.style.visibility = "hidden";
        this.fogOfWarSecondOverlay.style.visibility = "hidden";
    },

    // Highlight hexs and units
    //*************************************

    // Privat
    highlightHexes: function(hexs, theZIndex) {
        this.hexImagesHighlighted = new Array();

        for (var i = 0; i < hexs.length; i++) {
            var hexImage = this.hexMapImages[hexs[i]];

            if (hexImage != null) {
              hexImage.style.zIndex = ""+(this.Z_TERRAIN+theZIndex);
              this.hexImagesHighlighted.push(hexs[i]);
            }

            if (this.unitImages[hexs[i]]) {
                var unitImage = this.unitImages[hexs[i]];
                unitImage.style.zIndex = ""+(this.Z_UNIT+theZIndex);

                var healtImage = this.healtImages[hexs[i]];
                healtImage.style.zIndex = ""+(this.Z_HEALT+theZIndex);
            }

            if (this.areaElementImages[hexs[i]]) {
                var areaElementImage = this.areaElementImages[hexs[i]];
                areaElementImage.style.zIndex = ""+(this.Z_AREA_ELEMENT + theZIndex);

                if (this.doBitmapExists("aeLevel",hexs[i])) {
                    var theBitmap = this.getBitmap("aeLevel",hexs[i]);
                    theBitmap.style.zIndex = ""+(this.Z_AREA_ELEMENT + theZIndex + 1);
                }
            }
        }

        // TODO: Can most likly be optimised. We are running though the complet area, while we only need to check the actually units
        if (this.hexMapImages != null) {
            for (var unitIndex = 0; unitIndex < this.hexMapImages.length; unitIndex++) {
              if (this.orderImages[unitIndex] != null) {
                for (var orderIndex = 0; orderIndex < this.orderImages[unitIndex].length; orderIndex++) {
                  var orderImage = this.hexMapImages[unitIndex][orderIndex];
                  orderImage.style.zIndex = ""+(this.Z_ORDER + theZIndex);
                }
              }
            }
        }
    },

    // Public
    // Renamed: remove_highlight --> removeHighlightedHexes
    removeHighlightedHexes: function() {
        if (this.hexImagesHighlighted != null) {
            for (var i = 0; i < this.hexImagesHighlighted.length; i++) {
                var theImage = this.hexMapImages[this.hexImagesHighlighted[i]];
                theImage.style.zIndex = ""+this.Z_TERRAIN;

                if (this.unitImages[this.hexImagesHighlighted[i]]) {
                    var theUnitImage = this.unitImages[this.hexImagesHighlighted[i]];
                    theUnitImage.style.zIndex = ""+this.Z_UNIT;

                    var theHealtImage = this.healtImages[this.hexImagesHighlighted[i]];
                    theHealtImage.style.zIndex = ""+this.Z_HEALT;
                }

                if (this.areaElementImages[this.hexImagesHighlighted[i]]) {
                    var theAreaElementImage = this.areaElementImages[this.hexImagesHighlighted[i]];
                    theAreaElementImage.style.zIndex = ""+this.Z_AREA_ELEMENT;

                    if (this.doBitmapExists("aeLevel",this.hexImagesHighlighted[i])) {
                        var theBitmap = this.getBitmap("aeLevel",this.hexImagesHighlighted[i]);
                        theBitmap.style.zIndex = ""+(this.Z_AREA_ELEMENT + 1);
                    }
                }
            }
        }

        // TODO: Can most likly be optimised. We are running though the complet area, while we only need to check the actually units
        if (this.orderImages != null) {
          for (var theUnitIndex = 0; theUnitIndex < this.orderImages.length; theUnitIndex++) {
            if (this.orderImages[theUnitIndex] != null) {
              for (var theOrderIndex = 0; theOrderIndex < this.orderImages[theUnitIndex].length; theOrderIndex++) {
                var orderImage = this.orderImages[theUnitIndex][theOrderIndex];
                orderImage.style.zIndex = ""+this.Z_ORDER;
              }
            }
          }
        }

        this.hexImagesHighlighted = null;
    },

    // Public
    // Renamed: set_visible_hexes_highlight --> showHighlightedHexes
    showHighlightedHexes: function() {
        this.highlightHexes(this.visibleHexs, this.Z_RED_OPACITY_LAYER);
    },

    // Public
    // Renamed: set_visible_hexes_highlight --> showHighlightedHexes
    showSemilightedHexes: function() {
        if (this.semiVisibleHexs != null) {
            this.highlightHexes(this.semiVisibleHexs, this.Z_OPACITY_LAYER);
        }
        
    },

// -----------------------------------------------------------------------------------------------------------
//  View - Dynamic
// -----------------------------------------------------------------------------------------------------------


    // Privat
    setIndicatorPossibleOrder: function(hexesWithinRange, theHexIndex, indicateAttackOnly) {
        this.hexsWithIndicatorPossibleMove = hexesWithinRange;
        var startIndex = 0;
        if (indicateAttackOnly == false) {
            this.imagesIndicatorPossibleMove = new Array();
        } else {
            startIndex = this.imagesIndicatorPossibleMove.length;
        }

        var j = startIndex;
        for (var i = 0; i < this.hexsWithIndicatorPossibleMove.length; i++) {
            var theHexIndexI = this.hexsWithIndicatorPossibleMove[i];
            if ((theHexIndexI != null) && (theHexIndex != theHexIndexI)) {
                var xLoc = this.hexMapModel.getHexX(theHexIndexI);
                var yLoc = this.hexMapModel.getHexY(theHexIndexI, xLoc);

                var theImage  = null;
                if (this.hexMapModel.units.isUnitsInHex(theHexIndexI)) {
                    // TODO: Needs to get updated to support more units in one hex
                    var theUnitsInHex =  this.hexMapModel.units.getAllUnitsAtHexIndex(theHexIndexI);
                    var theUnit =  theUnitsInHex[0];
                    if (this.hexMapModel.units.getUnitUserId(theUnit) == this.userId) {
                        if (indicateAttackOnly == false) {
                            theImage  = this.drawBitmap(xLoc, yLoc, 0, 0, this.imageHandler.images["unit_indi_move"], this.Z_POSSIBLE_ORDER+this.Z_RED_OPACITY_LAYER);
                        }
                    } else {
                        theImage  = this.drawBitmap(xLoc, yLoc, 0, 0, this.imageHandler.images["indicator_possible_attack"], this.Z_POSSIBLE_ORDER+this.Z_RED_OPACITY_LAYER);
                    }
                } else if (this.hexMapModel.areaElements.isAreaElementsAtHexIndex(theHexIndexI)) {
                   var theAreaElementInHex = this.hexMapModel.areaElements.getAllAreaElementsAtHexIndex(theHexIndexI);
                   if ((this.hexMapModel.areaElements.getAreaElementUserId(theAreaElementInHex) == this.userId) ||  (this.hexMapModel.areaElements.getAreaElementUserId(theAreaElementInHex) == null)){
                        if (indicateAttackOnly == false) {
                            theImage  = this.drawBitmap(xLoc, yLoc, 0, 0, this.imageHandler.images["unit_indi_move"], this.Z_POSSIBLE_ORDER+this.Z_RED_OPACITY_LAYER);
                        }
                    } else {
                        theImage  = this.drawBitmap(xLoc, yLoc, 0, 0, this.imageHandler.images["indicator_possible_attack"], this.Z_POSSIBLE_ORDER+this.Z_RED_OPACITY_LAYER);
                    }
                } else {
                    if (indicateAttackOnly == false) {
                        theImage  = this.drawBitmap(xLoc, yLoc, 0, 0, this.imageHandler.images["unit_indi_move"], this.Z_POSSIBLE_ORDER+this.Z_RED_OPACITY_LAYER);
                    }
                }

                if (theImage != null) {
                    this.imagesIndicatorPossibleMove[j] = theImage;
                    j++;
                }
            }
         }
    },
    
    setIndicatorPossibleRaid:function(aHexIndex) {
        var xLoc = this.hexMapModel.getHexX(aHexIndex);
        var yLoc = this.hexMapModel.getHexY(aHexIndex, xLoc);

        this.addBitmap("raid", aHexIndex, xLoc, yLoc, 0, 0, this.imageHandler.images["indicator_possible_raid"], this.Z_POSSIBLE_ORDER+this.Z_RED_OPACITY_LAYER)
    },

    // Public
    removeIndicatorPossibleOrder: function () {
        if (this.imagesIndicatorPossibleMove != null) {
            var motherNode = $(this.cssMainId);
            for (var i = 0; i < this.imagesIndicatorPossibleMove.length; i++) {
                motherNode.removeChild(this.imagesIndicatorPossibleMove[i]);
            }

            this.imagesIndicatorPossibleMove = null;
        }

        if (this.orderButtonsPanel != null) {
            this.orderButtonsPanel.hide();
        }

        this.removeBitmapType("raid");
    },

    // Public
    removeUnit: function(theUnit) {
        var motherNode = $(this.cssMainId);
        var theUnitIndex = this.hexMapModel.units.getUnitId(theUnit);
        var theUnitHexIndex = this.hexMapModel.units.getUnitLocationHexIndex(theUnit);

        var theUnitImage = this.unitImages[theUnitHexIndex];
        if (theUnitImage) {
            motherNode.removeChild(theUnitImage);
            this.unitImages[theUnitHexIndex] = null;
        }

        var theHealtImage = this.healtImages[theUnitHexIndex];
        if (theHealtImage) {
            motherNode.removeChild(theHealtImage);
            this.healtImages[theUnitHexIndex] = null;
        }

        if (this.orderImages[theUnitIndex]) {
            var numOfOrderImages = this.orderImages[theUnitIndex].length;
            for (var theOrderIndex = 0; theOrderIndex < numOfOrderImages; theOrderIndex++) {
                motherNode.removeChild(this.orderImages[theUnitIndex][theOrderIndex]);
                this.orderImages[theUnitIndex][theOrderIndex] = null;
            }
            this.orderImages[theUnitIndex] = null;
        }        
    },

    // Public
    removeAreaElement: function(theAreaElement) {
        var motherNode = $(this.cssMainId);
        var theAEHexIndex = this.hexMapModel.areaElements.getAreaElementHexIndex(theAreaElement);

        var theAEImage = this.areaElementImages[theAEHexIndex];
        if (theAEImage) {
            motherNode.removeChild(theAEImage);
            this.areaElementImages[theAEHexIndex] = null;
        }
    },

    // Privat
    removeAllImages: function (theImageArray) {
        var motherNode = $(this.cssMainId);

        theImageArray.each(function(item) {
            var theImage = item;
            if ((theImage) && (theImage.parentNode))  { // NOTE this needs to be improved, seems as the for in takes array methods as well, e.g. each
                // motherNode.removeChild(theImage);
                $(theImage).remove();
            }
        });
    },

    clearHexMap: function() {
        this.removeAllImages(this.hexMapImages);
    },

    clearAll: function() {
        // Select indicator and possible moves indicator
        this.deselectUnit ();

        // Remove visible hexes
        this.removeHighlightedHexes();

        // Area elements
        if (this.areaElementImages) {
            this.removeAllImages(this.areaElementImages);
        }

        //Units
        if (this.unitImages) {
            this.removeAllImages(this.unitImages);
            this.removeAllImages(this.healtImages);
        }

        // Orders
        if (this.orderImages) {
            this.orderImages.each(function(item) {
                var theImageArray = item;
                if (theImageArray) { // NOTE this needs to be improved, seems as the for in takes array methods as well, e.g. each
                    hexMapView.removeAllImages(theImageArray); // TODO: Shity way of refering to "this"
                }
            });
         }
    },

    // Public
    // Renamed update_draw --> update
    update: function(theAreaElements, theUnits) {
        this.clearAll();

        if (theUnits == null) {
            theUnits = this.hexMapModel.units;
        }

        if (theAreaElements == null) {
            theAreaElements = this.hexMapModel.areaElements;
        }


        this.drawAreaElements(theAreaElements);
        this.drawUnits(theUnits);
        this.showHighlightedHexes();
        this.fogOfWarOn();
    },

    // **************************
    // Action Indicator & hexesWithinRange
    // **************************

    // Privat
    setPossibleActionIndicator: function  (theFromHexIndex, theSelectedUnitType, theSelectedUnit) {
        this.hexesWithinRange =  this.hexMapModel.getHexesWithinRange(theFromHexIndex, theSelectedUnitType, theSelectedUnit, 1, this.hexMapModel.units.isUnitPossibleToMove);
        this.hexesWithinAttackRange = null;
        this.setIndicatorPossibleOrder(this.hexesWithinRange,theFromHexIndex, false);

        var minAttRange = this.hexMapModel.units.getUnitTypeMinAttRange(theSelectedUnitType);
        var maxAttRange = this.hexMapModel.units.getUnitTypeMaxAttRange(theSelectedUnitType);
        var theThis = this;
        if (maxAttRange > 1) {
            var allHexesWithinAttackRange = this.hexMapModel.getHexesWithinPerimeter (theFromHexIndex, theSelectedUnitType, theSelectedUnit, minAttRange, maxAttRange, function() { return true; })
            this.hexesWithinAttackRange = new Array();
            allHexesWithinAttackRange.each(function(theHexIndex) { // TODO: Shity way to refer to "this" by using "hexMapView"
                if (theThis.hexMapModel.units.isUnitsInHex(theHexIndex)) {
                    var theUnitsInHex = theThis.hexMapModel.units.getAllUnitsAtHexIndex(theHexIndex);
                    var theUnit = theUnitsInHex[0];  // NEEDS TO BE UPDATED FOR GAMES WITH MORE THAN ONE UNIT PR. HEX
                    // Do the unit belong to the current player
                    if (theThis.userId !=  theThis.hexMapModel.units.getUnitUserId(theUnit) ) {
                        theThis.hexesWithinAttackRange.push(theHexIndex);
                    }
                }
            });

            this.setIndicatorPossibleOrder(this.hexesWithinAttackRange,theFromHexIndex, true);
        }

        // Show raid indicator
        if (this.hexMapModel.units.isUnitTypePossibleOrder(theSelectedUnitType, "raid")) {
            var hs = $A(this.hexMapModel.getHexsNextToHex(theFromHexIndex));
            hs.each(function(aHexIndex) {
                if (theThis.hexMapModel.units.canUnitRaidHex(theSelectedUnit, aHexIndex, theThis.hexMapModel.areaElements)) {
                    theThis.setIndicatorPossibleRaid(aHexIndex);
                }    
            });
        }

        // Show relevant extra orders, e.g. build, "units in cargo", ...
        if (this.orderButtonsPanel != null) {
            if (this.hexMapModel.units.getUnitTypeNumOfPossibleOrders(theSelectedUnitType) > 3) {
                this.orderButtonsPanel.update(theSelectedUnit);
            } else {
                this.orderButtonsPanel.hide();
            }
        }
    },

    setHexesWithinRange: function(theHexes) {
        this.hexesWithinRange = theHexes;
    },

    getHexesWithinRange: function() {
        return this.hexesWithinRange;
    },

    getHexesWithinAttackRange: function() {
        return this.hexesWithinAttackRange;
    },

    showOrderButtons: function() {

    },
    
    // **************************
    // Select Hex
    // **************************

    // Public    
    selectHex: function(theIndex) {
        this.showSelectIcon(theIndex);
    },

    deselectHex: function(theIndex) {
        this.hideSelectIcon(theIndex);
    },

    // showUnitsInCargo: function(theSelectedUnit) {
    //    this.hexMapModel.getUnitUnitsInCargo
    // },
    
    // **************************
    // Select Unit
    // **************************
    selectUnitFromIndex: function(theIndex) {
        var theUnitsInHex = this.hexMapModel.units.getAllUnitsAtHexIndex(theIndex);

        // Is there exactly one unit in the hex
        if (theUnitsInHex.length == 1) {
            this.selectUnit(theUnitsInHex[0]);
        }

        // Are there more than one unit in the hex
        else if (theUnitsInHex.length > 1) {
            // NEEDS TO GET UPDATED
        }
    },

    // Public
    selectUnit: function(theUnit) {
            this.selectedUnit = theUnit;
            var selectedUnitType = this.hexMapModel.units.getUnitType(this.selectedUnit);

            this.showSelectIcon(this.hexMapModel.units.getUnitLocationHexIndex(this.selectedUnit));

            if (this.hexMapModel.units.getUnitMovePointsLeft(this.selectedUnit) > 0) {
                var theFromHexIndex = 0;

                if (this.hexMapModel.units.doUnitHaveOrder(this.selectedUnit)) {
                    theFromHexIndex = this.hexMapModel.units.getUnitDestHexOfLastOrder(this.selectedUnit);
                } else {
                    theFromHexIndex = this.hexMapModel.units.getUnitLocationHexIndex(this.selectedUnit);
                }
                // this.showUnitsInCargo(this.selectedUnit);
                this.setPossibleActionIndicator(theFromHexIndex, selectedUnitType, this.selectedUnit);    
            }        
    },

    getSelectedUnit: function() {
        return this.selectedUnit;
    },

    // Public
    // Renamed: remove_unit_selected --> deselectUnit
    deselectUnit: function() {
        if (this.selecteUnitInCargo != null) {
            var hexIndex = this.hexMapModel.units.getUnitLocationHexIndex(this.selecteUnitInCargo);
            this.hexMapModel.units.setUnitLocationHexIndex(this.selecteUnitInCargo, -1);
            this.hexMapModel.units.setUnitLocationHexIndex(this.selecteUnitWithCargo, hexIndex);
            
            this.removeBitmapType("unitincargo");

            this.selecteUnitInCargo = null;
            this.selecteUnitWithCargo = null;
        }
        this.selectedUnit =null;
        this.hexesWithinRange = null;
        this.selectIcon.style.visibility = "hidden";
        this.removeIndicatorPossibleOrder();
     },

    // -----------------------------------------------------------------------------------------------------------
    // Controller - AreaElement Selected Handler
    // -----------------------------------------------------------------------------------------------------------

    // Privat
    setAreaElementSelected: function(theSelectedAreaElement) {
        this.selectedAreaElement = theSelectedAreaElement;

        this.showSelectIcon(this.hexMapModel.areaElements.getAreaElementHexIndex(this.selectedAreaElement));

        plsb.show(this.selectedAreaElement, "area_element", resources);
    },

    getSelectedAreaElement: function() {
        return this.selectedAreaElement;
    },

    removeAreaElementSelected: function () {
        // null
    }
});

var OrderButtonsPanel = Class.create({
    initialize: function(theParentElement, theHexMap, theHexMapView, theImageHandler) {
        this.parentElement = $(theParentElement);
        this.hexMap = theHexMap;
        this.hexMapView = theHexMapView;
        this.imageHandler = theImageHandler;
        this.selectedUnit = null;
        
        this.htmlBase = "<div id='order_box_panel'></div>";

        this.parentElement.update(this.htmlBase);

        $(this.parentElement).hide();
    },

    addUnitsInCargo: function(theUnitsInCargo, theUnitWithTheCargo) {
        var theThis = this;
        var theUnits = this.hexMap.units;
        var theHTML = "<div id='order_box_units_in_cargo'>Units in cargo:";
        var index = 1;
        theUnitsInCargo.each(function(aUnitInCargo) {
            var ut = theUnits.getUnitType(aUnitInCargo);
            var theImageName = "unit_"+theUnits.getUnitTypeName(ut)+"_"+this.hexMapView.userColors[""+theUnits.getUnitUserId(aUnitInCargo)];
            theHTML += "<div id='order_box_image_"+index+"' onclick='selectUnitInCargo("+theUnits.getUnitId(aUnitInCargo)+","+theUnits.getUnitId(theUnitWithTheCargo)+")'><img src='../images/32x32/"+theImageName+"_32x32.png'/></div>";
            index++;
        });
        theHTML += "</div>"
        return theHTML;
    },

    orderText: function(aPossibleOrder, theSelectedUnit ){
        var theOrderText = "";
        
        if (aPossibleOrder == "upgrad") {
            var hexLoc = this.hexMap.units.getUnitLocationHexIndex(theSelectedUnit);
            var ae = this.hexMap.areaElements.getAllAreaElementsAtHexIndex(hexLoc);
            var upgradCost = this.hexMap.areaElements.getAreaElementUpgradCost(ae);                    
            var aeLevel = this.hexMap.areaElements.getAreaElementLevel(ae);
            
            theOrderText = "Upgrad to level "+(aeLevel+1)+" ("+upgradCost+" Gold)";
        } else if (aPossibleOrder == "transport") {
            return "Disembak";
        }  else if (aPossibleOrder == "raid") {
            return "Raid";
        }

        return theOrderText;
    },

    update: function(theSelectedUnit) {
        this.selectedUnit = theSelectedUnit;
        this.htmlBase = "<div id='order_box_panel'>";
        var theThis = this;
        var possibleOrdersArray = $A(this.hexMap.units.getUnitTypePossibleOrders(this.hexMap.units.getUnitType(this.selectedUnit)));

        possibleOrdersArray.each(function(aPossibleOrder){
            if ((aPossibleOrder != "move") && (aPossibleOrder != "attack") && (aPossibleOrder != "heal") && 
                (theThis.hexMap.units.isUnitOrderAllowed(theThis.selectedUnit, aPossibleOrder, theThis.hexMap.areaElements)))
            {
                 if (aPossibleOrder == "transport") {
                    var unitsInCargo = $A(theThis.hexMap.units.getUnitUnitsInCargo(theSelectedUnit));
                    theThis.htmlBase += theThis.addUnitsInCargo(unitsInCargo, theThis.selectedUnit);
                 } else {
                     var theOrderText = theThis.orderText(aPossibleOrder, theThis.selectedUnit);
                     theThis.htmlBase += "<div id='order_box' onclick='addUpgradOrder()'>"+theOrderText+"</div>";
                     
                 }
            }
        });
        this.htmlBase += "</div>";
        this.parentElement.update(this.htmlBase);

        this.show();
    },

    show: function() {        
        $(this.parentElement).appear ();
        this.isShown = true;
    },
    
    hide: function() {
        if (this.isShown) {
            $(this.parentElement).fade ();
            this.isShown = false;
        }       
    }
});
