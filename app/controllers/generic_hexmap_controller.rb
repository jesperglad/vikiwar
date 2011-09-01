class GenericHexmapController < ApplicationController

protected

  def current_region
    the_region = session[:region]

    if (!the_region)
      puts "id: #{params[:id]}"
      the_region = Region.find :first, :conditions => ["name = ?",params[:id]]
      if (the_region)
        gs = GameSession.find :first, :conditions => ["region_id = ? and state = 'META'", the_region.id]
        session[:region] = the_region
        session[:gs] = gs
      end
    end

    return the_region
  end

  def set_static_hexmap_layout
    @w_hex = 32
    @h_hex = 32
    @w_sqr_to_hex_conner = 8
    @h_sqr_to_hex_conner = 8

    @colors = GameSession.get_colors
    @colors_json = @colors.to_json

  end

  def set_region_depending_hexmap_layout the_region
    @w_hex_map = the_region.w_hex_map    
    @h_hex_map = the_region.h_hex_map
    @w_canvas = @w_hex * @w_hex_map +   @w_hex/2
    @h_canvas = (@h_hex - @h_sqr_to_hex_conner) * @h_hex_map + @h_sqr_to_hex_conner

  end

  def set_static_model
    @area_element_types_json = AreaElementType.find(:all).to_json
    @unit_types_json  = UnitType.create_unit_types_hash(current_user, current_game_session).to_json
    @terrains_json = Terrain.find(:all).to_json
  end

  def set_game_session_depending_model gs
    @area_elements_json = AreaElement.create_area_elements_hash(nil, nil, gs).to_json
    @units_json  = Unit.create_units_hash(nil, nil, gs).to_json

    @user_colors_json = gs.get_user_colors.to_json
    @num_of_players = gs.max_num_of_players;
  end

  def create_areas_model_and_imagemap the_region, hex_info_text_hash
    areas_array = Array.new
    @image_map =""    
    i = 0
    areas = Area.find :all, :conditions => ["region_id = ?",the_region.id]
    areas.each do |a|
      the_hex_info_text = ""
      if hex_info_text_hash
        value = hex_info_text_hash[a.position_index]
        if (value)
          the_hex_info_text = value
        end
      end
  
      areas_array[i] = [a.terrain.id, a.position_index]      
      x = get_area_pixel_x(a.position_index%@w_hex_map, a.position_index/@w_hex_map)
      y = get_area_pixel_y(a.position_index/@w_hex_map)
      @image_map = @image_map + "<area shape=\"poly\" coords=\""
      @image_map = @image_map +x.to_s+","+(@h_sqr_to_hex_conner+y).to_s+","
      @image_map = @image_map +(@w_hex/2+x).to_s+"," +y.to_s+","
      @image_map = @image_map +(@w_hex+x).to_s+","+(@h_sqr_to_hex_conner+y).to_s+","
      @image_map = @image_map +(@w_hex+x).to_s+","  +(@h_hex-@h_sqr_to_hex_conner + y).to_s+","
      @image_map = @image_map +(@w_hex/2+x).to_s+","+(@h_hex+y).to_s+","
      @image_map = @image_map +x.to_s+","+(@h_hex-@h_sqr_to_hex_conner + y).to_s

      @image_map = @image_map +"\" alt=\""+a.position_index.to_s+"\" onmousedown='return mouseDown(event);' onmouseup='return mouseUp(event);'  onmousemove='return mouseMove(event);' onclick=\"return c("+a.position_index.to_s+");\"onmouseover=\"return r("+a.position_index.to_s+", '"+the_hex_info_text+"');\" />\n"
      i = i + 1
    end
    @areas_array_json = areas_array.to_json
  end

  def get_area_pixel_x(x_location, y_location)
    d_x = 0
    if (y_location % 2 == 1 )
      d_x = @w_hex/2;
    end

    return x_location * @w_hex + d_x
  end
  
  def get_area_pixel_y(y_location)
      return (@h_hex - @w_sqr_to_hex_conner)*y_location
  end

end
