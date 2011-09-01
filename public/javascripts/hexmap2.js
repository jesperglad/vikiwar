var  HexMap = Class.create({
    // Public
    initialize: function(
        theTerrain,
        theAreas,
        theAreaElementTypes,
        theAreaElements,
        theUnitTypes,
        theUnits)
    {
        // this.imageHandler

        // this.wHex = ???
        // this.hHex = ???
        // this.hSqrToHexConner = ???

        // this.wHexMap = ???
        // this.xGraphicOffset = ???
        // this.yGraphicOffset = ???

        // this.canvasCSSID = ??? ... new former center_id

        // An array of the images used for drawing the hexes. 
        // The variable is initialized and set in drawMap()
        this.hexMapImages = null;
    },

    // Public
    setTerrain: function() {
    },

    // Public
    setAreas: function() {
    },

    // Public
    setAreaElementTypes: function() {
    },

    // Public
    setAreaElements: function() {
    },

    // Public
    setUnitTypes: function() {
    },

    // Public
    setUnits: function() {
    },

    // Public
    // Draws the hex map and the related elements: AreaElements, Units, and Orders
    draw: function() {
        drawMap(); // hex_map_draw_hex_map();
        drawAreaElements(this.areaElements, this.wHexMap, this.imageHandler.images); // hex_map_draw_area_elements(area_elements, w_hex_map,  image_handler.images)
        drawUnits(this.units, this.wHexMap, this.imageHandler.images); // hex_map_draw_units(units, w_hex_map, image_handler.images);

        // ordersSendStatus and _current_user_state is a global variable part of _map
        if ((ordersSendStatus == "sent") || (_current_user_state == "killed")) {
          remove_highlight ();
        } else {
          set_visible_hexes_highlight();
        }

        opacity_on();        
    },

    // Public
    update: function() {
    },

    // Public
    removeHighlightedHexes: function() {
    },

    // Public
    showHighlightedHexes: function() {
    },

    // Public
    createOrderOfSelectedUnit: function() {
    },

    // Public
    deleteOrdersOfSelectedUnit: function() {
    },

    // Public
    createOrderOfSelectedAreaElement: function() {
    },

    // Public
    deleteOrdersOfSelectedAreaElement: function() {
    },

    // Public
    select: function() {
    },

    // Public
    deselect: function() {
    },

    // Public
    createOrder: function() {
    },

    // Privat
    // Drawing utility
    getHexX: function (theIndex) {
        return theIndex%this.wHexMap;
    },

    // Privat
    // Drawing utility
    getHexY: function(theIndex, xLoc) {
        return (theIndex-xLoc)/wHexMap;
    },

    // Privat
    // Drawing utility
    getAreaPixelX: function(xLocation, yLocation)  {
        var dX = 0;
        if (yLocation % 2 == 1) {
            dX = this.wHex/2;
        }

        return xLocation * this.wHex + dX;
    },

    // Privat
    // Drawing utility
    getAreaPixelY: function (yLocation) {
        return (this.hHex - this.hSqrToHexConner)*yLocation
    },

    // Privat
    // Drawing utility
    drawBitmap: function(xLoc, yLoc, xOffset, yOffset, hexImage, zIndex) {
        var x = getAreaPixelX(xLoc, yLoc) + xOffset + this.xGraphicOffset;
        var y = getAreaPixelY(yLoc) + yOffset + this.yGraphicOffset;

        var theImage = new Image();
        theImage.src = hexImage.src;
        theImage.style.position = "absolute";
        theImage.style.zIndex = ""+zIndex;
        theImage.style.top = ""+y;
        theImage.style.left = ""+x;

        $(this.canvasCSSID).appendChild(theImage);

        return theImage;
    }, 

    // Privat
    // Drawing function which draws the hexes
    drawMap: function() {
        this.hexMapImages = new Array(); // Sets the global variable
        var numOfAreas = getNumberOfAreas(); // Model function
        for (var theAreaIndex = 0; theAreaIndex < numOfAreas; theAreaIndex++) {
            var xLoc = getHexX(theAreaIndex);
            var yLoc = gethexY(theAreaIndex, xLoc);

            var terrainName =getAreaTerrainNameFromIndex(theAreaIndex);
            hexMapImages[theAreaIndex] = drawBitmap(xLoc, yLoc, 0, 0, this.imageHandler.images["terrain_"+terrainName],Z_TERRAIN); // TODO: comment and document name format            
        }
    }
});