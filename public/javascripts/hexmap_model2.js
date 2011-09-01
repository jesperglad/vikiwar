//  ******************************************************************************************************************
//  HexMapModel
//
//
//  ******************************************************************************************************************
var HexMapModel = Class.create({
    initialize: function(theAreas, theUnits, theAreaElements) {
        this.areas = theAreas;
        this.units = theUnits;
        this.areaElements = theAreaElements;
    
    },

    // Former: hex_map_get_hex_x
    getHexX: function(the_index) {
        return the_index%w_hex_map;
    },

    // Former: hex_map_get_hex_y
    getHexY: function(the_index, x_loc) {
        return (the_index-x_loc)/w_hex_map;
    },

    // Public
    getHexsNextToHex: function(the_index) {
        var as = new Array
        var r_w = w_hex_map;
        var r_h  = h_hex_map;
        var x_loc = this.getHexX(the_index);
        var y_loc = this.getHexY(the_index, x_loc);

        if (x_loc > 0) { // West
          as.push(the_index - 1);
        }

        if (x_loc < (r_w-1)) { // East
          as.push(the_index+1);
        }

        if (y_loc%2 == 1) {
          var a = 0;
          
          if  ( (x_loc < (r_w-1))  && (y_loc > 0) ) {
            a = the_index - r_w +1; // Northeast, odd array index
            as.push(a);
           }

          if ( (x_loc >= 0) && (y_loc > 0) )  {
            a = the_index-r_w; // Northwest, odd array ubdex
            as.push(a);
          }

          if  ((x_loc >= 0) && (y_loc < (r_h-1))) {
            a = the_index+r_w; // Southwest, odd array index
            as.push(a);
          }

          if ( (x_loc < (r_w-1)) && (y_loc < (r_h-1)) ) {
            a = the_index+1+r_w; // Southeast, odd array index
            as.push(a);
          }

        } else {
          if  ( (x_loc <= (r_w-1)) && (y_loc > 0) ) {
            a = the_index-r_w; // Northeast, even array index
            as.push(a);
          }

          if ( (x_loc > 0) && (y_loc > 0) ) {
            a = the_index-1-r_w; // Northwest, even array ubdex
            as.push(a);
          }

          if ( (x_loc > 0) && (y_loc < (r_h-1)) ) {
            a = the_index+ r_w-1; // Southwest, even array index
            as.push(a);
          }

          if ( (x_loc <= (r_w-1)) && (y_loc < (r_h-1)) ) {
            a = the_index+r_w; // Southeast, even array index
            as.push(a);
          }
        }

        return as;
     },

     // Privat
    // Former: hex_map_get_hexes_within_range_of_array
    getHexesWithinRangeOfArray: function(hexes, the_old_array_lenght, the_distance, the_unit_type,  the_unit, is_cost_okay_function) {
        var old_length = the_old_array_lenght;

         for (var dist = 1; dist <= the_distance; dist++) {
            var new_length = hexes.length;

            for (var i = old_length; i <  new_length; i++) {
                var hs = this.getHexsNextToHex(hexes[i]);

                for (var j = 0; j < hs.length; j++) {
                    var terrain = this.areas.getAreaTerrainNameFromLocationIndex(hs[j]);
                    if ((terrain != null) && (value_in_array (hs[j], hexes) == false)) {
                        if (is_cost_okay_function(hs[j], the_unit_type, the_unit)) {
                            hexes.push(hs[j]);
                        }
                    }
                }
            }

            old_length = new_length;
        }

        return old_length;
    },

    // Former: hexMap.getHexesWithinPerimeter
    getHexesWithinPerimeter: function (the_index, the_unit_type, the_unit, the_min_distance, the_max_distance, is_cost_okay_function) {
        var hexes = [the_index]; // new Array();

        var old_length = this.getHexesWithinRangeOfArray (hexes, 0, the_min_distance-1, the_unit_type, the_unit, is_cost_okay_function);
        var min_length = hexes.length;

        if ((the_max_distance < 2) || ((the_max_distance - the_min_distance) < 0)) {
            return hexes;
        }

        var max_length = this.getHexesWithinRangeOfArray(hexes, old_length, the_max_distance - (the_min_distance-1), the_unit_type, the_unit, is_cost_okay_function);
        var a_out = hexes.slice(min_length, hexes.length);

        return a_out;
    },

    // Former: hex_map_get_hexes_within_range
    getHexesWithinRange: function(the_index, the_unit_type, the_unit, the_distance, is_cost_okay_funktion) {
        var hexes = [the_index]; // new Array();
        this.getHexesWithinRangeOfArray(hexes, 0, the_distance, the_unit_type, the_unit, is_cost_okay_funktion);

        return hexes;
    },

    // Former: hex_map_get_hexes_within_range_of_unit
    getHexesWithinRangeOfUnit: function(the_index,the_unit) {
        var selected_unit_type = getUnitType(the_unit);
        var the_distance = selected_unit_type.action_points;

        this.getHexesWithinRange (the_index, selected_unit_type, the_unit, the_distance, function() {return true;});
    }
});

//  ******************************************************************************************************************
//  AreaCollection
//
//
//  ******************************************************************************************************************
var AreaCollection = Class.create({
    initialize: function(
        theTerrains,
        theAreas)
    {
        this.terrains = theTerrains;
        this.areas = theAreas;
    },

    // -----------------------------------------------------------------------------------------------------------
    //  Model - Area functions
    // -----------------------------------------------------------------------------------------------------------

    // Public
    deleteAreaAtLocationIndex: function(theLocationIndex) {
        var theHexIndex = this.getAreaArrayIndexFromLocationIndex(theLocationIndex);
        
        for (var i = theHexIndex; i < (this.areas.length-1); i++) {
            this.areas[i] = this.areas[i+1];
        }
        delete this.areas[this.areas.length-1];
        this.areas.length -= 1;
    },
    
    // Public
    getAreaLocationHexIndex: function(theArea) {
        return theArea[1];
    },

    // Public
    getAreaAtArrayIndex: function(theArrayIndex) {
        return this.areas[theArrayIndex];
    },

    // Public
    getNumberOfAreas: function() {
        return $A(this.areas).size();
    },

    // Public
    getAreaTerrainNameFromArrayIndex: function(theArrayIndex) {
        var theArea = this.getAreaAtArrayIndex(theArrayIndex);

        if (theArea) {
            return this.getTerrainNameFromId(
                this.getAreaTerrainId(theArea)
            );
        } else {
            return "non";
        }
    },

    getAreaArrayIndexFromLocationIndex: function(theLocationIndex) {
        var top = this.getNumberOfAreas()-1;
        var bottom = 0;

        // To avoid border effect problem
        var areaTop = this.getAreaAtArrayIndex(top);
        var areaBottom = this.getAreaAtArrayIndex(bottom);
        var locIndexTop = this.getAreaLocationHexIndex(areaTop);
        var locIndexBottom = this.getAreaLocationHexIndex(areaBottom);
        if (theLocationIndex == locIndexBottom) {
            return bottom;
        } else if (theLocationIndex == locIndexTop) {
            return top;
        }
        
        var isAreaAtLocationIndexFound = false;
        var theArrayIndex = (top-top%2)/2;
        while ((isAreaAtLocationIndexFound == false) && (top - bottom > 1)) {
            var area = this.getAreaAtArrayIndex(theArrayIndex);
            var checkLocationIndex = this.getAreaLocationHexIndex(area);
            if (checkLocationIndex == theLocationIndex) {
                isAreaAtLocationIndexFound = true;
            } else if (checkLocationIndex > theLocationIndex) {
                top = theArrayIndex;
            } else if (checkLocationIndex < theLocationIndex) {
                bottom = theArrayIndex;
            }

            theArrayIndex = bottom + ((top - bottom) - (top - bottom)%2)/2;
        }

        if (isAreaAtLocationIndexFound) {
            return theArrayIndex;
        } else {
            return -1;
        }
        
    },

    getAreaFromLocationIndex: function(theLocationIndex) {
        var theArrayIndex = this.getAreaArrayIndexFromLocationIndex(theLocationIndex);
        if (theArrayIndex >= 0) {
            return this.getAreaAtArrayIndex(theArrayIndex);
        } else {
            return null;
        }
        
    },
    
    // Public
    getAreaTerrainNameFromLocationIndex: function(theLocationIndex) {

        var theArea = this.getAreaFromLocationIndex(theLocationIndex)

        if (theArea != null) {
            return this.getTerrainNameFromId(
                this.getAreaTerrainId(theArea)                
            );
        } else {
            return null;
        }
    },

    // Privat
    getAreaTerrainId: function(theArea) {
        return theArea[0];
    },

    setAreaTerrainId: function(theArea, theTerrainId) {
        return theArea[0] = theTerrainId;
    },
    
    // Privat
    getAreaTerrainName: function(theArea) {
        return this.getTerrainNameFromId(getAreaTerrainId(theArea));
    },

    // Privat
    getAreaTerrainNameByArrayIndex: function(theArrayIndex) {
        var theArea = this.getAreaAtIndex(theArrayIndex);
        return this.getAreaTerrainName(theArea);
    },

    areasToString: function () {
        var outputS = "";
        
        $A(this.areas).each(function(a){
            outputS += "["+this.getAreaLocationHexIndex(a)+","+this.getAreaTerrainId(a)+"]";
        });

        return outputS;
    },

    // -----------------------------------------------------------------------------------------------------------
    //  Model - Terrain functions
    // -----------------------------------------------------------------------------------------------------------

    // Privat
    getTerrainNameFromId: function(theTerrainId) {
        return this.terrains[theTerrainId-1].name;
    },
    
    getTerrainIdFromName: function(theTerrainName) {
        var theId = -1;
        $A(this.terrains).each(function(t){
            if (t.name == theTerrainName) {
                theId = t.id;
            }
        });

        return theId;
    },

    getTerrainDescription: function (theTerrainId) {
        return this.terrains[theTerrainId-1].description;
    }
});

//  ******************************************************************************************************************
//  AreaElementCollection
//
//
//  ******************************************************************************************************************
var AreaElementCollection = Class.create({
    initialize: function(
        theAreaElementTypes,
        theAreaElements)
    {
        this.areaElementTypes = theAreaElementTypes;
        this.areaElements = theAreaElements;
    },

    setAreaElements: function(theAreaElements) {
        this.areaElements = theAreaElements;
    },

    // -----------------------------------------------------------------------------------------------------------
    //  Model - AreaElement Type functions
    // -----------------------------------------------------------------------------------------------------------
    getAreaElementTypeName: function(theAreaElementType) {
        return theAreaElementType.name;
    },

    // getAreaElementTypeSightRange: function(theAreaElementType) {
    //    return theAreaElementType.sight_range;
    // },

    // -----------------------------------------------------------------------------------------------------------
    //  Model - Area Element functions
    // -----------------------------------------------------------------------------------------------------------
    // getAreaElementByIndex: function(theAreaElementId) {
    //    return areaElements[theAreaElementId];
    // },

    createAreaElement: function(id, userId, typeId, locHex, name, resourceGain) {
        var theAE = [id, userId, typeId, locHex, name, resourceGain,[]];
        this.areaElements[locHex] = theAE;
    },

    removeAreaElement: function(theAreaElement) {
        delete this.areaElements[this.getAreaElementHexIndex(theAreaElement)];
    },
    
    // Privat
    getAreaElementId: function(theAreaElement) {
        return theAreaElement[0]
    },

    getAreaElementUserId: function (theAreaElement) {
        return theAreaElement[1]
    },

    // Privat
    getAreaElementTypeId: function (theAreaElement) {
        return theAreaElement[2]
    },

    getAreaElementType: function(theAreaElement) {
        return this.areaElementTypes[this.getAreaElementTypeId(theAreaElement) - 1];
    },

    getAreaElementHexIndex: function(theAreaElement) {
        return theAreaElement[3];
    },

    getAreaElementName: function(theAreaElement) {
        return theAreaElement[4];
    },

    getAreaElementResourceGain: function(theAreaElement) {
        return theAreaElement[5];
    },

    getAreaElementModifiedResourceGain: function(theAreaElement) {
        return theAreaElement[5] * (this.getAreaElementLevel(theAreaElement) + 1);
    },

    getAreaElementLevel: function(theAreaElement) {
        return theAreaElement[6];
    },

    getAreaElementNumberOfOrders: function(theAreaElement) {
        var orders = theAreaElement[7];
        if (orders == null) {
            return 0;
        }

        return orders.length/2;
    },

    // Privat
    getAreaElementOrders: function(theAreaElement) {
        return theAreaElement[7];
    },

    getAreaElementOrderTypeByIndex: function(theAreaElement, the_order_index) {
        var orders = this.getAreaElementOrders(theAreaElement);

        return orders[2*the_order_index];
    },

    getAreaElementOrderActionByIndex: function(theAreaElement, theOrderIndex) {
        var orders = this.getAreaElementOrders(theAreaElement);

        return orders[2*theOrderIndex+1];
    },

    addAreaElementOrder: function(theAreaElement, theOrderType, theAction) {
        // Is this firtst order, then we need to create the order arry
        if (theAreaElement[7] == null) {
            theAreaElement[7] = new Array();
        }

        var orders = theAreaElement[7];
        orders.push(theOrderType);
        orders.push(theAction);
    },

    removeAreaElementOrders: function(theAreaElement) {
        theAreaElement[7] = null;
    },

    // Privat
    getAreaElementOrderToString: function(theAreaElement) {
        var s = "area_element,";
        var numOfOrders = hexMap.areaElements.getAreaElementNumberOfOrders(theAreaElement);

        s += this.getAreaElementId(theAreaElement) + ",";
        s += numOfOrders + ",";
        for (var i = 0; i < numOfOrders; i++) {
            s += this.getAreaElementOrderTypeByIndex(theAreaElement, i) + ",";
            s += this.getAreaElementOrderActionByIndex(theAreaElement, i)+",";
        }

        return s;
    },

    doAreaElementHaveOrder: function(theAreaElement) {
        if (theAreaElement[7] != null) {
            return true;
        }else {
            return false;
        }
    },

    getAreaElementUpgradCost: function(theAreaElement) {
        var aeLevel = this.getAreaElementLevel(theAreaElement);

        return (aeLevel + 1)*(aeLevel + 1)*100;
    },

    // -----------------------------------------------------------------------------------------------------------
    //  Model - Area Elements Collection functions
    // -----------------------------------------------------------------------------------------------------------
    getAllAreaElementsAtHexIndex: function(theHexIndex) {
        return this.areaElements[theHexIndex];
    },

    isAreaElementsAtHexIndex: function(theHexIndex) {
        if (this.areaElements[theHexIndex]) {
            return true;
        } else {
            return false;
        }
    },

    getAreaElementsOrderToString: function(theUserId) {
        var s = "";

         // area_elements.each(function(ae) {
         for (var i in this.areaElements) {
            var ae = this.areaElements[i];
            if (theUserId == this.getAreaElementUserId(ae)) {
                s+= this.getAreaElementOrderToString(ae);
            }
        }

        return s;
    },

    getAllAreaElementsOfType: function(theAreaElementType, theUserId) {
        var aeArray = new Array();
        var theAECollection = this;

        var theAreaElements = $H(this.areaElements);
        theAreaElements.each(function(aeh) {
            var aeUserId = theAECollection.getAreaElementUserId(aeh[1]);
            var aeType = theAECollection.getAreaElementType(aeh[1]);
            var aeTypeName = theAECollection.getAreaElementTypeName(aeType);

            if ((aeTypeName == theAreaElementType) && (aeUserId == theUserId)) {
                aeArray.push(aeh[1]);
            }
        });

        return aeArray;
    },

    getAllAreaElementsOrdersOfType: function(theOrderType) {
        var orderArray = new Array();
        var theAECollection = this;

        var theAreaElements = $H(this.areaElements);
        theAreaElements.each(function(aeh) {
            var numOfOrders = theAECollection.getAreaElementNumberOfOrders(aeh[1]);
            for (var i = 0; i < numOfOrders; i++) { 
                if (theOrderType == theAECollection.getAreaElementOrderTypeByIndex(aeh[1],i)) {
                    orderArray.push([theAECollection.getAreaElementId(aeh[1]), theAECollection.getAreaElementOrderActionByIndex(aeh[1],i)]);
                }
            }
        });

        return orderArray;
    },

    areaElementsToString: function () {
        var outputS = "";

        $A(this.areaElements).each(function(ae){
            outputS += "["+this.getAreaElementId(ae)+","+this.getAreaElementUserId(ae)+","+this.getAreaElementTypeId(ae)(ae)+","+this.getAreaElementHexIndex(ae)+","+this.getAreaElementName(ae)+","+this.getAreaElementResourceGain(ae)+"]";
        });

        return outputS;
    }
});

//  ******************************************************************************************************************
//  UnitCollection
//
//
//  ******************************************************************************************************************
var UnitCollection = Class.create({
    // theUnitTypes - array of unit types.
    // Each unit type must be on the form [name, resource_cost, maintenance_cost, attack_range_min, attack_range_max, action_points,[terrains_movement_cost]]
    //
    initialize: function(
        theUnitTypes,
        theUnits)
    {
        this.ID = 0;
        this.USER_ID = 1;
        this.UNIT_TYPE_ID = 2;
        this.HEALT = 3;
        this.LOCATION_HEX_INDEX = 4;
        this.EXPERIENCE = 5;
        this.IN_CARGO_OF = 6;
        this.UNITS_IN_CARGO = 7;
        this.ORDERS = 8;

        this.ORDER_TYPE = 0;
        this.ORDER_FROM_LOCATION_HEX = 1;
        this.ORDER_DEST_LOCATION_HEX = 2;

        this.unitTypes = theUnitTypes;
        this.units = theUnits;
    },

    setUnits: function(theUnits) {
        this.units = theUnits;
    },
    // -----------------------------------------------------------------------------------------------------------
    //  Model - UnitType functions
    // -----------------------------------------------------------------------------------------------------------

    // Public
    getUnitTypeName: function(theUnitType){
        return theUnitType[UnitCollection.UT_ATT.Name];
    },

    // Public
    getUnitTypeResourceCost: function(theUnitType){
        return theUnitType[UnitCollection.UT_ATT.Cost];
    },

    // Public
    getUnitTypeMaintenanceCost: function(theUnitType){
        return theUnitType[UnitCollection.UT_ATT.MaintenanceCost];
    },

    // Privat
    getUnitTypeActionPoints: function(theUnitType) {
        return theUnitType[UnitCollection.UT_ATT.ActionPoints];
    },

    // Privat
    getUnitTypeTerrainMovementPointsCost: function(theUnitType, theTerrainName) {
        var terrainCost = theUnitType[UnitCollection.UT_ATT.MovementPointsCost];
        return terrainCost[theTerrainName]
    },

    // Public
    getUnitTypeMinAttRange: function(theUnitType){
        return theUnitType[UnitCollection.UT_ATT.MinAttRange];
    },

    // Public
    getUnitTypeMaxAttRange: function(theUnitType){
        return theUnitType[UnitCollection.UT_ATT.MaxAttRange];
    },

    getUnitTypeLevel: function(theUnitType) {
        return theUnitType[UnitCollection.UT_ATT.Level];
    },

    getUnitTypePossibleOrders: function(theUnitType) {
        return eval(theUnitType[UnitCollection.UT_ATT.PossibleOrders]);
    },
    
    getUnitTypeIsAllowedToBuild: function(theUnitType) {
        return theUnitType[UnitCollection.UT_ATT.AllowedToBuild];
    },

    getUnitTypeDescription: function(theUnitType) {
        return theUnitType[UnitCollection.UT_ATT.Description];
    },

    getUnitTypeCanBuild: function(theUnitType) {
        return theUnitType[UnitCollection.UT_ATT.CanBuild];
    },

    getUnitTypeCargoSize: function(theUnitType) {
        return theUnitType[UnitCollection.UT_ATT.CargoSize];
    },
    
    canUnitTypeBeBuildByAreaElement: function(theUnitType, theAEName) {
        var aeNames = this.getUnitTypeCanBuild(theUnitType);
        if (aeNames.indexOf(theAEName) == -1) {
            return false;
        } else {
            return true;
        }
    },
    
    getUnitTypeNumOfPossibleOrders: function(theUnitType) {
         var possibleOrdersArray = eval(theUnitType[UnitCollection.UT_ATT.PossibleOrders]);

         return possibleOrdersArray.size();
    },

    // Public
    // Returns an array representing the unit type with the name given by the parameter theUnitTypeString
    // Returns null if the theUnitTypeString is not recornised
    getUnitTypeObjectFromString: function(theUnitTypeString) {
        var retUT = null;
        var unitsCollection = this;

        $A(this.unitTypes).each(function(ut) {
            if (unitsCollection.getUnitTypeName(ut) == theUnitTypeString) {
                retUT = ut;
                throw $break;
            }
        });

        return retUT;
    },

    isUnitTypePossibleOrder: function(theUnitType, theOrderTypeName) {
        var possibleOrdersArray = $A(this.getUnitTypePossibleOrders(theUnitType));
        var orderAllowed = false;
        
        possibleOrdersArray.each(function(aPossibleOrder){
            if (aPossibleOrder == theOrderTypeName) {
                orderAllowed = true;
            }
        });

        return orderAllowed;
    },

    isUnitOrderAllowed: function(theUnit, theOrderTypeName, theAreaElements) {
        var unitType = this.getUnitType(theUnit);
        if (this.isUnitTypePossibleOrder(unitType, theOrderTypeName)) {
            if (theOrderTypeName == "upgrad") {
                var hexLoc = this.getUnitLocationHexIndex(theUnit);
                if (theAreaElements.isAreaElementsAtHexIndex(hexLoc)) {                    
                    return true;
                }
            } else if (theOrderTypeName == "transport") {
                return true;

            } 
        }

        return false;
    },

    canUnitRaidHex: function(theUnit, theDestHex, theAreaElements) {
      var theSelectedUnitType = this.getUnitType(theUnit);
      
      if (this.isUnitTypePossibleOrder(theSelectedUnitType, "raid")) {
        var theAEs = theAreaElements.getAllAreaElementsAtHexIndex(theDestHex);
        
        if ((theAEs != null) && (theAEs.length > 1)) {
            if (this.getUnitUserId(theUnit) != theAreaElements.getAreaElementUserId(theAEs[0])) {
                return true;
            }
        }
      }

      return false;
    },
    
    canUnitEmbak: function(theDestHex, selectedUnitType) {
        var unitsInDestHex = this.getAllUnitsAtHexIndex(theDestHex);
        
        if (unitsInDestHex != null) {
            var unitInDestHex = unitsInDestHex[0];
            var unitTypeInDestHex = this.getUnitType(unitInDestHex);

            if ((this.getUnitTypeCargoSize(unitTypeInDestHex) > 0) && (this.getUnitTypeCargoSize(selectedUnitType) < 1))  {
                return true;
            }
        }

        return false;
    },
    // -----------------------------------------------------------------------------------------------------------
    //  Model - Unit functions
    // -----------------------------------------------------------------------------------------------------------

    addUnit: function(theUnit) {
        this.units[theUnit[this.LOCATION_HEX_INDEX]] = [theUnit];
    },
    
    // Public
    createUnit: function(unitID, unitUserID, unitTypeID, unitHealt, unitLocationHexIndex) {
        var theUnit = [unitID, unitUserID, unitTypeID, unitHealt, unitLocationHexIndex, []];
        this.units[unitLocationHexIndex] = [theUnit];

        return theUnit;
    },

    copyUnit: function(theUnit) {
        var theNewUnit = [theUnit[this.ID], theUnit[this.USER_ID], theUnit[this.UNIT_TYPE_ID], theUnit[this.HEALT], theUnit[this.LOCATION_HEX_INDEX], []];

        return theNewUnit;
    },

    removeUnit: function (theUnit) {
        delete this.units[this.getUnitLocationHexIndex(theUnit)];
    },
    
    // Public
    getUnitId: function(theUnit) {
        return theUnit[this.ID];
    },

    // Public
    // Renamed getUserId -> getUnitUserId
    getUnitUserId: function(theUnit) {
        return theUnit[this.USER_ID];
    },

    // Private
    getUnitTypeId: function(theUnit) {
        return theUnit[this.UNIT_TYPE_ID];
    },

    // Public
    getUnitHealt: function(theUnit) {
        return theUnit[this.HEALT];
    },

    // Public
    getUnitExperience: function(theUnit) {
        return theUnit[this.EXPERIENCE];
    },

    // Public
    setUnitHealt: function(theUnit, theHealt) {
        theUnit[this.HEALT] = theHealt;
    },

    // Public
    getUnitType: function(theUnit) {
        return this.unitTypes[this.getUnitTypeId(theUnit)-1];
    },

    // Public
    getUnitLocationHexIndex: function(theUnit) {
        if (theUnit == null) {
            return null;
        }

        return theUnit[this.LOCATION_HEX_INDEX];
    },

    // Public
    setUnitLocationHexIndex: function(theUnit, theLocationHexIndex) {
        delete this.units[this.getUnitLocationHexIndex(theUnit)];
        theUnit[this.LOCATION_HEX_INDEX] = theLocationHexIndex;

        if (theLocationHexIndex == -1) { // Special case e.g. unit in cargo
            
        } else {
            this.units[this.getUnitLocationHexIndex(theUnit)] = [theUnit];
        }
    },

    // Public
    getUnitNumberOfOrders: function(theUnit) {
        var orders = theUnit[this.ORDERS];
        if (orders == null) {
            return 0;
        }

        return orders.length/3;
    },

    getUnitInCargoOf: function(theUnit) {
        return theUnit[this.IN_CARGO_OF];
    },

    getUnitIDsOfUnitsInCargo: function(theUnit) {
        return theUnit[this.UNITS_IN_CARGO];
    },

    getUnitUnitsInCargo: function(theUnit) {
        var idsOfUnitsInCargo = $A(this.getUnitIDsOfUnitsInCargo(theUnit));
        var unitsInCargo = new Array();
        var theThis = this;
        idsOfUnitsInCargo.each(function(aUnitId){
            unitsInCargo.push(theThis.getUnitWithID(aUnitId));
        });

        return unitsInCargo;
    },
    
    // Privat
    getUnitOrders: function(theUnit) {
        return theUnit[this.ORDERS];
    },

    // Public
    getUnitOrderTypeByIndex: function(theUnit, theOrderIndex) {
        var orders = this.getUnitOrders(theUnit);

        return orders[3*theOrderIndex+this.ORDER_TYPE];
    },

    // Privat
    getUnitOrderFromLocationHexByIndex: function(theUnit, theOrderIndex) {
        var orders = this.getUnitOrders(theUnit);

        return orders[3*theOrderIndex+this.ORDER_FROM_LOCATION_HEX];
    },

    // Public
    getUnitOrderDestLocationHexByIndex: function(theUnit, theOrderIndex) {
        var orders = this.getUnitOrders(theUnit);

        return orders[3*theOrderIndex+this.ORDER_DEST_LOCATION_HEX];
    },

    // Public
    getUnitMovePointsLeft: function(theUnit) {
        var theUnitType = this.getUnitType(theUnit);
        var theTotalAP = this.getUnitTypeActionPoints(theUnitType);
        var numOfOrders = this.getUnitNumberOfOrders(theUnit);
        var orders = this.getUnitOrders(theUnit);

        var usedActionPoints = 0;
        for (var theOrderIndex = 0; theOrderIndex < numOfOrders; theOrderIndex++) {
            var theOrder = this.getUnitOrderTypeByIndex(theUnit, theOrderIndex);
            if ((theOrder == "attack") || (theOrder == "upgrad")){
                return 0;
            }

            var theDestHex = this.getUnitOrderDestLocationHexByIndex(theUnit, theOrderIndex);
            var theTerrainName =  hexMap.areas.getAreaTerrainNameFromLocationIndex(theDestHex);
            usedActionPoints += this.getUnitTypeTerrainMovementPointsCost (theUnitType, theTerrainName);
        }

        return theTotalAP - usedActionPoints;
    },

    // Public
    isUnitPossibleToMove: function(theHex, theUnitType, theUnit) {
        var terrain = hexMap.areas.getAreaTerrainNameFromLocationIndex(theHex);
        var movementCost = hexMap.units.getUnitTypeTerrainMovementPointsCost(theUnitType, terrain);
        var unitMovementPointsLeft = hexMap.units.getUnitMovePointsLeft(theUnit);

        if ((movementCost <= unitMovementPointsLeft) ||
           ((unitMovementPointsLeft > 0) && (hexMap.units.canUnitEmbak(theHex, theUnitType))) )
        // if (movementCost <= unitMovementPointsLeft)
        {
            return true;
        }        
        return false;
    },

    // Public
    getUnitDestHexOfLastOrder: function(theUnit) {
        var numOfOrders = this.getUnitNumberOfOrders(theUnit);

        return this.getUnitOrderDestLocationHexByIndex(theUnit, numOfOrders - 1);
    },

    // Public
    addUnitOrder: function(theUnit, theOrderType, theFromHexIndex, theDestHexIndex) {
        // Is this firtst order, then we need to create the order arry
        if (theUnit[this.ORDERS] == null) {
            theUnit[this.ORDERS] = new Array();
        }

        var orders = theUnit[this.ORDERS];
        orders.push(theOrderType);
        orders.push(theFromHexIndex);
        orders.push(theDestHexIndex);
    },

    // Public
    removeUnitOrders: function(theUnit) {
        theUnit[this.ORDERS] = null;
    },

    // Privat
    getUnitOrderToString: function(theUnit) {
        var s = "unit,";
        var numOfOrders = this.getUnitNumberOfOrders(theUnit);

        s += this.getUnitId(theUnit) + ",";
        s += numOfOrders + ",";
        for (var i = 0; i < numOfOrders; i++) {
            s += this.getUnitOrderTypeByIndex(theUnit, i) + ",";
            s += this.getUnitOrderFromLocationHexByIndex(theUnit, i)+",";
            s += this.getUnitOrderDestLocationHexByIndex(theUnit, i)+",";
        }

        return s;
    },

    // Public
    doUnitHaveOrder: function(theUnit) {
        if (theUnit[this.ORDERS] != null) {
            return true;
        } else {
            return false;
        }
    },

    // -----------------------------------------------------------------------------------------------------------
    //  Model - Units Collection functions
    // -----------------------------------------------------------------------------------------------------------

    // Public
    getNumOfUnits: function() {
        return this.units.length;
    },

    // Public
    getUnitsOrderToString: function(theUserId) {
        var s = "";
        var theThis = this;

       for (var i in this.units) {
            var theUnitsInHex = this.units[i];
            
            theUnitsInHex.each(function(theUnit) {
                if (theUserId == theThis.getUnitUserId(theUnit)) {
                    s+= theThis.getUnitOrderToString(theUnit);
                }
            });
       }

       return s;
    },

    // Public
    getAllUnitsAtHexIndex: function(theIndex) {
        return this.units[theIndex];
    },

    // Public
    isUnitsInHex: function(theHexIndex) {
        if (this.units[theHexIndex])
            return true;
        else
            return false;
    },

    // TODO: Can be optimized no reason to run though the hole of the area
    doUnitWithIDExists: function(theId) {
        var retValue = false;
        var theThis = this;
        $H(this.units).each(function(pari){
            var value = pari.value;
            var u = value[0];
            if (theThis.getUnitId(u) == theId) {
                retValue = true;                
            }
        });

        return retValue;
    },

    // TODO: Can be optimized no reason to run though the hole of the area
    getUnitWithID: function(theId) {
        var retUnit = null;
        var theThis = this;
        $H(this.units).each(function(pari){
            var value = pari.value;
            for (var i = 0; i < value.length; i++) {
            	var u = value[i];
            	if (theThis.getUnitId(u) == theId) {
                	retUnit = u;
            	}
            }
        });

        return retUnit;
    },

    unitsToString: function () {
        var outputS = "";

        $A(this.units).each(function(u){
            outputS += "["+this.getUnitId(u)+","+this.getUnitUserId(u)+","+this.getUnitTypeId(u)+","+this.getUnitHealt(u)+","+this.getUnitLocationHexIndex(u)+"]";
        });

        return outputS;
    }

});

UnitCollection.UT_ATT = {
    "Name": 0,
    "Cost": 1,
    "MaintenanceCost": 2,
    "MinAttRange": 3,
    "MaxAttRange": 4,
    "ActionPoints": 5,
    "MovementPointsCost": 6,
    "Level": 7,
    "PossibleOrders": 8,
    "AllowedToBuild": 9,
    "Description": 10,
    "CanBuild": 11,
    "CargoSize": 12
};

