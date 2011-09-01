var ResourcesInfoContainer = Class.create({ 
    initialize: function(the_div_id, the_resources) {
        this.resources = the_resources
        
        this.ric_div_main_element = $(document.createElement("div"));
        this.ric_div_main_element.writeAttribute("id","resouse_info_container");
        
        var ricHTML = "Resources: "+this.resources
        this.ric_div_main_element.update(ricHTML);
        $(the_div_id).appendChild(this.ric_div_main_element);
    },
    
    setResources: function(the_resources) {
        this.resources = the_resources
        
        var ricHTML = "Resources: "+this.resources
        this.ric_div_main_element.update(ricHTML);
    }
 });