var NextTurnButton = Class.create({
    //  The paramente theOrderSendStatus is a string which can have the values "sent", "sending", and "not send"
    initialize: function(theParentId, theOrdersSendStatus, current_turn, last_turn_ended_at, duration_between_turns) {
        this.parentId = theParentId;
        this.isTimeOut = false;

        this.current_turn = current_turn;
        this.last_turn_ended_at = last_turn_ended_at;
        this.duration_between_turns = duration_between_turns;
        this.ordersSendStatus = theOrdersSendStatus;

        this.turnHTML = "<div id='button_next_turn_turn_id'>Turn "+this.current_turn+"</div>";
        
        if (_gs.getState() == GameSessionModel.GS_STATES.Starting) {
            this.timerHTML = "<div id='button_next_turn_timer_id'>"+timeToString(this.duration_between_turns)+"</div></div>";
        } else {
            this.timerHTML = "<div id='button_next_turn_timer_id'>0d,0h,0m,0s</div></div>";
        }

        this.nextTurnHTML = "<div id='button_next_turn_id' onClick='button_end_turn();'>";        
        this.nextTurnTextHTML = "<div id='button_next_turn_text_id'>Next Turn</div>";

        this.sendOrdersHTML = "<div id='button_next_turn_id' onClick='button_send_orders();'>";
        this.sendOrderTextHTML = "<div id='button_next_turn_text_id'>Send Orders</div>";

        this.ordersIsSendingHTML = "<div id='button_next_turn_id'>";
        this.ordersIsSendingTextHTML = "<div id='button_next_turn_text_id' style='text-decoration: line-through;'>Sending</div>";

        this.ordersIsSendHTML = "<div id='button_next_turn_id'>";              
        this.ordersIsSendTextHTML = "<div id='button_next_turn_text_id' style='text-decoration: line-through;'>Send Orders</div>";        

        this.update_button();
        if (_gs.getState() == GameSessionModel.GS_STATES.Active) {
            this.update_timer();
        }        
    },
   
    
    create_next_turn_button: function() {        
        $("button_next_turn_text_id").replace("<div id='button_next_turn_text_id' onClick='button_end_turn();'>End Turn</div>");        
    },
    
    update_button: function() {
        var iniHTML = "";
        if (this.ordersSendStatus == "sent") {
            if (this.isTimeOut) {
                iniHTML = ""+this.nextTurnHTML+this.turnHTML+this.nextTurnTextHTML+this.timerHTML;
            } else {
                iniHTML = ""+this.ordersIsSendHTML+this.turnHTML+this.ordersIsSendTextHTML+this.timerHTML;            
            }            
        } else if (this.ordersSendStatus == "sending") {            
             iniHTML = ""+this.ordersIsSendingHTML+this.turnHTML+this.ordersIsSendingTextHTML+this.timerHTML;
        } else {
            iniHTML = ""+this.sendOrdersHTML+this.turnHTML+this.sendOrderTextHTML+this.timerHTML;
        }
        
        if (_isBattleReportMode) {
            $(this.parentId).hide();
        }
        
        $(this.parentId).update(iniHTML);
    },

    update_timer: function() {
        var the_date = new Date();
        var current_time = the_date.getTime();      
    
        var dT = this.last_turn_ended_at + this.duration_between_turns - current_time
        if (dT > 0) {        
            domCreateCountDownTimer(this.last_turn_ended_at, this.duration_between_turns, "button_next_turn_timer_id", this.time_is_up, this);
        } else {
            this.isTimeOut = true;
            this.update_button();
        }
    },
    
    time_is_up: function(the_this) {        
        the_this.isTimeOut = true;
        the_this.update_button();
    },
    
    restart_timer: function(last_turn_ended_at) {    
        this.last_turn_ended_at = last_turn_ended_at;
        this.update_timer();        
    },

    startTimer: function() {
        var theDate = new Date();
        this.last_turn_ended_at = theDate.getTime();

        this.update_timer();
    },
    
    set_current_turn: function(the_current_turn, last_turn_ended_at) {            
        this.last_turn_ended_at = last_turn_ended_at;    
        this.current_turn = the_current_turn;
        this.turnHTML = "<div id='button_next_turn_turn_id'>Turn "+this.current_turn+"</div>";

        this.ordersSendStatus = "not send";
        this.isTimeOut=false;
        
        this.update_button();
        this.update_timer();
    },

    setOrdersSendStatus: function(theOrdersSendStatus) {
        this.ordersSendStatus = theOrdersSendStatus;
        this.update_button();
    }
});