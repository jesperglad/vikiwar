function domSetTextElementTextById(the_id, the_text) {
        var index_ele = document.getElementById(the_id); 
        var  index_text_ele = index_ele.firstChild;
        index_text_ele.data =the_text;  
}

// **************************************************************
// Create Table Row
// **************************************************************
function domCreateTableRow(theNumOfCells, theDivId, theBGColor, isHeader, theText){    
    var rowEle = $(document.createElement("tr")); 
    if (isHeader) {
        rowEle.writeAttribute("class", "infotableheader");
    } else {
        rowEle.writeAttribute("class", "infotablebody");
    }
    
    
    // var cellType = isHeader ? 'td class=\"infotableheader\" ' : 'td class=\"infotablebody\" ';
    $R(0,theNumOfCells-1).each(function(item) {
        var theRowHTML = '<td><div id=\"'+theDivId+'\">'+theText+'</div></td>'
        rowEle.update(theRowHTML);
    });

    return rowEle;
}

// **************************************************************
// Count Down Timer
// **************************************************************
var __intervalID = null;
var __startTime = null;
var __duration = null;
var __divID = null;
var __timeoutCallBackFunction = null;
var __theTimeoutCallBackFunctionArguments = null;
function domCreateCountDownTimer(theStartTime, theDuration, theDivId, theTimeoutCallBackFunction, theTimeoutCallBackFunctionArguments) {
    __startTime = theStartTime;
    __duration = theDuration;
    __divID = theDivId;
    __timeoutCallBackFunction = theTimeoutCallBackFunction;
   __theTimeoutCallBackFunctionArguments = theTimeoutCallBackFunctionArguments;
    var d = new Date();
    var currentTime = d.getTime();
    var dT = theStartTime + theDuration - currentTime
    if (dT <= 0) {
        if (__intervalID != null) {
            clearInterval(__intervalID); 
            __intervalID = null;
        }
        theTimeoutCallBackFunction(__theTimeoutCallBackFunctionArguments);        
    } else if (__intervalID == null) {
        __intervalID = setInterval(updateCountDownTimer, 1000);
    } 
}

function updateCountDownTimer(){
    var d = new Date();
    var currentTime = d.getTime();
    var dT = __startTime + __duration - currentTime
    
    if (dT <= 0) {
        if (__intervalID != null) {
            clearInterval(__intervalID);         
            __intervalID = null;
            __timeoutCallBackFunction(__theTimeoutCallBackFunctionArguments);        
       }
    } else {  
        // dT = dT/1000;
        // var days = parseInt (dT/(60*60*24));
        // var hours = parseInt ((dT - days*60*60*24) / (60*60));
        // var minutes = parseInt ((dT - days*60*60*24 - hours*60*60)/60);
        // var seconds = parseInt ((dT - days*60*60*24 - hours*60*60 - minutes*60));
        
        domSetTextElementTextById(__divID, timeToString(dT));
    }    
}

function timeToString(theTime) {
    var dT = theTime/1000;
    var days = parseInt (dT/(60*60*24));
    var hours = parseInt ((dT - days*60*60*24) / (60*60));
    var minutes = parseInt ((dT - days*60*60*24 - hours*60*60)/60);
    var seconds = parseInt ((dT - days*60*60*24 - hours*60*60 - minutes*60));

    return ""+days+"d,"+hours+"h,"+minutes+"m,"+seconds+"s";
    
}

// **************************************************************
// Transparent overlay
// **************************************************************
var TransparentOverlay = Class.create({
    initialize: function(
        the_parent_div_id,
        the_positioning,
        the_bg_image_name,
        the_top, the_left, the_width, the_height, the_z_index)
    {
        this.parent_div_id = the_parent_div_id;
        this.trans_div = $(document.createElement("div"));
        $(this.trans_div).setAttribute("id", the_parent_div_id+"_trans");
        $(this.trans_div).setStyle("position: "+the_positioning+"; z-index: "+the_z_index+"; top: "+the_top+"px; left: "+the_left+"px; width: "+the_width+"px; height: "+the_height+"px; background: url(../images/32x32/"+the_bg_image_name+"); opacity: 1.0; border-radius: 3px; -webkit-border-radius: 3px; -moz-border-radius: 3px;");
        $(this.parent_div_id).appendChild(this.trans_div);
        $(this.parent_div_id).hide();
    },

    show: function() {
        $(this.parent_div_id).appear ();
    },

    hide: function() {
       $(this.parent_div_id).fade ();
    }
});

var TransparentOverlayWindow = Class.create(TransparentOverlay, {
    initialize: function(
        $super,
        the_parent_div_id,
        the_bg_image_name,
        the_z_index)
    {
        $super(
            the_parent_div_id,
            "fixed",
            the_bg_image_name,
            0, 0, window.innerWidth, window.innerHeight, the_z_index);
    }
});

// **************************************************************
// Popup Box Parent
// **************************************************************
var PopupBox = Class.create({
    initialize: function(
        the_popup_box_id,
        the_parent_div_id,
        the_header_txt,
        the_body_txt,
        doShowHeader,
        the_z_index,
        the_popup_width,
        the_popup_height,
        the_bg_image_name)
    {
        this.popup_box_id = the_popup_box_id;
        this.parent_div_id = the_parent_div_id;
        
        this.header_txt = the_header_txt;
        this.body_txt = the_body_txt;
        this.showHeader = doShowHeader;
        this.z_index = the_z_index;
        this.bg_image_name = the_bg_image_name;

        this.bodyTextAlignement = "left";

        this.screenWidth = 760;
        this.popupWidth = the_popup_width;
        this.popupHeight = the_popup_height;

        var popupHTML = "";
        if (this.showHeader) {
            popupHTML = "\
                <div id='"+this.popup_box_id+"' style='z-index: "+this.z_index+"; left: "+((this.screenWidth-this.popupWidth)/2+120)+"px;'>\n\
                    <div id='"+this.popup_box_id+"_wapper' style='width: "+(this.popupWidth-20)+";'>\n\
                        <div id='"+this.popup_box_id+"_header'>"+this.header_txt+"</div>\n\
                        <div id='"+this.popup_box_id+"_body'>"+this.body_txt+"</div>\n\
                        <div id='"+this.popup_box_id+"_button_list'></div>\n\
                    </div>\n\
                </div>";
        } else {
            popupHTML = "\
                <div id='"+this.popup_box_id+"' style='z-index: "+this.z_index+"; left: "+((this.screenWidth-this.popupWidth)/2+120)+"px;'>\n\
                    <div id='"+this.popup_box_id+"_wapper' style='width: "+(this.popupWidth-20)+";'>\n\
                        <div id='"+this.popup_box_id+"_body'>"+this.body_txt+"</div>\n\
                        <div id='"+this.popup_box_id+"_button_list'></div>\n\
                    </div>\n\
                </div>";            
        }
        $(this.parent_div_id).update(popupHTML);
        this.transparentOverlay = new TransparentOverlayWindow (this.popup_box_id, this.bg_image_name, 0);
    },

    setHeaderText: function(the_txt, the_font_style_size){
        this.header_txt = the_txt;
        $(this.popup_box_id+"_header").setStyle ("font-size: "+the_font_style_size);
        $(this.popup_box_id+"_header").update(this.header_txt);

    },

    setBodyText: function(the_txt, the_font_style_size){
        this.body_txt = the_txt;
        $(this.popup_box_id+"_body").setStyle ("font-size: "+the_font_style_size);
        $(this.popup_box_id+"_body").setStyle ("z-index: 1");
        $(this.popup_box_id+"_body").update(this.body_txt);

    },

    setBodyTextAlignment: function(theAlignemt) {
        this.bodyTextAlignement = theAlignemt;
        $(this.popup_box_id+"_body").setStyle ("text-align: "+this.bodyTextAlignement);
    },

    
    show: function() {
        $(this.popup_box_id).appear();

    },

    hide: function() {
       $(this.popup_box_id).fade();
    }
});

// **************************************************************
// Popup YesNoBox
// **************************************************************
var PopupYesNoBox = Class.create(PopupBox, {
    initialize: function(
        $super,
        the_popup_yesnobox_id,
        the_parent_div_id,
        the_header_txt,
        the_body_txt,
        the_z_index,
        the_bg_image_name,
        the_yes_txt,
        the_no_txt,
        the_yes_callback_fkt_name,
        the_no_callback_fkt_name
    ) {
        $super(the_popup_yesnobox_id, the_parent_div_id, the_header_txt, the_body_txt, true, the_z_index, 300, 300, the_bg_image_name);
        this.yes_txt = the_yes_txt;
        this.no_txt = the_no_txt;
        this.yes_callback_fkt_name = the_yes_callback_fkt_name;
        this.no_callback_fkt_name = the_no_callback_fkt_name;
        this.update_button_list();

        $(the_popup_yesnobox_id).hide();
    },

    update_button_list: function() {
        $(this.popup_box_id+"_button_list").update("<ul class='popup_button_list'><li id='popup_button' onClick='"+this.no_callback_fkt_name+"();'>"+this.no_txt+"</li><li id='popup_button' onClick='"+this.yes_callback_fkt_name+"();'>"+this.yes_txt+"</li></ul>");
    },

    doShow: function(the_header_txt, the_body_txt, the_yes_callback_fkt_name, the_no_callback_fkt_name) {
        this.yes_callback_fkt_name = the_yes_callback_fkt_name;
        this.no_callback_fkt_name = the_no_callback_fkt_name;

        $(this.popup_box_id+"_header").update(the_header_txt);
        $(this.popup_box_id+"_body").update(the_body_txt);
        this.update_button_list();
        $(this.popup_box_id).appear();
    }
});

// **************************************************************
// Popup Textbox
// **************************************************************
var PopupTextBox = Class.create({    
    initialize: function(
        the_popup_textbox_id,
        the_parent_div_id,
        the_header_txt,
        the_body_txt, 
        the_z_index, 
        the_bg_image_name)
    {
        this.popup_textbox_id = the_popup_textbox_id;
        this.parent_div_id = the_parent_div_id;
        this.header_txt = the_header_txt;
        this.body_txt = the_body_txt;
        this.zIndex = the_z_index;
        this.bgImage = the_bg_image_name;
        this.bodyTextAlignement = "left";
        this.callBackFkt = "button_textbox_close();"
        this.screenWidth = 760;
        this.popupWidth = 300;

        this.update();
    },

    update: function() {
        var popupHTML = "\n\
            <div id='"+this.popup_textbox_id+"' style='z-index: "+this.zIndex+"; left: "+((this.screenWidth-this.popupWidth)/2+120)+"px;'>\n\
                <div id='popup_text_wapper' style='width: "+(this.popupWidth-20)+";'>\n\
                    <div id='popup_textbox_header'>"+
                        this.header_txt+
                   "</div>\n\
                    <div id='popup_textbox_body' style='text-align: "+this.bodyTextAlignement+";'>"+
                        this.body_txt+
                   "</div>\n\
                    <div id='popup_button_list'>\n\
                        <ul class='popup_button_list'>\n\
                            <li id='popup_button' onClick='"+this.callBackFkt+"'>\n\
                                Close\n\
                            </li>\n\
                        </ul>\n\
                    </div>\n\
                </div>\n\
            </div>";
        
        $(this.parent_div_id).update(popupHTML);
        this.transparentOverlay = new TransparentOverlayWindow (this.popup_textbox_id, this.bgImage, 0);
        $(this.popup_textbox_id).hide();
    },
    
    setHeaderText: function(the_txt, the_font_style_size){
        this.header_txt = the_txt;
        $("popup_textbox_header").setStyle ("font-size: "+the_font_style_size);
        $("popup_textbox_header").update(this.header_txt);

    },

    setBodyText: function(the_txt, the_font_style_size){
        this.body_txt = the_txt;
        $("popup_textbox_body").setStyle ("font-size: "+the_font_style_size);
        $("popup_textbox_body").update(this.body_txt);
    },

    setBackgroundImage: function(theBGImageName) {
        this.bgImage = theBGImageName;
    },
    
    setBodyTextAlignment: function(theAlignemt) {
        this.bodyTextAlignement = theAlignemt;
        $("popup_textbox_body").setStyle ("text-align: "+this.bodyTextAlignement);
    },   

    updateAndShow: function (theHeaderTxt, theHeaderFontSize, theBodyTxt, theBodyFontSize, textAligment, callBackFkt) {
        this.callBackFkt = callBackFkt;
        this.update();

        this.setHeaderText(theHeaderTxt,theHeaderFontSize);
        this.setBodyText(theBodyTxt,theBodyFontSize);
        this.setBodyTextAlignment(textAligment);
        
        $(this.popup_textbox_id).appear ();
    },
    
    hide: function() {       
       $(this.popup_textbox_id).fade ();
    }
});


// **************************************************************
// Popup List Selection Box
// **************************************************************
var PopupListSelectionBox = Class.create({    
    initialize: function(
        the_popup_box_id, 
        the_parent_div_id,  
        the_header_txt,
        the_body_txt,        
        the_z_index, 
        the_bg_image_name,
        the_unit_types,
        the_user_color)
    {
        this.parent_div_id = the_parent_div_id;
        this.popup_box_id = the_popup_box_id;
        this.header_txt = the_header_txt;
        this.unit_types = the_unit_types;
        this.user_color = the_user_color;
        this.unit_to_build = null;

        this.screenWidth = 760;
        this.popupWidth = 300;
        
        var popupHTML = "<div id='"+this.popup_box_id+"' style='z-index: "+the_z_index+"; left: "+((this.screenWidth-this.popupWidth)/2 + 120)+"px;'><div id='popup_text_wapper' style='width: "+(this.popupWidth-20)+";' ><div id='popup_header'>"+this.header_txt+"</div><div id='popup_body'>"+the_body_txt+"</div><div id='popup_button_list'><ul class='popup_button_list'><li id='popup_button' onClick='button_selection_list_close();'>Close</li><li id='popup_button' onClick='plsb.button_cancel_build_pressed();'>Cancel Build</li><li id='popup_button' onClick='plsb.button_build_pressed();'>Build</li></ul></div></div></div>";
        $(this.parent_div_id).update(popupHTML);                    
        this.transparentOverlay = new TransparentOverlayWindow (this.popup_box_id, the_bg_image_name, 0);
        $(this.popup_box_id).hide();
    },    

    createUnitTypeText: function (ut, the_selected_element_name, resources) {
        var selection_list_HTML = "";
        var ut_string = ""+hexMap.units.getUnitTypeResourceCost(ut)+" - "+hexMap.units.getUnitTypeMaintenanceCost(ut)+" - "+hexMap.units.getUnitTypeName(ut);
        var aeTypeName = hexMap.areaElements.getAreaElementTypeName(hexMap.areaElements.getAreaElementType(this.selectedElement));

        if ((_gs.getGSLevel() >= hexMap.units.getUnitTypeLevel(ut)) && (hexMap.units.getUnitTypeIsAllowedToBuild(ut)) && (hexMap.units.canUnitTypeBeBuildByAreaElement(ut, aeTypeName))) {
            if (the_selected_element_name == hexMap.units.getUnitTypeName(ut)) {
                selection_list_HTML += "<li id='popup_selection_list_selected'";
            } else {
                selection_list_HTML += "<li id='popup_selection_list_not_selected'";
            }

            if (hexMap.units.getUnitTypeResourceCost(ut) <= resources) {
                selection_list_HTML += "onClick='plsb.element_selected(\""+hexMap.units.getUnitTypeName(ut)+"\");' style='background: top left url(../images/32x32/unit_"+hexMap.units.getUnitTypeName(ut)+"_"+this.user_color+"_32x32.png) no-repeat;'>"+ut_string+"</li>";
            } else {
                selection_list_HTML += "style='background: top left url(../images/32x32/unit_"+hexMap.units.getUnitTypeName(ut)+"_"+this.user_color+"_32x32.png) no-repeat; color: #666666'>"+ut_string+"</li>";
            }

        }

        return selection_list_HTML;
    },
    
    show: function(the_selected_element, the_element_type, resources) {
        this.selectedElement = the_selected_element;
        
        this.resources = resources;
        $("popup_header").update("Select Unit To Build (Gold: "+resources+")");
        if (the_element_type == "area_element") {
            // var the_area_element_type = areaElements.getAreaElementType(the_selected_element);
            // this.goc_selected_element_image.src = this.goc_images["area_element_"+areaElements.getAreaElementTypeName(the_area_element_type)+"_"+this.user_color].src
    
            var the_unit_type_name = null;
            this.unit_to_build = null;
            if (hexMap.areaElements.doAreaElementHaveOrder(the_selected_element)) {
                if  (hexMap.areaElements.getAreaElementOrderTypeByIndex(the_selected_element,0) == "build") {
                    this.unit_to_build = the_unit_type_name = hexMap.areaElements.getAreaElementOrderActionByIndex(the_selected_element, 0);
                }
            }
                
            // $('div_build_unit_type').down().setValue(getAreaElementOrderActionByIndex(this.goc_selected_element, 0));
            var selection_list_HTML = "<ul class='popup_selection_list'>";
            // var the_user_color = this.user_color;
            var theThis = this;
            this.unit_types.each(function (ut) {
                selection_list_HTML += theThis.createUnitTypeText(ut, the_unit_type_name, this.resources);
                
            });
            selection_list_HTML += "</ul>"
            $("popup_body").update(selection_list_HTML);                        
        }

        $(this.popup_box_id).appear ();        
    },
    
    hide: function() {       
       $(this.popup_box_id).fade ();
    },

    element_selected: function(the_selected_element_name) {
        this.unit_to_build = this.selected_element_name = the_selected_element_name;
        var selection_list_HTML = "<ul class='popup_selection_list'>";
        // var the_user_color = this.user_color;
        var theThis = this;
        this.unit_types.each(function (ut) {
            selection_list_HTML += theThis.createUnitTypeText(ut, the_selected_element_name, this.resources);

            // var ut_string = ""+hexMap.units.getUnitTypeResourceCost(ut)+" - "+hexMap.units.getUnitTypeMaintenanceCost(ut)+" - "+hexMap.units.getUnitTypeName(ut);
            //
            // if (the_selected_element_name == hexMap.units.getUnitTypeName(ut)) {
            //    selection_list_HTML += "<li id='popup_selection_list_selected'";
            // } else {
            //     selection_list_HTML += "<li id='popup_selection_list_not_selected'";
            // }
            // selection_list_HTML += "onClick='plsb.element_selected(\""+hexMap.units.getUnitTypeName(ut)+"\");' style='background: top left url(../images/32x32/unit_"+hexMap.units.getUnitTypeName(ut)+"_"+the_user_color+"_32x32.png) no-repeat;'>"+ut_string+"</li>";
        });
        selection_list_HTML += "</ul>"
        $("popup_body").update(selection_list_HTML);                        
    },

    button_build_pressed: function() {
        button_selection_list_build(this.unit_to_build);
    },

    button_cancel_build_pressed: function() {
        this.unit_to_build = null;
        this.selected_element_name = null;
        button_selection_list_cancel_build();
    }
});

// **************************************************************
// Popup Game Sessions Selection Box
// **************************************************************
var PopupGameSessionsBox = Class.create({
    initialize: function( 
        the_parent_div_id,  
        the_header_txt,
        the_body_txt,
        the_bg_image_name)
    {
        this.parent_div_id = the_parent_div_id;
        this.header_txt = the_header_txt;

        this.screenWidth = 760;
        this.popupWidth = 300;
        
        var popupHTML = "\
        	<div id='popup_game_sessions_selection_box' style='z-index: 30000; left: "+((this.screenWidth-this.popupWidth)/2 + 120)+"px;'>\
       		<div id='popup_text_wapper' style='width: "+(this.popupWidth-20)+"px;' >\
       			<div id='popup_header'>"+this.header_txt+"</div>\
       			<div id='popup_game_sessions_selection_body'>"+the_body_txt+"</div>\
       			<div id='popup_button_list'>\
       				<ul class='popup_button_list'>\
       					<li id='popup_button' onClick='button_game_sessions_box_close();'>Close</li>\
       				</ul>\
       			</div>\
       		</div>\
       		</div>";
       		
        $(this.parent_div_id).update(popupHTML);                    
        this.transparentOverlay = new TransparentOverlayWindow ('popup_game_sessions_selection_box', the_bg_image_name, 0);
        $('popup_game_sessions_selection_box').hide();
    },    
    
    show: function(the_game_sessions) {
    	this.game_sessions = $A(the_game_sessions);
        
        this.htmlGSList = "Battlers where your men are awaiting your orders: <div id='game_session_my_battle'><ul class='popup_game_sessions_selection_list'>";
        theThis = this;
        this.game_sessions.each(function(gs) {
        	if ((_gsName == undefined) || (gs.name != _gsName)) { // _gsName is set in _map
   				theThis.htmlGSList += "<li><div class='game_sessions_wait_for_orders'>";                  
        		theThis.htmlGSList += "<b><a href='"+SERVER+"main/set_game_session/"+gs.id+"'>"+gs.name+"</a>";        	
        		theThis.htmlGSList += "</li>";
        	} 
        });               
        $("popup_game_sessions_selection_body").update(this.htmlGSList);                                
        $("popup_game_sessions_selection_box").appear ();        
    },
    
    hide: function() {       
       $('popup_game_sessions_selection_box').fade ();
    }
});

// **************************************************************
// Popup Killed/Peace Notificatin Box
// **************************************************************
// var PopupKilledPeaceInfoBox = Class.create({
//    initialize: function(
//        the_popup_textbox_id,
//        the_parent_div_id,
//        the_header_txt,
//        the_body_txt,
//        the_z_index,
//        the_bg_image_name)
//    {
//        this.parent_div_id = the_parent_div_id;
//        this.popup_textbox_id = the_popup_textbox_id;
//        this.header_txt = the_header_txt;
//        this.body_txt = the_body_txt;
//        this.zIndex = the_z_index;
//        this.bgImage = the_bg_image_name;
//        this.bodyTextAlignement = "left";
//        this.callBackFkt = "button_textbox_close();"
//        this.screenWidth = 760;
//        this.popupWidth = 300;
//
//        this.imagePeaceTxt = "<p><img src='/images/Vikiwar_white.png' width='200' /></p>";
//        this.imageSurrenderTxt = "<p><img src='/images/Vikiwar_surrender.png' width='200' /></p>";
//
//        this.update();
//    },
//
//    update: function() {
//        var popupHTML = "<div id='"+this.popup_textbox_id+"' style='z-index: "+this.zIndex+"; left: "+((this.screenWidth-this.popupWidth)/2)+"px;'><div id='popup_text_wapper' style='width: "+(this.popupWidth-20)+";'><div id='popup_textbox_header'>"+this.header_txt+"</div><div id='popup_textbox_body' style='text-align: "+this.bodyTextAlignement+";'>"+this.body_txt+"</div><div id='popup_button_list'><ul class='popup_button_list'><li id='popup_button' onClick='"+this.callBackFkt+"'>Close</li></ul></div></div></div>";
//        $(this.parent_div_id).update(popupHTML);
//        this.transparentOverlay = new TransparentOverlayWindow (this.popup_textbox_id, this.bgImage, 0);
//        $(this.popup_textbox_id).hide();
//    },
//
//    setHeaderText: function(the_txt, the_font_style_size){
//        this.header_txt = the_txt;
//        $("popup_textbox_header").setStyle ("font-size: "+the_font_style_size);
//        $("popup_textbox_header").update(this.header_txt);
//
//    },
//
//    setBodyText: function(the_txt, the_font_style_size){
//        this.body_txt = the_txt;
//        $("popup_textbox_body").setStyle ("font-size: "+the_font_style_size);
//        $("popup_textbox_body").update(this.body_txt);
//    },
//
//    setBodyTextAlignment: function(theAlignemt) {
//        this.bodyTextAlignement = theAlignemt;
//        $("popup_textbox_body").setStyle ("text-align: "+this.bodyTextAlignement);
//    },
//
//    updateAndShow: function (theHeaderTxt, theHeaderFontSize, theBodyTxt, theBodyFontSize, textAligment, callBackFkt) {
//        this.callBackFkt = callBackFkt;
//        this.update();
//
//        this.setHeaderText(theHeaderTxt,theHeaderFontSize);
//        this.setBodyText(theBodyTxt,theBodyFontSize);
//        this.setBodyTextAlignment(textAligment);
//
//        $(this.popup_textbox_id).appear ();
//    },
//
//    hide: function() {
//       $(this.popup_textbox_id).fade ();
//    }
// });

// **************************************************************
// Popup Options Box minimap, stats, surrender, peace, ...
// **************************************************************
var PopupOptionsBox = Class.create(PopupBox, {
    initialize: function(
        $super, the_popup_options_id, the_parent_div_id, the_header_txt, the_body_txt,
        the_current_user_state, the_users_state, the_user_names, the_num_of_cities, the_region_name,
        theHostName, theDurationBetweenTurns, the_current_user_name, the_user_colors,
        the_z_index, the_bg_image_name, the_apply_callback_fkt_name, the_cancel_callback_fkt_name)
    {
        $super(the_popup_options_id, the_parent_div_id, the_header_txt, the_body_txt, false, the_z_index, 570, 300, the_bg_image_name);
        this.current_user_state = the_current_user_state;
        this.users_state = the_users_state;
        this.numOfCities = this.statisticsToS(the_num_of_cities);
        this.user_names = the_user_names;
        this.hostName = theHostName;
        this.durationBetweenTurns = theDurationBetweenTurns;
        this.current_user_name = the_current_user_name;
        this.user_colors = the_user_colors;
        this.region_name = the_region_name;
        this.apply_callback_fkt_name = the_apply_callback_fkt_name;
        this.cancel_callback_fkt_name = the_cancel_callback_fkt_name;

        this.userStatusC = null;

        this.middleHTML = "\n\
        <div id='popup_options_body_middle'>\n\
            "+this.body_txt+"\n\
        </div>";

        this.optionsPeaceAndSurrenderHTML = "\n\
            Is the easy way out your way?\n\
            <form>\n\
                <input id='popup_checkbox_peace' type='radio' name='game_options' value='ask_for_peace'></input>Ask for peace<br>\n\
                <input id='popup_checkbox_surrender' type='radio' name='game_options' value='surrender'></input>Surrender\n\
            </form>";

        this.optionsJoinAndRejectHTML = "\n\
            Do you have what it take to join this battle?\n\
            <form>\n\
                <input id='popup_checkbox_join' type='radio' name='game_options' value='join' checked='checked'></input>Join<br>\n\
                <input id='popup_checkbox_reject' type='radio' name='game_options' value='reject'></input>Reject\n\
            </form>";

        this.optionsDropBattleHTML = "\n\
            This can be settled in peace (chicken?):\n\
            <form>\n\
                <input id='popup_checkbox_drop_battle' type='checkbox' name='game_options' value='drop_battle'></input>Drop the battle<br>\n\
            </form>";

        this.topHTML = this.getTopHTML();
        this.updateContent();

        $(this.popup_box_id+"_button_list").update("<ul class='popup_button_list'><li id='popup_button' onClick='"+this.cancel_callback_fkt_name+"();'>Close</li><li id='popup_button' onClick='"+this.apply_callback_fkt_name+"();'>Apply</li></ul>");
        $(the_popup_options_id).hide();
    },

    getOptionsHTML: function() {
        
        if ((_gs.getState() == GameSessionModel.GS_STATES.Starting) && (this.hostName == this.current_user_name)) {
            return this.optionsDropBattleHTML;

        } else if (this.current_user_state == "active") {
            return this.optionsPeaceAndSurrenderHTML;

        }

        return this.optionsJoinAndRejectHTML;        
    },
    
    getTopHTML: function() {
        var battleStateHTML = "<p>Map level "+_gs.getGSLevel()+".<br>";

        if (_gs.getState() == GameSessionModel.GS_STATES.Starting) {
            battleStateHTML += "Battle is about to start (Turn duration: "+timeToString(this.durationBetweenTurns)+").";
        } else if (_gs.getState() == GameSessionModel.GS_STATES.Active) {
            battleStateHTML += "The battle is ongoing.";
        } else if (_gs.getState() == GameSessionModel.GS_STATES.Ended) {
            battleStateHTML += "The battle has come to an end.";
        }        
        battleStateHTML += "</p>";
        return "\n\
            <div id='popup_options_map_icon'>\n\
                <a href='images/"+this.region_name+".png' target='_blank'> <img height='75' width='75' src='images/32x32/"+this.region_name+".png' /></a>\n\
            </div>\n\
            <div id='"+this.popup_box_id+"_header'>"+this.header_txt+"</div>\n\
            <span id='popup_options_subheader'>"+battleStateHTML+"</span>";

//        return "\n\
//        <span id='popup_options_subheader'>"+battleStateHTML+"</span>\n\
//        <div id='popup_options_body_top'>\n\
//            <div id='popup_options_body_top_left'>\n\
//                <a href='images/"+this.region_name+".png' target='_blank'> <img src='images/32x32/"+this.region_name+".png' /></a>\n\
//            </div>\n\
//            <div id='popup_options_body_top_right'>\n\
//                "+topRightHTML+"\n\
//            </div>\n\
//        </div>";
    },

    getBottomHTML: function() {
        return "\n\
            <div id='popup_options_body_bottom'>\n\
                <div id='popup_options_cities_chart'>\n\
                    <img id='num_of_cities_piechart' src='http://chart.apis.google.com/chart?cht=p3&chtt=Cities&chts=eeeeee,13&chs=170x100&chd=t:"+this.numOfCities+"&chf=bg,s,00000000&chco=002BFF|FF0000|2DFF00|A500FF|FFEA00'&chof=gif/>\n\
                </div>\n\
                <div id='popup_options_options'>\n\
                    "+this.getOptionsHTML()+"\n\
                </div>\n\
            </div>";
    },

    updateContent: function() {
        // $(this.popup_box_id+"_body").update(
        //    this.getTopHTML()+this.middleHTML+this.getBottomHTML()
        // );

        $(this.popup_box_id+"_body").update(
            this.getTopHTML()+this.middleHTML+this.getBottomHTML()
        );

        // this.userStatusC = new UserStatusContainer(
        //        "popup_options_body_bottom_right", this.hostName, this.current_user_name, this.user_names, this.user_colors);

        // this.setUsersState(this.users_state);
    },

    statisticsToS: function (theStatistics) {
        var retS = "";
        var i = 0;

        theStatistics.each(function(stat_row) {
            if (i > 0) { retS += ","; }
            retS += stat_row[1];
            i++;
        });

        return retS;
    },

    setCurrentUserState: function(theState) {
        this.current_user_state = theState;
    },

    setUsersState: function(theUsersState) {
        this.users_state = theUsersState;
        // this.userStatusC.setUsersStatus(theUsersState);
    },

// <img id='num_of_cities_piechart' src='http://chart.apis.google.com/chart?cht=p3&chs=250x100&chd=t:"+this.num_of_cities+"&chl="+this.user_names+"&chf=bg,s,000000&chco=002BFF|FF0000|2DFF00|A500FF|FFEA00' />");
    setNumOfCities: function(theNumOfCities) {
        this.numOfCities = this.statisticsToS(theNumOfCities);
        this.updateContent();
    },

    getCheckboxValue: function(theCheckBoxItem) {
        if ($("popup_checkbox_"+theCheckBoxItem) == null) {
            return null;
        }

        return $("popup_checkbox_"+theCheckBoxItem).getValue();
    },

    show: function(doAskForPeace, theCurrentUserState) {
        this.setCurrentUserState(theCurrentUserState);

        if ($("popup_checkbox_peace") != null) {
            if (doAskForPeace) {
                $("popup_checkbox_peace").setValue("ask_for_peace");
            } else {
                $("popup_checkbox_peace").setValue(null);
            }
        }

        this.updateContent();

        $(this.popup_box_id).appear ();
    }
});

var LazyLoadingOverlay = Class.create({
    initialize: function(
        theParentNote,
        theBodyTxt,
        the_positioning,
        theBgImageName,
        the_image_top, the_image_left,
        the_top, the_left, the_width, the_height, the_z_index)
    {
        this.rootId = theParentNote;                        
        
        var theHtml = "\n\
            <div id='"+this.rootId+"_llo_root' style='position: absolute; z-index: 30000; top:"+the_image_top+"px; left: "+the_image_left+"px;'>\n\
            "+theBodyTxt+"\n\
                <div id='"+this.rootId+"_llo_animation'>\
                    <img id='"+this.rootId+"_llo_animation_img' src='images/32x32/loader_red.gif' />\n\
                </div>\n\
            </div>";        
        $(this.rootId).update(theHtml);
        this.transparentOverlay = new TransparentOverlay (""+this.rootId+"_llo_root", the_positioning, theBgImageName, the_top, the_left, the_width, the_height, the_z_index);
        
        $(""+this.rootId+"_llo_root").hide();
    },
    
    show: function() {
        $(""+this.rootId+"_llo_root").show();
    },

    hide: function() {
        $(""+this.rootId+"_llo_root").hide();
    }
});