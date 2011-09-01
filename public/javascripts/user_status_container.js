var  UserStatusContainer = Class.create({
    initialize: function(the_div_id, theHostName, theCurrentUserName, the_users_name, the_users_color) {
        this.div_id = the_div_id;
        this.usc_div_main_element = $(document.createElement("div"));
        this.usc_div_main_element.writeAttribute("class", "map_actions_div");
        $(this.div_id).appendChild(this.usc_div_main_element);
        
        var htmlString = "<ul class=\'users_status_list\' style='width: 180px; height: 18px;'>";
        this.hostName = theHostName;
        this.currentUserName = theCurrentUserName;
        this.users_name = $H(the_users_name);
        this.users_color = $H(the_users_color);
        
        var uc = this.users_color;
        this.users_name.each(function(user_name) {
            var the_color = uc.get(user_name[0]);
            var the_online_status_color = "red"            

            // htmlString += "<li style='background: #bbd9ee center left url(../images/32x32/red_man.png) no-repeat; border-left-color: "+the_color+";'><a href=\'/user/"+user_name[1]+"\'>"+user_name[1]+"</a></li>"
            // htmlString += "\n\
            //    <li style='background: #bbd9ee; border-left-color: "+the_color+";'>\n\
            //        <img src='../images/32x32/red_man.png' width='25' height='25'></img>\n\
            //        <a style='vertical-align: text-top;' href=\'/user/"+user_name[1]+"\'>"+user_name[1]+"</a>\n\
            //    </li>";
            htmlString += "\n\
                <li style='background: #bbd9ee; border-left-color: "+the_color+";'>\n\
                    <img src='../images/32x32/red_man.png' width='25' height='25'></img>\n\
                    "+user_name[1]+"\n\
                </li>";

        });
        htmlString += "</ul>";
        
        this.usc_div_main_element.update(htmlString);
    },

    setUsersColor: function(the_users_color) {
        this.users_color = $H(the_users_color);
    },

    setUsersName: function(the_users_name) {
        this.users_name = $H(the_users_name);
    },

    setUsersStatus: function(the_users_status) {
        var htmlString = "<ul class=\'users_status_list\'>";                

        var uc = this.users_color;
        var us = the_users_status;
        var theThis = this;
        this.users_name.each(function(user_name) {
            var the_player_color = uc.get(user_name[0]);
            var the_user_status = us.get(user_name[0]);           
                        
            var onlineStatusImage = "red_man";
            var playerActionHTML = "";
            var popupText = "";
            // Is user online
            if (the_user_status[2] == "invited") {
                onlineStatusImage = "invited";
                // if (theThis.currentUserName == user_name[1]) { // If the current user is only invited then give him the options to join
                //    playerActionHTML = "(<span id='usc_player_action' onclick='buttonJoinPlayer("+user_name[1]+")'>Join</span>)"
                // } else if
                if (theThis.hostName == theThis.currentUserName ) { // If the current user is host then give him the options to drop people which is only invited
                    playerActionHTML = "<span id='usc_player_action' onclick='buttonDropPlayer(\""+user_name[1]+"\")'>(Drop)</span>"
                }
                
                popupText = user_name[1]+ " is invited, but has not answered yet";
            } else if (the_user_status[2] == "dropped") {
                onlineStatusImage = "delete";
                popupText = user_name[1]+ " either rejected the invite, or was removed from the battle";                
            } else if (the_user_status[2] == "inactive") {
                onlineStatusImage = "inactive";
                popupText = "The troops of "+user_name[1]+ " is missing a leader. The battle will continue, but without "+user_name[1];
            } else if (the_user_status[1] == true) {
                // Has user send order
                if (the_user_status[0] == true) {
                    onlineStatusImage = "green_sword";
                    popupText = user_name[1]+ " is online and has sent orders";
                } else {
                    onlineStatusImage = "green_man";
                    popupText = user_name[1]+ " is online, but have not send orders";
                }
            } else {
                // Has user send order
                if (the_user_status[0] == true) {
                    onlineStatusImage = "red_sword";
                    popupText = user_name[1]+ " is offline, and has sent orders";
                } else {
                    onlineStatusImage = "red_man";
                    popupText = user_name[1]+ " is offline, and have not send orders";
                }
            }

            var playerStateTextDecoration = "none";
            if (the_user_status[2] == "killed") {
                playerStateTextDecoration = "line-through";

                if (theThis.currentUserName == user_name[1]) {
                    set_current_user_is_killed();
                }
            }

            var sendReminderHTML = "";
            if ((the_user_status[2] == "active") && (the_user_status[5]) && (theThis.currentUserName != user_name[1])) {
                 sendReminderHTML = "<div style='display: inline; width: 16; height: 16; background: #bbd9ee center left url(../images/32x32/email_add.png) no-repeat; cursor: pointer;' title='Send reminder' onclick='buttonSendReminder(\""+user_name[1]+"\")'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>";
            }


            var playerAskForPeaceHTML = "";
            if (the_user_status[3] == true) {
                playerAskForPeaceHTML = "<div style='display: inline; width: 16; height: 16; background: #bbd9ee center left url(../images/32x32/flag_pink.png) no-repeat;' title='Asking for peace' >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>";
            }

            // htmlString += "<li style='background: #bbd9ee center left url(../images/32x32/"+onlineStatusImage+".png) no-repeat; border-left-color: "+the_player_color+";' title='"+popupText+"' >"+playerAskForPeaceHTML+"<a href='/user/"+user_name[1]+"'><span style='text-decoration:"+playerStateTextDecoration+";'>"+user_name[1]+"</span></a></li>";
            htmlString += "\n\
                <li id='user_status_container' style='background: #bbd9ee; border-left-color: "+the_player_color+";' title='"+popupText+"' >\n\
                    <img src='../images/32x32/"+onlineStatusImage+".png' width='16' height='16'></img>\n\
                    "+playerAskForPeaceHTML+playerActionHTML+""+sendReminderHTML+"\n\
                    <span style='text-decoration:"+playerStateTextDecoration+"; font-size: 0.8em;'>\n\
                        "+user_name[1]+" ("+the_user_status[4]+")\n\
                    </span>\n\
                </li>";


        });
        htmlString += "</ul>";
        
        this.usc_div_main_element.update(htmlString);
    }
 });