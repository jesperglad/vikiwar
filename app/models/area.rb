class Area < ActiveRecord::Base
  belongs_to :region  
  belongs_to :terrain
  
def Area.get_hex_x the_index, w_hex_map
    return the_index%w_hex_map;    
end

def Area.get_hex_y the_index, x_loc, w_hex_map
    return (the_index-x_loc)/w_hex_map;
end

def  Area.get_coordinate_string the_index, w_hex_map
  x_loc = Area.get_hex_x(the_index, w_hex_map)
  y_loc = Area.get_hex_y(the_index, x_loc, w_hex_map)
  return "(#{x_loc}, #{y_loc})"
end

def Area.remove_all_areas_in_region the_region_id
  Area.delete_all(["region_id = ?",the_region_id])
end

def is_any_units_in_area gs
    unit_in_area = Unit.unit_alive_in_hex self.position_index, gs
    
    if (unit_in_area == nil)
      return false
    else
      if unit_in_area.healt > 0
        return true
      end
    end

    return false
end

def get_unit_with_cargo_space_in_area gs
    return Unit.unit_alive_in_hex(self.position_index, gs)

    if (unit_in_area == nil)
      return false
    else            
      if ((unit_in_area.healt > 0) && (unit_in_area.unit_type.cargo_size > unit_in_area.units_in_cargo.size))
        return unit_in_area
      end
    end

      return nil
    end
end

def is_any_area_elements_in_area game_session
    area_elements_in_area = AreaElement.get_area_element_at_index self.position_index, game_session
    
    if (area_elements_in_area == nil) || (area_elements_in_area.length == 0)
      return false
      
    else
      return true      
      
    end 
end
