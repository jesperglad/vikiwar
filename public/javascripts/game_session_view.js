var GameSessionView = Class.create({
    initialize: function() {
        this.eventNotificationsWaiting = new Hash();
        this.createEventNotificationPopupBox();
        this.eventShowing = false;

        this.imagePeaceTxt = "<div id='popup_textbox_peace_img'><img src='/images/Vikiwar_white.png' width='200' /></p></div>";
        this.imageSurrenderTxt = "<div id='popup_textbox_surrender_img'><p><img src='/images/Vikiwar_surrender.png' width='200' /></p></div>";
    },

    createEventNotificationPopupBox: function() {
        this.popupBox = new PopupTextBox(
            "popup_textbox_main",
            "popup_textbox",
            "Orders Sent",
            "Your orders have been send. Please wait unit orders have been recived from all players, or time runs out.",
            30000,
            "black_opacity_50_32x32.png");
    },

    removeEventNotificationPopupBox: function(theId) {
        var pb = popupBoxes.get(theId);
        pb.close();
        pb.unset();
        pb = null;
    },

    showWinner:function() {
        this.eventShowing = true;

        var headerTxt = "You win!";
        var bodyTxt = "The battle has come to an end, and you are coming out as victorious.";
        if ($A(OPEN_REGIONS).size() > 0) {
            bodyTxt += "<p>Getting a foot hole in this region, opens access to you into the region(s):</p><ul>"
            $A(OPEN_REGIONS).each(function(regionName){
                bodyTxt += "<li>"+regionName+"</li>";
            });
            bodyTxt += "</ul>";
        }

        this.popupBox.updateAndShow(
            headerTxt,"1.0em",
            ""+bodyTxt, "0.8em",
            "left",
            "_gsv.stopShowingEvent(); _gsc.buttonEventNotificationClose();");
    },

    showLooser:function() {
        this.eventShowing = true;
        
        var headerTxt = "You loose!";
        var bodyTxt = "Yeah you might have lost the battle, but not the war. Get back pick another fight ... looser!";
        var imageTxt = this.imageSurrenderTxt;

        this.popupBox.updateAndShow(
            headerTxt,"1.0em",
            ""+bodyTxt+imageTxt, "0.8em",
            "left",
            "_gsv.stopShowingEvent(); _gsc.buttonEventNotificationClose();");
    },

    showGameEnded: function() {
        this.eventShowing = true;
        
        this.popupBox.updateAndShow(
            "This Battle has come to an end","1.0em",
            "The battele has ended, go pick a new fight", "1.0em",
            "left",
            "_gsv.stopShowingEvent(); _gsc.buttonEventNotificationClose();");

    },
    
    showGameEndedInPeace: function() {
        this.eventShowing = true;
                  //
                  // ptb.updateAndShow(
  //  "This Battle has ended in peace","1.0em",
  //  "This battele has ended in peace.", "1.0em",
  //  "left",
  //  "button_textbox_close();");
        this.popupBox.updateAndShow(
            "This Battle has come to an end","1.0em",
            "The battele has ended, go pick a new fight", "1.0em",
            "left",
            "_gsv.stopShowingEvent(); _gsc.buttonEventNotificationClose();");

    },

    showKilled: function(theUserName) {
        var headerTxt = "Another One Bites The Dust";
        var bodyTxt = null;
        var imageTxt = this.imageSurrenderTxt;

        this.eventShowing = true;

        if (_gs.isNameOfCurrentUser(theUserName)) {
            bodyTxt = "And this time it is you ... go pick another fight.";

        } else {
            bodyTxt = "Seems <b>"+theUserName+"</b> has either surrender or has been removed from battle by loosing he's chief or by loosing all cities.";
            
        }

        this.popupBox.updateAndShow(
            headerTxt,"1.0em",
            ""+bodyTxt+imageTxt, "0.8em",
            "left",
            "_gsv.stopShowingEvent(); _gsc.buttonEventNotificationClose();");
    },

    showPeace: function(theUserName) {
        this.eventShowing = true;

        var headerTxt = "Asking For Peace";
        var bodyTxt = "<div id='popup_textbox_body_peace'>Your opponent <b>"+theUserName+"</b> is asking for peace.</div>";
        var imageTxt = this.imagePeaceTxt;

        if (_gs.isNameOfCurrentUser(theUserName)) {
            bodyTxt = "Okay okay lets have a peace.";
        }

        this.popupBox.updateAndShow(
            headerTxt,"1.0em",
            ""+bodyTxt+imageTxt, "0.8em",
            "left",
            "_gsv.stopShowingEvent(); _gsc.buttonEventNotificationClose();");
    },

    showCurrentUserJoined: function() {
        var headerTxt = "Welcome to the battle!";
        var bodyTxt = "Weclome to the battle, it will start as soon as all players have joined.";

        this.eventShowing = true;

        this.popupBox.updateAndShow(
            headerTxt, "1.0em",
            bodyTxt, "1.0em",
            "_gsv.stopShowingEvent(); _gsc.buttonEventNotificationClose();");
    },

    showCurrentUserRemoved: function() {
        var headerTxt = "You are not in the battle anymore!";
        var bodyTxt = "Host have either closed the battle or removed you from it.";

        this.eventShowing = true;

        this.popupBox.updateAndShow(
            headerTxt, "1.0em",
            bodyTxt, "1.0em",
            "_gsv.stopShowingEvent(); _gsc.buttonEventNotificationClose();");
    },
    
    showEvent: function(theEvent) {
        if (theEvent == null) { 
            return;
        }
        
        var eventType = theEvent.getEventType();        

        if (eventType == Event.EVENT_TYPES.Win) {
            this.showWinner();                        

        } else if (eventType == Event.EVENT_TYPES.Loose) {
            this.showLooser();

        } else if (eventType == Event.EVENT_TYPES.GameEnded) {
            this.showGameEnded();
            
        } else if (eventType == Event.EVENT_TYPES.GameEndedInPeace) {
            this.showGameEndedInPeace();

        } else if (eventType == Event.EVENT_TYPES.Killed) {
            this.showKilled(theEvent.getEventData().get("name"));
            
        } else if (eventType == Event.EVENT_TYPES.Peace) {
            this.showPeace(theEvent.getEventData().get("name"));
            
        } else if (eventType == Event.EVENT_TYPES.Joined) {
            window.location.reload();

        } else if (eventType == Event.EVENT_TYPES.CurrentUserJoined) {
            this.showCurrentUserJoined();

        } else if (eventType == Event.EVENT_TYPES.CurrentUserRemoved) {
            this.showCurrentUserRemoved();
            
        }
    },

    stopShowingEvent: function()  {
        this.eventShowing = false;
        this.popupBox.hide();
    },
    
    nextEventNotification: function() {
        var priorityKeys = this.eventNotificationsWaiting.keys().sort();
        if (priorityKeys.size() > 0) {
            var theKey = priorityKeys.pop();
            var notifications = this.eventNotificationsWaiting.get(theKey);
            this.showEvent(notifications.pop());
            this.eventNotificationsWaiting.unset(theKey);
        }
    },

    addWaitingEventNotification: function(theEvent) {
        var eventType = theEvent.getEventType();
        var priorityAndKey = 0;
        
        if (eventType == Event.EVENT_TYPES.Win) {
            priorityAndKey = 10;

        } else if (eventType == Event.EVENT_TYPES.Loose) {
            priorityAndKey = 20;

        } else if (eventType == Event.EVENT_TYPES.GameEnded) {
            priorityAndKey = 80;

        } else if (eventType == Event.EVENT_TYPES.GameEndedInPeace) {
            priorityAndKey = 90;

        } else if (eventType == Event.EVENT_TYPES.Killed) {
            priorityAndKey = 50;

        } else if (eventType == Event.EVENT_TYPES.Peace) {
            priorityAndKey = 60;

        } else if (eventType == Event.EVENT_TYPES.Joined) {
            priorityAndKey = 70;

        } else if (eventType == Event.EVENT_TYPES.CurrentUserJoined) {
            priorityAndKey = 30;

        } else if (eventType == Event.EVENT_TYPES.CurrentUserRemoved) {
            priorityAndKey = 40;
        }

        var notifications = this.eventNotificationsWaiting.get(priorityAndKey);
        if ((notifications == undefined) || (notifications == null)) {
            notifications = new Array();
            this.eventNotificationsWaiting.set(priorityAndKey, notifications);
        }
        notifications.push(theEvent);        
    },
    
    createEventNotification: function(theEvent) {
        if (this.eventShowing) {
            this.addWaitingEventNotification(theEvent);
        } else {
            this.showEvent(theEvent);
        }
    }
});

var InfoBox = Class.create({
    initialize: function(theParentElement, theHexMap, theHexMapView, theImageHandler) {
        this.parentElement = $(theParentElement);
        this.hexMap = theHexMap;
        this.hexMapView = theHexMapView;
        this.imageHandler = theImageHandler;
        this.imagesShownHash = new Hash();

        this.isInfoBoxOpen = true;
        this.htmlBase = "\n\
          <div id='info_box' onmousedown='return mouseDown(event);' onmouseup='return mouseUp(event);'  onmousemove='return mouseMove(event);'>\n\
            <div id='info_box_terrain'>\n\
                <div id='info_box_terrain_left'>\n\
                    <div id='info_box_list_terrain_text'>Terrain:</div>\n\
                    <img id='info_box_list_terrain_image' src='../images/32x32/hex_base_32x32.png' width='48' height='48'></img>\n\
                </div>\n\
                <div id='info_box_terrain_right'>&nbsp;</div>\n\
            </div>\n\
            <div id='info_box_areaelement'>\n\
                <div id='info_box_areaelement_left'>\n\
                    <div id='info_box_list_areaelement_text'>City:</div>\n\
                    <img id='info_box_list_areaelement_image' src='../images/32x32/hex_base_32x32.png' width='48' height='48'></img>\n\
                    <img id='info_box_list_areaelement_level_image' src='../images/32x32/transpng1_32x32.png' width='48' height='48'></img>\n\
                </div>\n\
                <div id='info_box_areaelement_right'>&nbsp;</div>\n\
            </div>\n\
            <div id='info_box_unit'>\n\
                <div id='info_box_unit_left'>\n\
                    <div id='info_box_list_unit_text'>Unit:</div>\n\
                    <img id='info_box_list_unit_image' src='../images/32x32/hex_base2_32x32.png' width='48' height='48'></img>\n\
                    <img id='info_box_list_unit_healt_image' src='../images/32x32/transpng2_32x32.png' width='48' height='48'></img>\n\
                </div>\n\
                <div id='info_box_unit_right'>&nbsp;</div>\n\
            </div>\n\
            <div id='info_box_cancel_button'></div>\n\
          </div>\n\
        ";

//<div id='info_box_cancel_button' onclick='buttonInfoBoxCancle();'></div>\n\
        this.parentElement.update(this.htmlBase);
        
        var theThis = this;        
        $('info_box_cancel_button').addEventListener("click", function(event) { theThis.closeInfoBox(); }, true);        
    },

    getImage: function(theImageName, theImageId) {

        var newImage = this.imagesShownHash.get(theImageName);
        if (newImage == null) {
            var theOldImage =  this.imageHandler.images[theImageName];
            newImage = new Image(48, 48);
            newImage.src = theOldImage.src;
            newImage.id = theImageId;
            this.imagesShownHash.set(theImageName, newImage);
            
        }

        return newImage;
    },

    getUnitText: function(theUnit) {
        var htmlS = "";

        htmlS += InfoBox.UNIT_EXP_NAME[this.hexMap.units.getUnitExperience(theUnit)];

        return htmlS;
    },
    
    update: function(index) {
        if (this.isInfoBoxOpen == false) {
            return;
        }
        
        var terrainName = this.hexMap.areas.getAreaTerrainNameFromLocationIndex(index);
        var terrainId = this.hexMap.areas.getTerrainIdFromName(terrainName);
        var terrainDescription = this.hexMap.areas.getTerrainDescription(terrainId);


        // $('info_box_list_terrain_image').setAttribute("src", "../images/32x32/terrain_"+terrainName+"_32x32.png");
        var theTImage = this.getImage("terrain_"+terrainName, 'info_box_list_terrain_image');
        $('info_box_list_terrain_image').replace(theTImage);
        $('info_box_list_terrain_text').update("Terrain: "+terrainName);
        $('info_box_terrain_right').update(terrainDescription);

        if (this.hexMap.areaElements.isAreaElementsAtHexIndex(index)) {
            // An Area Element in the hex info
            var areaElement = this.hexMap.areaElements.getAllAreaElementsAtHexIndex(index);
            var areaElementType = this.hexMap.areaElements.getAreaElementType(areaElement);
            var areaElementName = this.hexMap.areaElements.getAreaElementTypeName(areaElementType);
            var areaElementLevel = this.hexMap.areaElements.getAreaElementLevel(areaElement);
            var areaElementResourceGain = this.hexMap.areaElements.getAreaElementModifiedResourceGain(areaElement)
            
            var theUserId = this.hexMap.areaElements.getAreaElementUserId(areaElement)
            var theColor = "empty"
            if (theUserId != null) {
                theColor = this.hexMapView.userColors[""+theUserId]
            }

            var theAEImage = this.getImage("area_element_"+areaElementName+"_"+theColor, "info_box_list_areaelement_image");            
            $('info_box_list_areaelement_image').replace(theAEImage);

            if (areaElementLevel > 0) {
                var theAELevelImage = this.getImage("ae_level_"+areaElementLevel, "info_box_list_areaelement_level_image");
                $('info_box_list_areaelement_level_image').replace(theAELevelImage);
            }
            $('info_box_list_areaelement_text').update("City:");
            $('info_box_areaelement_right').update("It is a level "+areaElementLevel+", and the resource gain from it is "+areaElementResourceGain);
            
        } else {
            var theImage = this.getImage("hex_base", 'info_box_list_areaelement_image');
            var theImage2 = this.getImage("transpng1", 'info_box_list_areaelement_level_image');
            $('info_box_list_areaelement_image').replace(theImage);
            $('info_box_list_areaelement_level_image').replace(theImage2);
            $('info_box_list_areaelement_text').update("City: ");
            $('info_box_areaelement_right').update("");
        }

      if (this.hexMap.units.isUnitsInHex(index)) {
          var theUnitsInHex =  this.hexMap.units.getAllUnitsAtHexIndex(index); // TODO: NEEDS TO BE UPDATED FOR GAMES WITH MORE THAN ONE UNIT PR. HEX
          var theUnit =  theUnitsInHex[0];
          var unitType = this.hexMap.units.getUnitType(theUnit);
          var unitTypeName = this.hexMap.units.getUnitTypeName(unitType);
          var unitHealt = this.hexMap.units.getUnitHealt(theUnit);
          var theImageName = "unit_"+unitTypeName+"_"+this.hexMapView.userColors[""+this.hexMap.units.getUnitUserId(theUnit)];
          var theUnitImage = this.getImage(theImageName, 'info_box_list_unit_image');
          var theHealtImage = this.getImage("unit_indi_health"+unitHealt, 'info_box_list_unit_healt_image');

          $('info_box_list_unit_image').replace(theUnitImage);
          $('info_box_list_unit_healt_image').replace(theHealtImage);
          $('info_box_list_unit_text').update("Unit: "+unitTypeName);
          // domSetTextElementTextById('info_box_unit_right', ""+this.getUnitText(theUnit)+".\n"+this.hexMap.units.getUnitTypeDescription(unitType));
          $('info_box_unit_right').update(""+this.getUnitText(theUnit)+".<br>"+this.hexMap.units.getUnitTypeDescription(unitType));
      } else {
          var theImage1 = this.getImage("hex_base2", 'info_box_list_unit_image');
          var theImage2 = this.getImage("transpng2", 'info_box_list_unit_healt_image');
          $('info_box_list_unit_image').replace(theImage1);
          $('info_box_list_unit_healt_image').replace(theImage2);
          $("info_box_list_unit_text").update("Unit: ");
          $('info_box_unit_right').update("");
      }
    },

    openInfoBox: function() {
        if (this.isInfoBoxOpen) {
            return;
        }

        this.isInfoBoxOpen = true;
        this.parentElement.update(this.htmlBase);
        // $('info_box').morph('top:400px; width:730px; height:65px; text-align:left;');

        var theThis = this;
        $('info_box_cancel_button').addEventListener("click", function(event) { theThis.closeInfoBox(); }, true);

    },

    closeInfoBox: function() {
        this.isInfoBoxOpen = false;
        var htmlBaseClosed = "<div id='info_box'>Info</div>"
        
        this.parentElement.update(htmlBaseClosed);
        $('info_box').morph('top:450px; width:40px; height:15px; text-align:center;');

        var theThis = this;
        $('info_box').addEventListener("click", function(event) { theThis.openInfoBox(); }, true);
    }
});

InfoBox.UNIT_EXP_NAME = ["Green", "Novice", "Trained", "Regular", "Warrior","Professional", "Veteran", "Elite", "Heros", "Einheriars"];