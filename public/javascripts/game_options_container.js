// -----------------------------------------------------------------------------------------------------------
//  View - Dynamic - Game Options Container
// -----------------------------------------------------------------------------------------------------------
var GameOptionsContainer = Class.create({   
    
    initialize: function(the_div_id, the_unit_types, the_images, the_user_color) {
        this.goc_div_id = the_div_id;
        this.unit_types = the_unit_types;
        this.goc_images = the_images;
        this.user_color = the_user_color
        
    
        this.goc_selected_element_image = $(new Image());
        $(this.goc_selected_element_image).src = this.goc_images["indicator_no_unit_selected_2"].src; 
        $(this.goc_selected_element_image).setStyle('position: relative; float: left; z-index: 0; top: 2px; left: -30px'); 
        
        $(this.goc_div_id).appendChild(this.goc_selected_element_image); 
    
        this.goc_unit_info_table = this.makeUnitInfoTable("button_delete_order_event();");
        this.goc_unit_info_table.hide();
        $(this.goc_div_id).appendChild(this.goc_unit_info_table);
        
        this.goc_area_element_info_table = this.makeAreaElementInfoTable();
        this.goc_area_element_info_table.hide();
        $(this.goc_div_id).appendChild(this.goc_area_element_info_table);
    },

    makeUnitInfoTable: function() {   
        var tableHTML = "<tr class=\'game_options_table_header\'>Orders</tr><tr class=\'game_options_table_body\' id=\'goc1\'>...</tr><tr class=\'game_options_table_body\' id=\'goc2\'>...</tr><tr class=\'game_options_table_body\' id=\'goc3\'>...</tr><tr><img onClick=\'button_delete_order_event();\' src=\'/images/32x32/button_clear_orders_not_pressed_active.png\'</tr>";
        var table = $(document.createElement("table"));
        table.writeAttribute("width", "80");
        
        table.update(tableHTML);
        return table;
    },
    
    makeAreaElementInfoTable: function(){
        var table = $(document.createElement("table"));
        table.writeAttribute("width", "160");
        table.appendChild(domCreateTableRow(1, "goc_ae_0", "blue", true, "<b>Building</b>"));                           
        
        var row_button = document.createElement("tr"); 
        row_button.setAttribute("bgcolor", "grey");
        var cell_select = $(document.createElement("td")); 
        var selectorsHTML = "<div id=\"div_build_unit_type\"><select name=\"build_unit_type\"><option value=\"nothing\">nothing</option>";
        this.unit_types.each(function (ut) {
            var ut_string = ""+ut.resource_cost+" - "+ut.name
            selectorsHTML += "<option value=\""+ut.name+"\">"+ut_string+"</option>"
        });
        selectorsHTML +="</select></div>"        
        cell_select.update(selectorsHTML);
        cell_select.observe('change', this.buildTypeSelected.bindAsEventListener(GameOptionsContainer, this));
        row_button.appendChild(cell_select);
        // table.appendChild(domCreateTableRow(1, "gocImage", "grey", true, the_button_image.toHTML()));

        // table.appendChild(header);
        table.appendChild(row_button);
        return table;
    },
    
    buildTypeSelected: function(event, this_goc) {
        the_order_type = "build"
        the_action = $('div_build_unit_type').down().getValue();
        if (the_action == "nothing") {
            remove_area_element_orders();
        } else {
            create_area_element_order(the_order_type, the_action);
        }        
    },
    
    cleanUp: function() {
        if (this.goc_element_type == "unit") {        
            this.goc_unit_info_table.hide();
            domSetTextElementTextById("goc1", "...");
            domSetTextElementTextById("goc2", "...");
            domSetTextElementTextById("goc3", "...");
            
            
            // var parent_element = document.getElementById(this.goc_div_id);
            // parent_element.removeChild(this.goc_unit_info_table); 
        } else if (this.goc_element_type == "area_element") {        
            this.goc_area_element_info_table.hide();
        }
    }, 
    
    updateGameOptionsContainer: function (the_selected_element, the_element_type) {
        this.cleanUp();
    
        this.goc_element_type = the_element_type;
        this.goc_selected_element = the_selected_element;
        
    
        if (this.goc_selected_element == null) {
            this.goc_selected_element_image.src = this.goc_images["indicator_no_unit_selected_2"].src; 

        } else if (this.goc_element_type == "unit") {                
            var ut = getUnitType(this.goc_selected_element);
            this.goc_selected_element_image.src = this.goc_images["unit_"+ut.name+"_"+this.user_color].src;
        
            if (doUnitHaveOrder(this.goc_selected_element)) {
                var num_of_orders = getUnitNumberOfOrders(this.goc_selected_element);
                for (var the_order_index = 0; the_order_index < num_of_orders; the_order_index++) {
                    var the_order_type = getUnitOrderTypeByIndex(this.goc_selected_element, the_order_index);
                    var the_order_loc_hex = getUnitOrderDestLocationHexByIndex(this.goc_selected_element, the_order_index);
              
                    domSetTextElementTextById("goc"+(the_order_index+1), ""+the_order_type);                    
                }
            }
            
            this.goc_unit_info_table.show();           
        } else if (this.goc_element_type == "area_element") {
            var the_area_element_type = getAreaElementType(this.goc_selected_element);
            this.goc_selected_element_image.src = this.goc_images["area_element_"+getAreaElementTypeName(the_area_element_type)+"_"+this.user_color].src
            
            if (doAreaElementHaveOrder(this.goc_selected_element)) {
                if  (getAreaElementOrderTypeByIndex(this.goc_selected_element,0) == "build") {
                    $('div_build_unit_type').down().setValue(getAreaElementOrderActionByIndex(this.goc_selected_element, 0));
                }
            } else {
                $('div_build_unit_type').down().setValue("nothing");
                remove_area_element_orders();
            }
            this.goc_area_element_info_table.show();
        }
  }
});