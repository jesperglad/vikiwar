//  ******************************************************************************************************************
//  BattleReport
//
//
//  ******************************************************************************************************************
var BattleReportModel = Class.create({
    initialize: function(theHexMapModel) {
        this.hexMapModel = theHexMapModel;

        this.view = null;

        this.orderQuery = null;
        this.allSemiAndVisibleHexes = null;
        
        // All visible units at the end of this turn, including units in visible
        // semi visible hexes, as well as units hiden but included in an order with
        // partly visible hexes.
        this.allVisibleUnits = null;
        
        this.allVisibleAreaElements = null;
        this.currentTurnGameData = null;
        this.historyGameData = null;

        this.currentStep = 0;
     },

    atTheEndOfOrderList: function() {        
        if (this.orderQuery){
            return (this.currentStep == this.orderQuery.length);
        } else {
            return false;
        }        
    },
    
    orderFailedCallBack: function (theOrderStep) {
        this.view.clear(theOrderStep);
        pbrcb.callBackOrderDone();
    }, 

    moveCallBack: function(theOrderStep, theOrderJSON, theUnit) {
        this.view.hexMapView.removeUnit(theUnit); 
        this.hexMapModel.units.setUnitLocationHexIndex(theUnit, theOrderJSON.dest_hex_index);

        // Is the new hex visible or semivisible and is the unit not embaking then draw the unit again
        if ((this.allSemiAndVisibleHexes != null) &&
            ((this.allSemiAndVisibleHexes.indexOf(theOrderJSON.dest_hex_index) != -1)) &&
            (theOrderJSON.action != "embak"))
        {
            this.view.hexMapView.drawUnit(this.hexMapModel.units, theUnit, this.view.hexMapView.Z_RED_OPACITY_LAYER);
        }

        this.view.clear(theOrderStep);
        pbrcb.callBackOrderDone();
    },

    // Privat
    moveOrderResult: function(theOrderJSON, theUnit, doUnitExists, doUnitStayInView) {
        var oldLocationHex = 0;
        // if (doUnitExists) {
        //    oldLocationHex = this.hexMapModel.units.getUnitLocationHexIndex(theUnit);
        // } else {
            oldLocationHex = theOrderJSON.from_hex_index;
        // }

        this.view.drawFromAndDestHexBattleReportSingleStep(oldLocationHex, theOrderJSON.dest_hex_index, theOrderJSON.hist_succeded);

        if (theOrderJSON.hist_succeded) {            
            this.view.animateMoveUnit(theUnit, theOrderJSON, doUnitExists, doUnitStayInView);
        } else {
            this.view.animateOrderFailed(this.currentStep, theUnit);
        }

    },

    buildOrderCallBack: function(theOrderStep, theUnit) {
        this.view.hexMapView.drawUnit(this.hexMapModel.units, theUnit, this.view.hexMapView.Z_UNIT+this.view.hexMapView.Z_RED_OPACITY_LAYER);
        this.view.clear(theOrderStep);
        pbrcb.callBackOrderDone();
    },
    
    buildOrderResult: function(theOrderJSON) {
        var theUnit = this.hexMapModel.units.createUnit(0, theOrderJSON.hist_user_id, theOrderJSON.hist_unit_type_id, 9, theOrderJSON.hist_from_hex_index)
        
        this.view.animateBuildUnit(theOrderJSON, theUnit);
    },
    
    healOrderCallBack: function(theOrderStep, theOrderJSON, theUnit) {
        theOrderJSON = this.orderQuery[theOrderStep-1];
        this.hexMapModel.units.setUnitHealt(theUnit, theOrderJSON.hist_my_start_healt + theOrderJSON.hist_my_looses ); 
        this.view.hexMapView.drawUnit(this.hexMapModel.units, theUnit, this.view.hexMapView.Z_RED_OPACITY_LAYER);
        this.view.clear(theOrderStep);
        pbrcb.callBackOrderDone();
    },

    raidOrderCallBack: function(theOrderStep, theOrderJSON, theUnit) {
        this.view.clear(theOrderStep);
        pbrcb.callBackOrderDone();
    },

    healOrderResult: function(theOrderJSON, theUnit) {                
        this.view.animateHealUnit(theOrderJSON, theUnit, this.currentStep);
    },

    getBattleReportUnit: function(theUnitId) {        
        var theUnit = this.hexMapModel.units.getUnitWithID(theUnitId);

        // Did we find the unit, meaning it is in "units", the collection
        // of units visible at the end of last turn
        if (theUnit != null) {
            return theUnit;
        } else {
            theUnit = this.allVisibleUnits.getUnitWithID(theUnitId);

            if (theUnit != null) {
                return theUnit;
            } else {
                console.log("Error: Battlereport 0001 - Not able to find unit with requested id.");
            }
        }

        return null;       
    },

    attackAreaElementOrderCallBack: function(theOrderStep, theOrderJSON, theUnit, theAreaElement) {
        var myHealt = theOrderJSON.hist_my_start_healt;
        theAreaElement[1] = null; // The user id is set to null, as the attack have made the AreaElement neutral.
        if ((myHealt > 0) && ((this.allSemiAndVisibleHexes.indexOf(theOrderJSON.from_hex_index) != -1))) {
            this.hexMapModel.units.setUnitHealt(theUnit, myHealt );
            this.view.hexMapView.drawUnit(this.hexMapModel.units, theUnit, this.view.hexMapView.Z_RED_OPACITY_LAYER);
        } else {
            this.hexMapModel.units.removeUnit(theUnit);
        }

        if ((this.allSemiAndVisibleHexes.indexOf(theOrderJSON.dest_hex_index) != -1)) {
            this.view.hexMapView.drawAreaElement(this.hexMapModel.areaElements, theAreaElement, this.view.hexMapView.Z_AREA_ELEMENT+this.view.hexMapView.Z_RED_OPACITY_LAYER);

        } else {
            this.hexMapModel.areaElements.removeArea(theAreaElement);
        }

        this.view.clear(theOrderStep);
        pbrcb.callBackOrderDone();
    },
    
    attackOrderCallBack: function(theOrderStep, theOrderJSON, theUnit, theOtherUnit) {
        var myHealt = theOrderJSON.hist_my_start_healt - theOrderJSON.hist_my_looses;
        var otherHealt = theOrderJSON.hist_other_unit_start_healt - theOrderJSON.hist_other_unit_looses;

        if ((myHealt > 0) && ((this.allSemiAndVisibleHexes.indexOf(theOrderJSON.from_hex_index) != -1))) {
            this.hexMapModel.units.setUnitHealt(theUnit, myHealt );
            this.view.hexMapView.drawUnit(this.hexMapModel.units, theUnit, this.view.hexMapView.Z_RED_OPACITY_LAYER);
        }

        if ((otherHealt > 0) && ((this.allSemiAndVisibleHexes.indexOf(theOrderJSON.dest_hex_index) != -1))) {
            this.hexMapModel.units.setUnitHealt(theOtherUnit, otherHealt );
            this.view.hexMapView.drawUnit(this.hexMapModel.units, theOtherUnit, this.view.hexMapView.Z_RED_OPACITY_LAYER);
        }

        this.view.clear(theOrderStep);
        pbrcb.callBackOrderDone();
    },

    // Privat
    attackOrderResult: function(theOrderJSON, theUnit, theOtherEle, isOtherEleUnit) {
        if (isOtherEleUnit) {
            this.view.animateAttackUnit(theOrderJSON, theUnit, theOtherEle, this.currentStep);
        } else {
            this.view.animateAttackAreaElement(theOrderJSON, theUnit, theOtherEle, this.currentStep);
        }
    },

    // Privat
    attack: function(theOrderJSON, theUnit) {
        var theOtherElementsInHex = null;
        var isOtherEleUnit = false;

        if (theOrderJSON.hist_other_unit_id > 0) { // Are we attacking a unit
            theOtherElementsInHex = this.getBattleReportUnit(theOrderJSON.hist_other_unit_id);
            isOtherEleUnit = true;
         } else if (theOrderJSON.hist_other_area_element_id > 0) { // Are we attacking an area_element
            if (this.view.hexMapView.visibleHexs.indexOf(theOrderJSON.dest_hex_index) == -1) { // Is the area element in a visible hex
                theOtherElementsInHex = this.allVisibleAreaElements.getAllAreaElementsAtHexIndex(theOrderJSON.dest_hex_index);
            } else {
                theOtherElementsInHex = this.hexMapModel.areaElements.getAllAreaElementsAtHexIndex(theOrderJSON.dest_hex_index);
            }
        } else {
            return; // if it is not an unit or AreaElement, then we have no clue, lets return
        }

        this.attackOrderResult(theOrderJSON, theUnit, theOtherElementsInHex, isOtherEleUnit);
    },

    raid: function (theOrderJSON, theUnit) {
        this.view.animateRaid(theOrderJSON, theUnit, this.currentStep);
    },

    goToStart: function() {
        this.view.clear();
        
        this.currentStep = 0;

        this.view.goToStart();
    },
    
    forwardOneStep: function() {
        this.view.clear();

        this.currentStep += 1;

        if (this.orderQuery == null) {
            return;
        }

        var theOrderJSON = this.orderQuery[this.currentStep-1];
        var theUnit = $A(this.getBattleReportUnit(theOrderJSON.unit_id)).clone();

        if (theOrderJSON == null) {
            return;

        } else if (theOrderJSON.order_type == "move") {
            // Is the order from_hex_index NOT among the visible hexes
            if (this.view.hexMapView.visibleHexs.indexOf(theOrderJSON.from_hex_index) == -1) {
                this.moveOrderResult(theOrderJSON, theUnit, false, true);

            // Is the order dest_hex_index NOT among the visible hexes
            } else if (this.view.hexMapView.visibleHexs.indexOf(theOrderJSON.dest_hex_index) == -1) {
                // is the unit in a non-visible state, e.g. in the cargo
                if (this.hexMapModel.units.getUnitLocationHexIndex(theUnit) == -1) {
                    this.moveOrderResult(theOrderJSON, theUnit, false, false);
                } else {
                    this.moveOrderResult(theOrderJSON, theUnit, true, false);
                }
            } else {
                // is the unit in a non-visible state, e.g. in the cargo
                if (this.hexMapModel.units.getUnitLocationHexIndex(theUnit) == -1) {
                    this.moveOrderResult(theOrderJSON, theUnit, false, true);
                } else {
                    this.moveOrderResult(theOrderJSON, theUnit, true, true);
                }
            }

        } else if (theOrderJSON.order_type == "attack") {            
            this.attack(theOrderJSON, theUnit);
        } else if (theOrderJSON.order_type == "heal") {
            // var theUnitsInHex = this.hexMapModel.units.getAllUnitsAtHexIndex(theOrderJSON.from_hex_index);
            var theUnitsInHex = this.allVisibleUnits.getAllUnitsAtHexIndex(theOrderJSON.from_hex_index);
            theUnit = [];
            theUnit = $A(theUnitsInHex[0]).clone();
            

            if (theUnit) {
                this.healOrderResult(theOrderJSON, theUnit);
            }
        } else if (theOrderJSON.order_type == "build") {
            theUnit = this.buildOrderResult(theOrderJSON);

            if (theUnit) {
                this.hexMapView.drawUnit(theUnit, hexMapView.Z_RED_OPACITY_LAYER);
            }
        } else if (theOrderJSON.order_type == "raid") {
            this.raid(theOrderJSON, theUnit);
        }

    }
});

var BattleReportView = Class.create({
    initialize: function(theModel, theHexMapView) {
        this.hexMapView = theHexMapView;
        this.model = theModel;
    },
    
    clear: function(theStep) {
        // this.hexMapView.removeBattleReportImages();
        this.hexMapView.removeBitmapType("battlereport"+theStep);
    },

    clearAll: function() {
        // this.hexMapView.removeBattleReportImages();
        for (var i = 0; i <= this.model.currentStep; i++) {
            this.clear(i);
        }
        this.hexMapView.removeBitmapType("battlereport_stay");
    },

    doUnitHaveBuildOrder:function(unitId) {
        var retValue = false;

        this.model.orderQuery.each(function(o){
            if ((o.unit_id) && (o.unit_id == unitId) && (o.order_type == "build")) {
                retValue = true;
            }
        });
        return retValue;
    },

    doUnitHaveOrder: function(unitId) {
        var retValue = false;

        this.model.orderQuery.each(function(o){            
            if ((o.unit_id) && (o.unit_id == unitId)) {
                retValue = true;
            }
        });
        return retValue;
    },

    getFirstOrderStartingFromHex: function(theHexIndex) {
        var theRetOrder = null;
        
        // Used for keeping track on if the first order has been executed, to
        // avoid we place a unit where the second order starts.
        var unitsWithExeOrders = new Array();

        $A(this.model.orderQuery).each(function(theOrderJSON){

            // Is this the first order the record it, else go to next loop
            if (unitsWithExeOrders[theOrderJSON.unit_id] == null) {
                unitsWithExeOrders[theOrderJSON.unit_id] = theOrderJSON.unit_id

                // Is the order starting from the hex
                if (theOrderJSON.from_hex_index == theHexIndex) {
                    theRetOrder = theOrderJSON;
                    throw $break;
                }
            }            
        });
        
        return theRetOrder;
    },

    copyUnitFromAllVisibleUnits2Units: function (theUnit, theOrderJSON) {
        var theNewUnit = this.model.hexMapModel.units.copyUnit(theUnit);
        this.model.hexMapModel.units.addUnit(theNewUnit);

        if (theOrderJSON != null) {
            this.model.hexMapModel.units.setUnitLocationHexIndex(theNewUnit, theOrderJSON.from_hex_index);
        }
        
        this.hexMapView.drawUnit(
            this.model.hexMapModel.units,
            theNewUnit,
            this.hexMapView.Z_RED_OPACITY_LAYER);

    },
    
    addUnitsInVisibleHexesBasedOnOrdersFromHex: function() {
        var theThis = this;

        $A(this.hexMapView.visibleHexs).each(function(hexIndex) {
            // var unitsAtHex = theThis.model.allVisibleUnits.getAllUnitsAtHexIndex(hexIndex);
            var theOrderJSON = theThis.getFirstOrderStartingFromHex(hexIndex);

            // Old version ... the check on theOrderJSON.hist_succeded was removed as
            // units which did not succed but still has a from-hex which is visible, should
            // be shown
            // if ((theOrderJSON != null) && (theOrderJSON.hist_succeded)) {
            if (theOrderJSON != null) {
                    var theUnit = theThis.model.allVisibleUnits.getUnitWithID(theOrderJSON.unit_id);
                    if ((!theThis.model.hexMapModel.units.doUnitWithIDExists(theOrderJSON.unit_id)) && (!theThis.doUnitHaveBuildOrder(theOrderJSON.unit_id))) {
                        theThis.copyUnitFromAllVisibleUnits2Units(theUnit,theOrderJSON);
                    }             
            }

            // Add unit without orders
            var unitsAtHex = theThis.model.allVisibleUnits.getAllUnitsAtHexIndex(hexIndex);
            if (unitsAtHex) {
                var theUnit = unitsAtHex[0];
                var theUnitId = theThis.model.allVisibleUnits.getUnitId(theUnit);
                if ((!theThis.model.hexMapModel.units.doUnitWithIDExists(theUnitId)) && (!theThis.doUnitHaveOrder(theUnitId))) {
                    theThis.copyUnitFromAllVisibleUnits2Units(theUnit,null);
                }
            }
            
        });
    },

    addUnitWithoutOrders: function() {
        var theThis = this;

        $A(this.hexMapView.visibleHexs).each(function(hexIndex) {
            var unitsAtHex = theThis.model.allVisibleUnits.getAllUnitsAtHexIndex(hexIndex);
            if (unitsAtHex) {
                var theUnit = unitsAtHex[0];
                var theUnitId = theThis.model.allVisibleUnits.getUnitId(theUnit);
                if ((!theThis.model.hexMapModel.units.doUnitWithIDExists(theUnitId)) && (!theThis.doUnitHaveOrder(theUnitId))) {
                // if (!theThis.model.hexMapModel.units.doUnitWithIDExists(theUnitId))  {
                    var theHex = theThis.model.allVisibleUnits.getUnitLocationHexIndex(theUnit);
                    var imageName = "unit_"+theThis.model.allVisibleUnits.getUnitTypeName(theThis.model.allVisibleUnits.getUnitType(theUnit))+"_"+theThis.hexMapView.userColors[""+theThis.model.allVisibleUnits.getUnitUserId(theUnit)];
                    var xHex = theThis.model.hexMapModel.getHexX(theHex);
                    var yHex = theThis.model.hexMapModel.getHexY(theHex, xHex);
                    var theUnitImage = theThis.hexMapView.addBitmap("battlereport_stay", theHex, xHex, yHex, 0, 0, theThis.hexMapView.imageHandler.images[imageName], theThis.hexMapView.Z_UNIT+theThis.hexMapView.Z_RED_OPACITY_LAYER);
                    var healtImageName = theThis.hexMapView.healtImageName(theThis.model.allVisibleUnits.getUnitHealt(theUnit));
                    var theHealtImage = theThis.hexMapView.addBitmap("battlereport_stay", 1000 + theHex, xHex, yHex, 0, 0, theThis.hexMapView.imageHandler.images[healtImageName], theThis.hexMapView.Z_HEALT+theThis.hexMapView.Z_RED_OPACITY_LAYER);

                }
            }
        });
    },
    
    goToStart: function() {
        this.hexMapView.removeBitmapType("battlereport_stay");

        this.hexMapView.setVisibleHexs(eval(this.model.currentTurnGameData[2]));
        this.hexMapView.setSemiVisibleHexs(eval(this.model.historyGameData[2]));
        this.hexMapView.update(this.model.allVisibleAreaElements, null);
        this.hexMapView.showSemilightedHexes();
        this.hexMapView.showHighlightedHexes();
        this.addUnitsInVisibleHexesBasedOnOrdersFromHex();

        this.model.allSemiAndVisibleHexes = new Array(this.hexMapView.semiVisibleHexs);
        this.model.allSemiAndVisibleHexes = this.model.allSemiAndVisibleHexes.flatten();
        this.model.allSemiAndVisibleHexes = this.model.allSemiAndVisibleHexes.concat(this.hexMapView.visibleHexs)
        this.model.allSemiAndVisibleHexes = this.model.allSemiAndVisibleHexes.uniq();
        
    },

    drawFromAndDestHexBattleReportSingleStep: function(theFromHex, theDestHex, isSucceded) {
        var fromImageName = "unit_indi_selected";
        var destImageName = null;
        if (isSucceded) {
            destImageName = "unit_indi_move";
        } else {
            destImageName = "unit_indi_notmove";
        }

        var xHexFrom = this.hexMapView.hexMapModel.getHexX(theFromHex);
        var yHexFrom = this.model.hexMapModel.getHexY(theFromHex, xHexFrom);
        // this.fromImageBattleReport = this.hexMapView.drawBitmap(xHexFrom, yHexFrom, 0, 0, this.hexMapView.imageHandler.images[fromImageName], this.hexMapView.Z_POSSIBLE_ORDER+this.hexMapView.Z_RED_OPACITY_LAYER);
        this.hexMapView.addBitmap("battlereport"+this.model.currentStep, 10000, xHexFrom, yHexFrom, 0, 0, this.hexMapView.imageHandler.images[fromImageName], this.hexMapView.Z_POSSIBLE_ORDER+this.hexMapView.Z_RED_OPACITY_LAYER);

        var xHexDest = this.model.hexMapModel.getHexX(theDestHex);
        var yHexDest = this.model.hexMapModel.getHexY(theDestHex, xHexDest);
        // this.destImageBattleReport = this.hexMapView.drawBitmap(xHexDest, yHexDest, 0, 0, this.hexMapView.imageHandler.images[destImageName], this.hexMapView.Z_POSSIBLE_ORDER+this.hexMapView.Z_RED_OPACITY_LAYER);
        this.hexMapView.addBitmap("battlereport"+this.model.currentStep, 10001, xHexDest, yHexDest, 0, 0, this.hexMapView.imageHandler.images[destImageName], this.hexMapView.Z_POSSIBLE_ORDER+this.hexMapView.Z_RED_OPACITY_LAYER);
    },

    // hideHealtImage: function() {
    //     $(this.aHealtImage).hide();
    // },

    // hideUnitImage: function() {
    //    $(this.aUnitImage).hide();
    // },

    overlayHealt: function (hex, xHex, yHex, healt) {
        var theOrderStep = this.model.currentStep;
        
        var theHealtImage = this.hexMapView.healtImages[hex];
        if (theHealtImage) {
            $(theHealtImage).hide();
        }
                
        var newHealtImageName = this.hexMapView.healtImageName(healt);
        return this.hexMapView.addBitmap("battlereport"+this.model.currentStep, 2000 + hex, xHex, yHex, 0, 0, this.hexMapView.imageHandler.images[newHealtImageName], this.hexMapView.Z_HEALT+this.hexMapView.Z_RED_OPACITY_LAYER+1);
    },

    overlayUnit: function (theUnit, hex, healt, doHide) {
        var xHex = this.model.hexMapModel.getHexX(hex);
        var yHex = this.model.hexMapModel.getHexY(hex, xHex);       
        var imageName = "unit_"+this.model.hexMapModel.units.getUnitTypeName(this.model.hexMapModel.units.getUnitType(theUnit))+"_"+this.hexMapView.userColors[""+this.model.hexMapModel.units.getUnitUserId(theUnit)];
        var unitImage = this.hexMapView.addBitmap("battlereport"+this.model.currentStep, hex, xHex, yHex, 0, 0, this.hexMapView.imageHandler.images[imageName], this.hexMapView.Z_UNIT+this.hexMapView.Z_RED_OPACITY_LAYER+1);
        var healtImage = this.overlayHealt(hex, xHex, yHex, healt);

        if (doHide) {
            $(unitImage).hide();
            $(healtImage).hide();
        }

        return [unitImage, healtImage];
    },

    overlayAreaElement: function (theAreaElement, hex) {
        var xHex = this.model.hexMapModel.getHexX(hex);
        var yHex = this.model.hexMapModel.getHexY(hex, xHex);
        var theAreaElementType = this.model.hexMapModel.areaElements.getAreaElementType(theAreaElement);

        var aeUserId = this.model.hexMapModel.areaElements.getAreaElementUserId(theAreaElement);
        var imageName = "";
        if (aeUserId != null) {
            imageName = "area_element_"+this.model.hexMapModel.areaElements.getAreaElementTypeName(theAreaElementType)+"_"+this.hexMapView.userColors[""+aeUserId];
        } else {
            imageName = "area_element_"+this.model.hexMapModel.areaElements.getAreaElementTypeName(theAreaElementType)+"_empty";
        }
         
        // var imageName = "area_element_"+this.model.hexMapModel.areaElements.getAreaElementTypeName(theAreaElementType)+"_empty";
        return this.hexMapView.addBitmap("battlereport"+this.model.currentStep, hex, xHex, yHex, 0, 0, this.hexMapView.imageHandler.images[imageName], this.hexMapView.Z_AREA_ELEMENT+this.hexMapView.Z_RED_OPACITY_LAYER+1);
    },

    overlayAttackOrder: function (fromHex, destHex, theOrderStep) {
        var xFromHex = this.model.hexMapModel.getHexX(fromHex);
        var yFromHex = this.model.hexMapModel.getHexY(fromHex, xFromHex);
        var xDestHex = this.model.hexMapModel.getHexX(destHex);
        var yDestHex = this.model.hexMapModel.getHexY(destHex, xDestHex);

        var xDestPixel = this.hexMapView.getAreaPixelX(xDestHex, yDestHex)
        var yDestPixel = this.hexMapView.getAreaPixelY(yDestHex)
        var xFromPixel = this.hexMapView.getAreaPixelX(xFromHex, yFromHex)
        var yFromPixel = this.hexMapView.getAreaPixelY(yFromHex)

        var theOrderDirection = this.hexMapView.orderDirection(xFromPixel, yFromPixel, xDestPixel, yDestPixel);
        return this.hexMapView.addBitmap("battlereport"+theOrderStep, 3000+destHex, xDestHex, yDestHex, 0, 0, this.hexMapView.imageHandler.images["order_attack"+theOrderDirection], this.hexMapView.Z_ORDER+this.hexMapView.Z_RED_OPACITY_LAYER);
    },

    addHealtValue: function (hex, dHealt, isUp) {
        var directionHealt = "Down"
        if (isUp) {
            directionHealt = "Up"
        }
        return this.addText(hex, dHealt, "healt"+directionHealt)
    },

    addRaidValue: function(hex, dMoney, isUp) {
        if (isUp) {
            return this.addText(hex, "+"+dMoney, "raidUp")
        } else {
            return this.addText(hex, "-"+dMoney, "raidDown")
        }        
    },

    addText: function(hex, theValue, aCSSID) {
        var xHex = this.model.hexMapModel.getHexX(hex);
        var yHex = this.model.hexMapModel.getHexY(hex, xHex);

        var x = this.hexMapView.getAreaPixelX(xHex, yHex) + 10 + this.hexMapView.xGlobalOffset;
        var y = this.hexMapView.getAreaPixelY(yHex) - 10 + this.hexMapView.yGlobalOffset;
        var theDiv = document.createElement("div");

        $(theDiv).update("<div id='"+aCSSID+"' style='position: absolute; top: "+y+"; left: "+x+"; z-index: "+(this.hexMapView.Z_ORDER+this.hexMapView.Z_RED_OPACITY_LAYER)+";'>"+theValue+"</div>")
        $(this.hexMapView.cssMainId).appendChild(theDiv);

        return theDiv;
    },
    
    // stopAnimateAttackUnit: function() {
    //    $(fromHealtElement).remove();
    //    $(destHealtElement).remove();
    //    $(theOrderImage).remove();
    //
    // },

    animateOrderFailed: function(theOrderStep, theUnit) {
        var theUnitHexIndex = this.model.hexMapModel.units.getUnitLocationHexIndex(theUnit);
        var theUnitImage = this.hexMapView.unitImages[theUnitHexIndex];
        var theHealtImage = this.hexMapView.healtImages[theUnitHexIndex];

        

        var theThis = this;
        new Effect.Parallel([
                new Effect.Shake(theUnitImage, {distance: 5}),
                new Effect.Shake(theHealtImage, {distance: 3 })
            ],{duration: 0.5, afterFinish: function(){theThis.model.orderFailedCallBack(theOrderStep);}}
        );

        
        // new Effect.Shake(theUnitImage, {sync: true, distance: 5});
        // new Effect.Shake(theHealtImage, {
        //    sync: true, distance: 3,
        //    afterFinish: function() { theThis.model.orderFailedCallBack(theOrderStep) }
        // });
        
    },
    
    animateMoveUnit: function(theUnit, theOrderJSON, doUnitExists, doUnitStayInView) {
        var theOrderStep = this.model.currentStep;
        var xHex = this.model.hexMapModel.getHexX(theOrderJSON.dest_hex_index);
        var yHex = this.model.hexMapModel.getHexY(theOrderJSON.dest_hex_index, xHex);
        var x = this.hexMapView.getAreaPixelX(xHex, yHex) + this.hexMapView.xGlobalOffset;
        var y = this.hexMapView.getAreaPixelY(yHex) + this.hexMapView.yGlobalOffset;
        // var motherNode = $(this.hexMapView.cssMainId);
        // var theUnitIndex = this.hexMapModel.units.getUnitId(theUnit);
        var theUnitHexIndex = theOrderJSON.from_hex_index;
        // if (doUnitExists) {
        //    theUnitHexIndex = this.model.hexMapModel.units.getUnitLocationHexIndex(theUnit);
        // } else {
        //    theUnitHexIndex = this.model.allVisibleUnits.getUnitLocationHexIndex(theUnit);
        // }        

        var theUnitImage = null;
        var theHealtImage = null;

        if (doUnitExists) {
            theUnitImage = this.hexMapView.unitImages[theUnitHexIndex];
            theHealtImage = this.hexMapView.healtImages[theUnitHexIndex];
        } else {
            var imageName = "unit_"+this.model.allVisibleUnits.getUnitTypeName(this.model.allVisibleUnits.getUnitType(theUnit))+"_"+this.hexMapView.userColors[""+this.model.allVisibleUnits.getUnitUserId(theUnit)];
            var xHexFrom = this.model.hexMapModel.getHexX(theOrderJSON.from_hex_index);
            var yHexFrom = this.model.hexMapModel.getHexY(theOrderJSON.from_hex_index, xHexFrom);
            theUnitImage = this.hexMapView.addBitmap("battlereport"+this.model.currentStep, theOrderJSON.dest_hex_index, xHexFrom, yHexFrom, 0, 0, this.hexMapView.imageHandler.images[imageName], this.hexMapView.Z_UNIT+this.hexMapView.Z_RED_OPACITY_LAYER);
            var healtImageName = this.hexMapView.healtImageName(this.model.allVisibleUnits.getUnitHealt(theUnit));
            theHealtImage = this.hexMapView.addBitmap("battlereport"+this.model.currentStep, 1000 + theOrderJSON.dest_hex_index, xHex, yHex, 0, 0, this.hexMapView.imageHandler.images[healtImageName], this.hexMapView.Z_HEALT+this.hexMapView.Z_RED_OPACITY_LAYER);
        }

        // this.aUnitImage = theUnitImage;
        // this.aHealtImage = theHealtImage;
        var theThis = this;

        if ((theUnitImage) && (theHealtImage)) {
            if (!doUnitExists) {
                new Effect.Parallel([
                    new Effect.Opacity(theUnitImage, {sync: true, from:0.0, to: 1.0}),
                    new Effect.Opacity(theHealtImage, {sync: true, from:0.0, to: 1.0}),
                    new Effect.Move (theUnitImage, {sync: true, x: x, y: y, mode: 'absolute'}),
                    new Effect.Move (theHealtImage, {sync: true, x: x, y: y, mode: 'absolute', afterFinish: function() {theThis.model.moveCallBack(theOrderStep, theOrderJSON, theUnit);} })],
                    {duration: 0.5}
                 );
            } else if (!doUnitStayInView) {
                new Effect.Parallel([
                    new Effect.Opacity(theUnitImage, {sync: true, from: 1.0, to: 0.0}),
                    new Effect.Opacity(theHealtImage, {sync: true, from:1.0, to: 0.0}),
                    new Effect.Move (theUnitImage, {sync: true, x: x, y: y, mode: 'absolute'}),
                    new Effect.Move (theHealtImage, {sync: true, x: x, y: y, mode: 'absolute', afterFinish: function() {theThis.model.moveCallBack(theOrderStep, theOrderJSON, theUnit);} })],
                    {duration: 0.5}
                );
            } else {
                new Effect.Parallel([
                    new Effect.Move (theUnitImage, {sync: true, x: x, y: y, mode: 'absolute'}),
                    new Effect.Move (theHealtImage, {sync: true, x: x, y: y, mode: 'absolute', afterFinish: function() {theThis.model.moveCallBack(theOrderStep, theOrderJSON, theUnit);}})],
                    {duration: 0.5}
                );
            }
        }
    },

    animateAttackAreaElement: function (theOrderJSON, theUnit, theAreaElement) {
        var theOrderStep = this.model.currentStep;
        
        this.drawFromAndDestHexBattleReportSingleStep(theOrderJSON.from_hex_index, theOrderJSON.dest_hex_index, theOrderJSON.hist_succeded);
        if (theOrderJSON.hist_succeded) {
            var fromImgA = this.overlayUnit(theUnit, theOrderJSON.from_hex_index, parseInt(theOrderJSON.hist_my_start_healt), false);
            var theUnitImage = fromImgA[0];
            var newFromHealtImage = fromImgA[1];

            var aeImg = this.overlayAreaElement(theAreaElement, theOrderJSON.dest_hex_index);
            var attOrderImg = this.overlayAttackOrder(theOrderJSON.from_hex_index, theOrderJSON.dest_hex_index, theOrderStep)

            this.hexMapView.removeUnit(theUnit);
            this.hexMapView.removeAreaElement(theAreaElement);
            
            var theThis = this;
            Effect.multiple(
                [$(theUnitImage), $(newFromHealtImage),$(theUnitImage), $(aeImg), $(attOrderImg)],
                Effect.Pulsate,
                { delay: 0.0, speed: 0.0}
            );

            // Effect.multiple(
            //    [$(theUnitImage), $(newFromHealtImage),$(theUnitImage), $(aeImg), $(attOrderImg)], Effect.Fade,{ speed: 0.0, delay: 1.0,
            //      afterFinish: theThis.model.attackAreaElementOrderCallBack(theOrderStep, theOrderJSON, theUnit, theAreaElement)
            //    });
            Effect.Fade($(aeImg), { duration: 0.5, afterFinish: function(){ theThis.model.attackAreaElementOrderCallBack(theOrderStep, theOrderJSON, theUnit, theAreaElement)} });
            
        } else {
            animateOrderFailed(theOrderStep, theUnit);
        }
    },
    
    animateAttackUnit: function(theOrderJSON, theUnit, theOtherUnit, theOrderStep) {
        this.drawFromAndDestHexBattleReportSingleStep(theOrderJSON.from_hex_index, theOrderJSON.dest_hex_index, theOrderJSON.hist_succeded);

        if (theOrderJSON.hist_succeded) {
            // Create "from" overlay image
            var healt = theOrderJSON.hist_my_start_healt - theOrderJSON.hist_my_looses;           
            var fromImgA = this.overlayUnit(theUnit, theOrderJSON.from_hex_index, healt, false);
            var theUnitImage = fromImgA[0];
            var newFromHealtImage = fromImgA[1];

            // Create "other" overlay image
            var otherHealt = theOrderJSON.hist_other_unit_start_healt - theOrderJSON.hist_other_unit_looses;          
            var destImgA = this.overlayUnit(theOtherUnit, theOrderJSON.dest_hex_index, otherHealt, false);
            var theOtherUnitImage = destImgA[0];
            var newDestHealtImage = destImgA[1];

            // Remove the old graphics
            this.hexMapView.removeUnit(theUnit);
            this.hexMapView.removeUnit(theOtherUnit); // Will only work if theOtherUnit is include in units

            // Create order image
            var theOrderImage = this.overlayAttackOrder(theOrderJSON.from_hex_index, theOrderJSON.dest_hex_index, theOrderStep);

            // Draws the texts showsing the healt looses
            var fromHealtElement = this.addHealtValue(theOrderJSON.from_hex_index, parseInt(theOrderJSON.hist_my_looses), false);
            var destHealtElement = this.addHealtValue(theOrderJSON.dest_hex_index, parseInt(theOrderJSON.hist_other_unit_looses), false);

            Effect.multiple([$(newFromHealtImage),$(theUnitImage), $(theOtherUnitImage), $(newDestHealtImage)], Effect.Pulsate, {pulses: 2, duration: 0.5, speed: 0});
            Effect.multiple($(destHealtElement), Effect.Fade, {delay: 0.3, speed: 0});
            Effect.multiple($(fromHealtElement), Effect.Fade, {delay: 0.3, speed: 0});

            // Did the from unit die?
            if (healt == 0) {
                Effect.multiple([$(theUnitImage), $(newFromHealtImage)],Effect.Puff, 
                { speed: 0, queue: 'end',
                  afterFinish: function(){
                      BattleReportView.rmImgEle(theUnitImage);
                      BattleReportView.rmImgEle(newFromHealtImage);
                  }
                });
            }

            // Did the other unit die?
            if (otherHealt == 0) {
                Effect.multiple([$(theOtherUnitImage), $(newDestHealtImage)],Effect.Puff,
                { speed: 0, queue: 'end',
                  afterFinish: function() {
                      BattleReportView.rmImgEle(theOtherUnitImage);
                      BattleReportView.rmImgEle(newDestHealtImage);
                  }
                });
            }

            // Fade out the order images
            var theThis = this;
            Effect.Fade($(theOrderImage),
                { duration: 0.3,
                  queue: 'end',
                  afterFinish: function() { 
                      theThis.model.attackOrderCallBack(theOrderStep, theOrderJSON, theUnit, theOtherUnit)
                  }
                });
        } else {
            animateOrderFailed(theOrderStep, theUnit);
        }
    },

    animateRaid: function(theOrderJSON, theUnit, theOrderStep) {
        var dMoney = theOrderJSON.hist_my_looses;
        
        var fromMoneyEle = this.addRaidValue(theOrderJSON.from_hex_index, dMoney, true);
        var destMoneyEle = this.addRaidValue(theOrderJSON.dest_hex_index, dMoney, false);

        Effect.multiple([$(fromMoneyEle),$(destMoneyEle)], Effect.Appear, {speed: 0});

        var theThis = this;
        Effect.multiple([$(fromMoneyEle),$(destMoneyEle)], Effect.Fade,
        { delay: 0.5, speed: 0,
            afterFinish: function() { theThis.model.raidOrderCallBack(theOrderStep, theOrderJSON, theUnit) }
        });
    },
    
    animateHealUnit: function(theOrderJSON, theUnit, theOrderStep) {        
        var dHealt = theOrderJSON.hist_my_looses;

        var healtEle = this.addHealtValue(theOrderJSON.from_hex_index, dHealt, true);

        var xHex = this.model.hexMapModel.getHexX(theOrderJSON.from_hex_index);
        var yHex = this.model.hexMapModel.getHexY(theOrderJSON.from_hex_index, xHex);
        var newHealt = theOrderJSON.hist_my_start_healt + dHealt;
        var newHealtImage = this.overlayHealt(theOrderJSON.from_hex_index, xHex, yHex, newHealt);

        var imageName = "unit_"+this.model.hexMapModel.units.getUnitTypeName(this.model.hexMapModel.units.getUnitType(theUnit))+"_"+this.hexMapView.userColors[""+this.model.hexMapModel.units.getUnitUserId(theUnit)];
        var theUnitImage = this.hexMapView.addBitmap("battlereport"+theOrderStep, theOrderJSON.dest_hex_index, xHex, yHex, 0, 0, this.hexMapView.imageHandler.images[imageName], this.hexMapView.Z_UNIT+this.hexMapView.Z_RED_OPACITY_LAYER);
        Effect.multiple($(healtEle), Effect.Appear, {speed: 0});
        Effect.multiple($(newHealtImage), Effect.Appear, {speed: 0});
        
        this.hexMapView.removeUnit(theUnit);
        var theThis = this;
        
        Effect.multiple($(healtEle), Effect.Fade,
        { delay: 0.5, speed: 0,
          afterFinish: function() { theThis.model.healOrderCallBack(theOrderStep, theOrderJSON, theUnit) }
        });

    },

    animateBuildUnit: function(theOrderJSON, theUnit) {
        var theOrderStep = this.model.currentStep;
        
        if (theOrderJSON.hist_succeded) {
            var xHex = this.model.hexMapModel.getHexX(theOrderJSON.hist_from_hex_index);
            var yHex = this.model.hexMapModel.getHexY(theOrderJSON.hist_from_hex_index, xHex);
            var theUnitImages = this.overlayUnit(theUnit, theOrderJSON.hist_from_hex_index, 9, false);
            $(theUnitImages[0]).hide();
            $(theUnitImages[1]).hide();
            
            var theThis = this;
            Effect.Grow($(theUnitImages[0]));
            Effect.Grow($(theUnitImages[1]),
            { 
               afterFinish: function() { theThis.model.buildOrderCallBack(theOrderStep,theUnit) }
            });
        } else {
            
        }
    }
});

BattleReportView.rmImgEle = function(theImageEle) {
    if ($(theImageEle).parentNode) {
        $(theImageEle).remove();
    }
}

var BattleReport = Class.create({
    initialize: function(theHexMapModel, theHexMapView) {

        this.model = new BattleReportModel(theHexMapModel);
        this.view = new BattleReportView(this.model, theHexMapView);
        this.model.view = this.view;
    },

    atTheEndOfOrderList: function() {
        return this.model.atTheEndOfOrderList();
    },
    
    goToStart: function() {
        setGameData(this.model.historyGameData);
        // this.model.allVisibleAreaElements = new AreaElementCollection(areaElementTypesArray, historyData[2]);
        
        this.model.goToStart();
    },

    // Public
    forwardOneStep: function() {
        this.model.forwardOneStep();
    }

});

// **************************************************************
// Popup Battle Report Controller
// **************************************************************
var PopupBattleReportControllerBox = Class.create({
    initialize: function(thePopupBattleReportControllerID, theParentDivID, theThisObjectName, theBattleReport, theHexMapView, theHeaderTxt, theBodyTxt, theZIndex, theBGImageName) {
        this.popupBattleReportControllerID = thePopupBattleReportControllerID;
        this.parentDivID = theParentDivID;
        this.thisObjecName = theThisObjectName;
        this.battleReport = theBattleReport;
        this.hexMapView = theHexMapView;
        this.headerTxt = theHeaderTxt;
        this.bodyTxt = theBodyTxt;
        this.zIndex = theZIndex;
        this.BGImageName = theBGImageName;
        this.waitForOrderToFinish = false;
        
        /*
        var popupBattleReportControllerHTML = " \
            <div id='"+this.popupBattleReportControllerID+"' style='z-index: "+this.zIndex+"; right: 50px;'> \
                <div id='"+this.popupBattleReportControllerID+"_wapper' style='width: 236px;'> \
                    <div id='batlle_report_controller_cancel_button' onclick='button_battle_report_controller_cancle();'></div> \
                    <div id='"+this.popupBattleReportControllerID+"_wapper_left'> \
                        <div id='"+this.popupBattleReportControllerID+"_header' style='width: 200px;'>"+this.headerTxt+"</div> \
                        <div id='"+this.popupBattleReportControllerID+"_slider'> \
                            <div id='"+this.popupBattleReportControllerID+"_slider_track' class='track'> \
                                <div id='"+this.popupBattleReportControllerID+"_slider_handle' class='handle'></div> \
                            </div> \
                        </div> \
                        <div id='battle_report_controller_slider_number'>0/0</div> \
                        <p> \
                        <div id='battle_report_controller_button_list'>\
                            <ul class='battle_report_controller_button_list' > \
                                <li id='battle_report_controller_button_start' ><img src='../images/32x32/battelreport_stop.png' height='16px' width='16px' onclick='"+this.thisObjecName+".button_go_to_start();'></img></li> \
                                <li id='battle_report_controller_button_forward_one_step' ><img src='../images/32x32/battelreport_play.png' height='16px' width='16px' onclick='"+this.thisObjecName+".button_forward_one_step();'></img></li> \
                            </ul> \
                        </div> \
                        </p> \
                    </div> \
                </div> \
            </div>";
        */
       //
       // <div id='"+this.popupBattleReportControllerID+"_wapper_left'> \
        this.popupBattleReportControllerHTML = " \
            <div id='"+this.popupBattleReportControllerID+"'>\
                 <div id='"+this.popupBattleReportControllerID+"_wapper'> \
                        <div id='"+this.popupBattleReportControllerID+"_llo' style='display: inline;'></div>\
                        <div id='"+this.popupBattleReportControllerID+"_header' style='width: 110px; height: 14px;'>"+this.headerTxt+"</div> \
                        <div id='batlle_report_controller_cancel_button' style='z-index: "+(this.zIndex+6)+";' onclick='button_battle_report_controller_cancle();'></div> \
                        <div id='battle_report_controller_slider_number'>0/0</div>\
                        <div id='battle_report_controller_button_list'>\
                            <ul class='battle_report_controller_button_list' style='margin-top: 0px; margin-bottom: 0px;  padding: 0px;'> \
                                <li id='battle_report_controller_button_start'><img src='../images/32x32/battelreport_stop.png' height='30px' width='30px' onclick='"+this.thisObjecName+".button_go_to_start();'></img></li> \
                                <li id='battle_report_controller_button_forward_one_step'><img src='../images/32x32/battelreport_play.png' height='30px' width='30px' onclick='"+this.thisObjecName+".button_forward_one_step();'></img></li> \
                            </ul> \
                        </div> \
               </div> \
            </div>";
       
        $(this.parentDivID).update(this.popupBattleReportControllerHTML);
        this.llo = new LazyLoadingOverlay(
            ""+this.popupBattleReportControllerID+"_llo",
            "",
            "absolute",
            "black_opacity_50_32x32.png",
            -8, 30,
            -2, -37, 123, 63, 0);
        this.llo.hide();
        // this.slider = new Control.Slider('battle_report_controller_slider_handle' , 'battle_report_controller_slider_track');
        $(this.popupBattleReportControllerID).hide();
    },

//                                <li id='battle_report_controller_button_start' onclick='"+this.thisObjecName+".button_go_to_start();'></li> \
//                                <li id='battle_report_controller_button_back_one_step'onclick='"+this.thisObjecName+".button_back_one_step();'></li> \
//                                <li id='battle_report_controller_button_play' onclick='"+this.thisObjecName+".button_play();'></li> \
//                                <li id='battle_report_controller_button_stop' onclick='"+this.thisObjecName+".button_stop();'></li> \
//                                <li id='battle_report_controller_button_forward_one_step'onclick='"+this.thisObjecName+".button_forward_one_step();'></li> \
//                                <li id='battle_report_controller_button_end' onclick='"+this.thisObjecName+".button_go_to_end();'></li> \

    show: function() {
        $(this.popupBattleReportControllerID).appear ();
    },

    hide: function() {
        $(this.popupBattleReportControllerID).fade ();
    },

    button_go_to_start: function() {
        /*
        this.slider.dispose();
        this.slider = new Control.Slider('battle_report_controller_slider_handle' , 'battle_report_controller_slider_track',
            {
                value: $R(0, this.battleReport.model.orderQuery.length+1),
                range: $R(0, this.battleReport.model.orderQuery.length+1)
            }
        );
        this.slider.setValue(0);
        */
        $('battle_report_controller_slider_number').update("0/"+this.battleReport.model.orderQuery.length);
        
        this.battleReport.goToStart();
    },

    button_back_one_step: function() {
        this.hexMapView.removeBattleReportImages();
    },

    button_play: function() {
        this.hexMapView.removeBattleReportImages();
    },

    button_stop: function() {
        this.hexMapView.removeBattleReportImages();
    },

    button_forward_one_step: function() {
        if (!this.waitForOrderToFinish) {
            if (!this.battleReport.atTheEndOfOrderList()) {
                $('battle_report_controller_slider_number').update(""+(this.battleReport.model.currentStep+1)+"/"+this.battleReport.model.orderQuery.length);
                this.llo.show();
                this.waitForOrderToFinish = true;
                // $(this.popupBattleReportControllerID).setStyle("cursor: wait;");
                this.battleReport.forwardOneStep();
            }
            // this.slider.setValue(this.battleReport.model.currentStep+1);
        }        
    },

    button_go_to_end: function() {
        this.hexMapView.removeBattleReportImages();
    },

    callBackOrderDone: function() {
        // $(this.popupBattleReportControllerID).setStyle("cursor: default;");
        // $(this.popupBattleReportControllerID).style.cursor="default";
        // $(this.popupBattleReportControllerID).setStyle("cursor: pointer; cursor: hand;");
        this.waitForOrderToFinish = false;
        this.llo.hide();
    }
});