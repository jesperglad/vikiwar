var Event = Class.create({
    initialize: function(theEventType, theEventData) {        
        this.eventType = theEventType;
        this.eventData = theEventData;

        var d = new Date();
        this.timeStamp = d.getTime();
    },

    getEventType:function () {
        return this.eventType;
    },

    setEventType:function (theEventType) {
        this.eventType = theEventType;
    },

    getEventData: function () {
        return this.eventData;
    }
});
Event.EVENT_TYPES = {"Win": 0, "Loose": 1, "Killed": 2, "Peace": 3, "Joined": 4, "CurrentUserJoined": 5, "CurrentUserRemoved": 6, "GameEnded": 7, "GameEndedInPeace": 8};
// ******************************************************************************************************************
//  GameSession
//
//
//  ******************************************************************************************************************
var GameSessionModel = Class.create({    
    initialize: function(
        theGSState,
        theGSLevel,
        theTurn,
        theLastTurnEndedAt,
        theUsersName,
        theCurrentUserId,
        theCurrentUserName
    ) {
       // Game Session States: "STARTING", "ACTIVE", "ENDED", "PEACE"
       this.gsState = theGSState;
       this.gsLevel = theGSLevel;
       this.turn = theTurn;
       this.lastTurnEndedAt = theLastTurnEndedAt;
       this.usersName = $H(theUsersName);
       this.currentUserId = theCurrentUserId;
       this.currentUserName = theCurrentUserName;       
       
       this.USER_STATES= {"Invited": 0, "Accepted": 1, "Active": 2, "Killed": 3, "Inactive": 4};
       this.USER_INDEX= {"OrdersSend": 0, "Online": 1, "State": 2, "Peace": 3, "Points": 4, "ReminderAllowed": 5};       

       this.gsuss = new Array(); // Game Session User Statuses

       this.eventListener = $A(new Array());
    },

    getState: function() {
        return this.gsState;
    },

    setState: function(theState) {
        this.gsState = theState;
    },

    getGSLevel: function() {
        return this.gsLevel;
    },
    
    getTurn: function() {
        return this.turn;
    },

    setTurn: function(theTurn) {
        this.turn = theTurn;
    },
    
    // Privat
    hasCurrentUserJustJoined: function(oldStatus, newStatus) {
        var newCurrentUserStatus = newStatus.get(this.currentUserId);
        var oldCurrentUserStatus = oldStatus.get(this.currentUserId);

        if ((newCurrentUserStatus != undefined) &&
            (newCurrentUserStatus[this.USER_INDEX.State] == "active" ) && 
            (oldCurrentUserStatus[this.USER_INDEX.State] == "invited" ))
        {
            return true;
            
        } else {
            return false;            
        }
    },

    // Privat
    hasCurrentUserJustBeenRemovedFromGame: function(oldStatus, newStatus) {
        var newCurrentUserStatus = newStatus.get(this.currentUserId);
        var oldCurrentUserStatus = oldStatus.get(this.currentUserId);

        if ((newCurrentUserStatus == undefined) ||
            ( newCurrentUserStatus[this.USER_INDEX.State] != oldCurrentUserStatus[this.USER_INDEX.State] ))
        {
            return true;
        } else {
            return false;
        }
    },

    // Privat
    hasStatusOfUserChanges: function(oldStatus, newStatus, aUserName) {
        var newUserStatus = newStatus.get(aUserName[0]);
        var oldUserStatus = oldStatus.get(aUserName[0]);

        if ((newUserStatus == undefined) || (oldUserStatus == undefined) || (newUserStatus[2] != oldUserStatus[2])) {
            return true;
        } else {
            return false;
        }
    },

    // Privat
    hasUserAskedForPease: function (newUserStatues, theUserId) {
        var nus = newUserStatues.get(theUserId);

        if (nus[this.USER_INDEX.Peace] == true) {
            return true;
        } else {
            return false;
        }
    },

    // Privat
    hasUserBeenKilled: function (newUserStatues, theUserId) {
        var nus = newUserStatues.get(theUserId);

        if (nus[this.USER_INDEX.State] == "killed") {
            return true;
        } else {
            return false;
        }
    },

    // Private
    getPlayerJoinedLeftStartingGameEvents: function(theStatus) {
        var events = $A(new Array());
        var theThis = this;

        this.usersName.each(function(aUserName) {
            if (theThis.hasStatusOfUserChanges(theThis.gsuss, theStatus, aUserName)) {
                if (theThis.hasCurrentUserJustJoined(theThis.gsuss, theStatus)) { // Current user joined
                    events.push(new Event(Event.EVENT_TYPES.CurrentUserJoined, $H({name: aUserName[1]}) ));
                } else if (theThis.hasCurrentUserJustBeenRemovedFromGame(theThis.gsuss, theStatus)) { // Current user removed
                    events.push(new Event(Event.EVENT_TYPES.CurrentUserRemoved, $H({name: aUserName[1]}) ));
                } else { // Someone else beside the current user have joined
                    events.push(new Event(Event.EVENT_TYPES.Joined, $H({name: aUserName[1]}) ));
                }
            }
        });

        return events;
    },

    // Verify if we need to show a notification of a user either have been killed or is asking for peace
    // Private
    getKilledPeaceEvents: function(theStatus) {
        var events = $A(new Array());
        var theThis = this;
        
        this.usersName.each(function(aUserName) {
            // Verify if we need to show a notification of a user either have been killed or is asking for peace
            if (theThis.hasUserBeenKilled(theStatus, aUserName[0])) { // && (_cookie.isValue("notice_"+aUserName[0]+"_killed", "shown") == false)) {
                var eventId = "notice_"+aUserName[0]+"_killed";
                if (theThis.hasEventBeenRegistered(eventId) == false) {
                    events.push(new Event(Event.EVENT_TYPES.Killed, $H({"name": aUserName[1]}) ));
                    theThis.registerEvent(eventId);
                }
            } else if (theThis.hasUserAskedForPease(theStatus, aUserName[0])) {// && (_cookie.isValue("notice_"+aUserName[0]+"_peace", "shown") == false)){
                var eventId = "notice_"+aUserName[0]+"_peace";
                if (theThis.hasEventBeenRegistered(eventId) == false) {
                    events.push(new Event(Event.EVENT_TYPES.Peace, $H({"name": aUserName[1]}) ));
                    theThis.registerEvent(eventId);
                }
            }
        });

        return events;
    },

    // Private
    getWinner: function(theStatus) {
      var nameOfActiveUsers = this.getNameOfActiveUsers(theStatus);

      if (nameOfActiveUsers.size() == 1) {
        return nameOfActiveUsers[0]
      }

      return null;

    },    

    // ----------------------------------------------------
    // Event handler
    // ----------------------------------------------------
    registerEvent: function(theEventId){
        _cookie.setValue(theEventId, "shown");
    },

    hasEventBeenRegistered: function(theEventId) {
        return _cookie.isValue(theEventId, "shown")
    },

    eventFactory: function(theStatus) {
        var events = new Array();
        
        if (this.gsState == GameSessionModel.GS_STATES.Starting) {
            events = events.concat(this.getPlayerJoinedLeftStartingGameEvents(theStatus));
            
        } else if (this.gsState == GameSessionModel.GS_STATES.Active) {
            events = events.concat(this.getKilledPeaceEvents(theStatus));

        } else if (this.gsState == GameSessionModel.GS_STATES.Ended) {
            // Is current player winning or loosing
            var winner = this.getWinner(theStatus);
            if (winner == this.getNameOfCurrentUser()) { // Seems we have a winner, is it the currently active user?
                var eventId = "notice_"+this.getIDOfCurrentUser()+"_winner";
                if (!this.hasEventBeenRegistered(eventId)) {
                    this.registerEvent(eventId);
                    events.push(new Event(Event.EVENT_TYPES.Win, null));
                } else {
                    events.push(new Event(Event.EVENT_TYPES.GameEnded, null));
                }
            } else if (winner != null) { // Seems we have a winner and it is not the current user
                var eventId = "notice_"+this.getIDOfCurrentUser()+"_loose";
                if (!this.hasEventBeenRegistered(eventId)) {
                    this.registerEvent(eventId);
                    events.push(new Event(Event.EVENT_TYPES.Loose, null));
                } else {
                    events.push(new Event(Event.EVENT_TYPES.GameEnded, null));
                }
            }
        } else if (this.gsState == GameSessionModel.GS_STATES.Peace) {
            events.push(new Event(Event.EVENT_TYPES.GameEndedInPeace, null));
        }
                              
        return events;
    },

    addEventListener: function(theEventListener) {
        this.eventListener.push(theEventListener);
    },

    fireEvents: function(theEvents) {
        this.eventListener.each(function(theEventListener){
            theEvents.each(function(theEvent) {
                theEventListener.event(theEvent);
            });
        });
    },
    
    // ----------------------------------------------------
    // Users
    // ----------------------------------------------------
    getNameOfCurrentUser: function() {
        return this.currentUserName;
    },

    getIDOfCurrentUser: function() {
        return this.currentUserId;
    },
    
    getNameOfActiveUsers: function (theUsersStatus) {
        var nameOfActiveUsers = new Array();
        var theThis = this;
        theUsersStatus.each(function(pair) {
            var userStatus = pair.value;
            if (userStatus[theThis.USER_INDEX.State] == "active" ) {
                nameOfActiveUsers.push(theThis.usersName.get(pair.key));
            }
        });

        return nameOfActiveUsers;
    },

    getNameOfCurrentActiveUsers: function() {
        return this.getNameOfActiveUsers(this.gsuss);
    },

    isNameOfCurrentUser: function(aUserName) {
        if (aUserName == this.currentUserName) { return true; } else { return false; }
    },
    
    hasUserSendOrders: function(theUserId) {
        return this.gsuss[theUserId][this.USER_INDEX.OrdersSend];
    },

    isUserOnline: function(theUserId) {
        return this.gsuss[theUserId][this.USER_INDEX.Online];
    },

    isUserAskingForPeace: function(theUserId) {
        return this.gsuss[theUserId][this.USER_INDEX.Peace];
    },

    isAllowedToSendReminderToUser: function(theUserId) {
        return this.gsuss[theUserId][this.USER_INDEX.ReminderAllowed];
    },

    getUserPoints: function(theUserId) {
        return this.gsuss[theUserId][this.USER_INDEX.Points];
    },

    isUserNew: function (theUserName) {
        var theIsUserNew = true;
        var theThis = this;
        this.usersName.each(function(pair) {
            if (pair.value == theUserName) {
                theIsUserNew = false;
            }
        });

        return theIsUserNew;
    },

    isCurrentUserNew: function () {
        return this.isUserNew(this.currentUserName)
    },
    
    getUserState: function(theUserId) {
        return this.gsuss[theUserId][this.USER_INDEX.State];
    },

    setUsersState: function(theUsersState) {
        this.fireEvents (
            this.eventFactory(theUsersState)
        );
        this.gsuss = theUsersState;
    }
});
GameSessionModel.GS_STATES = {"Starting": 0, "Active": 1, "Ended": 2, "Peace": 3};