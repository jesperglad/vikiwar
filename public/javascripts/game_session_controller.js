var GameSessionController = Class.create({
    initialize: function(
        theGameSessionModel,
        theGameSessionView
    ) {
        this.gs = theGameSessionModel;
        this.gsv = theGameSessionView;
        this.gs.addEventListener(this);

    },

    // gameEnded: function() {
    //    this.event(
    //        new Event(Event.EVENT_TYPES.GameEnded, null)
    //    );
    // },
    
    event: function(theEvent) {
        this.gsv.createEventNotification(theEvent);
    },

    buttonEventNotificationClose: function() {
        this.gsv.nextEventNotification();
    }
});

