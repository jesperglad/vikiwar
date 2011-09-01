class MainController < GenericHexmapController  
  before_filter :require_user
  
private

# TODO update all to use @game_session
# def set_game_session
#  @game_session = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "
# end

# TODO update all to use @current_user
# def set_current_user
#  user_id = session[:user_id]
#  @current_user = User.find :first, :conditions => "id = '#{user_id}'"
# end

def find_visible_hexs(units_owned_by_user, area_elements_owned_by_user,  the_region) 
  visible_hexs_hash = Hash.new

  area_elements_owned_by_user.each do |the_area_element| 
      range = the_area_element.area_element_type.sight_range
      area = Area.find :first, :conditions => ["region_id = ? and position_index = ?",the_region.id, the_area_element.location_hex_index] # the_region.areas.find :first, :conditions => ["position_index = ?",the_area_element.location_hex_index]
      # puts "\tarea.id = #{area.id}, area.terrain.name = #{area.terrain.name}"
      if (area.terrain.name == "hills")
        # puts "\thills"
        range += 1
      elsif (area.terrain.name == "mountains")
        # puts "\tmountains"
        range += 2
      end

      hexs = the_region.get_areas_within_range(the_area_element.location_hex_index, range)
      hexs.each do |hex| 
        visible_hexs_hash[hex] ="=>0"
      end
  end
  
  units_owned_by_user.each do |the_unit|
      if !the_unit.embak?
        the_unit_type = the_unit.unit_type

        range = the_unit_type.sight_range
        area = the_region.areas.find :first, :conditions => ["position_index = ?",the_unit.location_hex_index]
        if (area.terrain.name == "hills")
          range += 1
        elsif (area.terrain.name == "mountains")
          range += 2
        end

        hexs = the_region.get_areas_within_range(the_unit.location_hex_index, range)
        hexs.each do |hex|
          visible_hexs_hash[hex] ="=>0"
        end
      end
  end
  
  return visible_hexs_hash.keys
end

# private
# def create_battle_report gs
#    update_game_data session[:user_id], gs
#
#    @visible_hexs_before = []
#    @visible_hexs |= find_visible_hexs(units_ownder_by_user_before, area_elements_owned_by_user, the_region)
#
#    visible_hexes_now_and_before = @visible_hexs | @visible_hexs_before
#
#    @units_before
#    @units
#
# end


def update_game_data the_user_id, current_game_session
    @the_user_id = the_user_id
    @the_user = User.find :first, :conditions => ["id = ?",@the_user_id]
    
    the_region  = current_game_session.region
    
    set_static_hexmap_layout
    set_region_depending_hexmap_layout the_region
    
    #
    # GSUS depending
    #
    gsus = current_game_session.game_session_user_statuses.find :first, :conditions => ["user_id = ?",@the_user_id]
    
    # Is current user active player in the game
    if (gsus)
      @current_user_state = gsus.state
      @current_user_ask_for_peace = gsus.ask_for_peace

      @resources = gsus.resources
      @income = gsus.income
      @expenses = gsus.expenses

      if gsus.orders_recived
        @orders_send_status = "sent"
      else
        @orders_send_status = "not send"
      end
    else
      @current_user_state = "ghost"
      @current_user_ask_for_peace = false

      @resources = 0
      @income = 0
      @expenses = 0
      @orders_send_status = "sent"      
    end

    #
    # Time related
    #
    dt = Time.parse(current_game_session.latest_turn_ended_at.to_s)
    @latest_turn_ended_at = dt.to_i * 1000      
   
    area_elements_owned_by_user = AreaElement.find(:all, :conditions => ["user_id = ? AND game_session_id = ? ", @the_user_id, current_game_session.id])
    units_owned_by_user = Unit.units_alive_from_user_id @the_user_id, current_game_session

    @visible_hexs = find_visible_hexs(units_owned_by_user, area_elements_owned_by_user, the_region)

    @visible_hexs_json = @visible_hexs.to_json
    # puts "@visible_hexs_json: "+@visible_hexs_json.to_s
   
    area_elements_h = AreaElement.create_area_elements_hash(@the_user_id, @visible_hexs, current_game_session)
    @area_elements_json = area_elements_h.to_json
    # puts " @area_elements_json: "+ @area_elements_json.to_s
     
    units_h = Unit.create_units_hash(@the_user_id, @visible_hexs, current_game_session)
    @units_json  = units_h.to_json
    # puts "@units_json: "+@units_json.to_s    

    @game_session_state = current_game_session.state

    @users_status = current_game_session.get_users_status.to_json
    @statistics_data_table_json = current_game_session.statistics.to_json
    
    # @former_turn_results_text = create_former_turn_results_text @the_user_id, current_game_session
    # @former_turn_results_text_json = former_turn_results_text.to_json
end

def set_static_game_data
    @the_user_id = current_user.id
    set_static_hexmap_layout
    set_static_model

    # For the map
    # 
    terrains = Terrain.find(:all)
    @terrains_json = terrains.to_json
    # puts "@terrains_json: "+@terrains_json.to_s    
    
    @gs = GameSession.find :first, :conditions => ["id = ? ",session[:game_session_id]]
    @host_name = @gs.host.in_game_name
    @get_users_name_json = @gs.get_users_name.to_json
    @user_colors_json = @gs.get_user_colors.to_json
    @game_session_name = @gs.name
    @game_session_level = @gs.level
    
    @duration_between_turns = @gs.duration_between_turns
    # puts("current_game_session.latest_turn_ended_at: "+ current_game_session.latest_turn_ended_at.to_s)
    dt = Time.parse(@gs.latest_turn_ended_at.to_s)
    @latest_turn_ended_at = dt.to_i * 1000
    @current_turn_number = @gs.current_turn_number
    
    @the_region_name  = @gs.region.name
    the_region = Region.find(:first, :conditions => ["name = ?",@the_region_name])
    @the_region_description = the_region.description

    open_regions = Region.find(:all, :conditions => ["access_region_id = ?", @gs.region.id])
    the_open_regions = Array.new
    open_regions.each {|r|
      the_open_regions.push(r.name)
    }
    @the_open_regions_json = the_open_regions.to_json
    
    set_region_depending_hexmap_layout the_region    
    create_areas_model_and_imagemap the_region, nil
 end

def create_game_data_for_a_single_player gs, gsus
  # Do we already have a saved version of the game data
  if gsus.game_data_turn != gs.current_turn_number    
    gsus.hist_game_data_json = gsus.game_data_json # Store the old data for later uses

    update_game_data gsus.user_id, gs
    current_turn_game_data = [gs.current_turn_number, @latest_turn_ended_at, @visible_hexs_json, @area_elements_json, @units_json, @resources, @income, @expenses, @game_session_state, @former_turn_results_text_json, @statistics_data_table_json]
    current_turn_game_data_json = current_turn_game_data.to_json

    gsus.game_data_json = current_turn_game_data_json
    gsus.game_data_turn = gs.current_turn_number
    gsus.save    
  end  
end

def create_game_data_for_all_players game_session
  game_session.game_session_user_statuses.each do |gsus|
    create_game_data_for_a_single_player game_session, gsus
  end  
end

def send_game_data gs
  gsus = gs.game_session_user_statuses.find :first, :conditions => ["user_id = ?",current_user.id]

  create_game_data_for_a_single_player gs, gsus

  render(:text =>  [gsus.game_data_json, gsus.hist_game_data_json].to_json)
end

# def send_battle_report_data game_session
#  create_battle_report game_session
#  game_data = [game_session.current_turn_number, @latest_turn_ended_at, @visible_hexs_json, @area_elements_json, @units_json, @resources, @income, @expenses, @game_session_state, @former_turn_results_text_json]
#
#  render(:text =>  game_data.to_json)
# end

def next_turn the_game_session
  # puts "main_controller.next_turn"
  return the_game_session.execute_current_turn(current_user)
end

public
  def index
    # puts "main_controller.index: session[:game_session_id] = #{session[:game_session_id]}"
    set_static_game_data           
    current_game_session = GameSession.find :first, :conditions => ["id = ?",session[:game_session_id]]
    update_game_data current_user.id, current_game_session
    users

    render
  end

  def set_game_session_from_javascript
    puts "*** GameSessionsController.set_game_session_from_javascript ****"
    puts "*** params: "
    params.keys.each do |key|
      puts "         param: '#{key.to_s}' => #{params[key].to_s} "
    end

    # params[:width]
    session[:game_session_id]  = params[:id]
    # set_current_game_session
    
    redirect_to :action => :index
  end

  def set_game_session
    session[:game_session_id]  = params[:id]
    # set_current_game_session

    redirect_to :action => :index
  end
  
  def status    
    user = current_user    
    user.updated_at = Time.now
    user.save
        
    gs = current_game_session
    gsus = gs.get_gsus(user)

    status_data = Array.new    
    status_data.push(gs.current_turn_number)
    status_data.push(gs.state)
    status_data.push(gs.get_users_name)
    status_data.push(gs.get_users_status)    
    status_data.push(game_sessions_your_move)
    
    if (gsus)
      status_data.push(gsus.state)
    end
              
    render(:text => status_data.to_json);
  end
  
  def get_game_data
    gs = GameSession.find :first, :conditions => ["id = ? ", session[:game_session_id]]
    send_game_data gs
  end

  # def get_battle_report
  #  gs = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "
  #  send_battle_report_data gs
  # end
  
  def end_turn
    # puts ("end turn")
    gs = GameSession.find :first, :conditions => ["id = ? ",session[:game_session_id]]
    gsus = gs.game_session_user_statuses.find :first, :conditions => ["user_id = ?",current_user.id]

    if (gs.is_end_turn_recived == false)
      gs.is_end_turn_recived = true;
      gs.save

      if (gsus.orders_recived == false)
        gs.save_orders(current_user.id, params["orders "])
      end

      next_turn gs
      create_game_data_for_all_players gs # TODO: This can be optimized A LOT
      send_game_data gs
    else
      puts("Somthing whent wrong gs.is_end_turn_recived == false")
    end
  end
  
  def save_orders  
    # logger.debug "*** save_orders ****\n"
    # logger.debug "*** params: \n"
    # params.keys.each do |key|
    #  logger.debug "         param: '#{key.to_s}' => #{params[key].to_s} \n"
    # end
    
    client_turn = params["current_turn "].to_i    
    
    gs = GameSession.find :first, :conditions => ["id = ?", session[:game_session_id]]
    gsus = gs.game_session_user_statuses.find :first, :conditions => ["user_id = ?",current_user.id]
    if (gsus.orders_recived)
      render :text =>  "orders already recived"
      
    elsif client_turn < gs.current_turn_number
      render :text => "client/server turn desync"
      
    else
      gs.save_orders(current_user.id, params["orders "])
      if (gs.is_all_orders_recived)      
        next_turn gs
        create_game_data_for_all_players gs # TODO: This can be optimized A LOT
        send_game_data gs        
      else      
        render  :text =>  "waiting to recive all orders"      
      end                
    end
  end
  
  # def periodically_user_status_check
  #    gs = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "
  #    render :text =>  users_status.to_json
  # end
  
  # def resources
  #    @the_user_id = current_user.id
  #    gs = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "
  #
  #    @resouce_info_hash = gs.get_resource_info @the_user_id
  # end
  
  def get_history
    print "*** main_controller.get_history\n"
    @the_user_id = current_user.id
    gs = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "          
  
    @the_history = gs.history_last_turn  @the_user_id

    # @statistics_data_table = gs.statistics
    
    # set_static_game_data
    # update_game_data gs
    render(:text =>  @the_history.to_json)
  end

  def drop_battle
    puts "*** drop_battle"
    gs = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "
    gs.game_session_user_statuses.each do |gsus|
      gs.user_remove(gsus.user)
    end
    
    if gs.destory_all_child_rows(false)
      puts "\t gs.destroy"
      gs.destroy
    else
      puts "\t gs.destory_all_child_rows(false) == false"
    end

    redirect_to :action => :index, :controller => :game_sessions
  end

  def new_user_joins
    gs = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "

    gs.user_join(current_user, 'active')
    render :text =>  ""
  end
  
  def invited_user_joins
    gs = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "

    gs.invited_user_joins(current_user)
    render :text =>  ""
  end

  def invited_user_rejects
    # puts "*** GameSessionsController.set_game_session_from_javascript ****"
    # puts "*** params: "
    # params.keys.each do |key|
    #   puts "         param: '#{key.to_s}' => #{params[key].to_s} "
    # end

    gs = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "

    if ((params[:nameOfUser]) && (current_user == gs.host))
      the_user = User.find :first, :conditions => ["in_game_name = ?", params[:nameOfUser]]
      # puts "params[:nameOfUser] = #{params[:nameOfUser]} "
      gs.user_remove(the_user)
      render :text =>  ""
    else
      gs.user_remove(current_user)
      # puts "params[:nameOfUser] = null "
      redirect_to :action => :index, :controller => :game_sessions
    end
  end

  def surrender
    # puts "main_controller.surrender"
    gs = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "
    gs.surrender(current_user)

    redirect_to :action => :status
  end

  def ask_for_peace
    # puts "main_controller.ask_for_preace"
    
    game_session = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "

    do_ask_for_peace = params["do_ask_for_peace "]
    if (do_ask_for_peace == "true")
      game_session.ask_for_peace(current_user)
    else
      game_session.ask_not_for_peace(current_user)
    end

    redirect_to :action => :status
  end

  def send_reminder
    puts "*** GameSessionsController.send_reminder ****"
    puts "*** params: "
    params.keys.each do |key|
       puts "         param: '#{key.to_s}' => #{params[key].to_s} "
    end
    # game_session_id  = params[:id]
    # gs = GameSession.find :first, :conditions => ["id = ?", game_session_id]
    if (params[:nameOfUser])
      puts "*** params[:nameOfUser] = #{params[:nameOfUser]}"
       
      to_user = User.find :first, :conditions => ["in_game_name = ?", params[:nameOfUser]]
      puts "*** to_user = #{to_user.in_game_name}"

      current_game_session.send_reminder(to_user, current_user)
    end
    
    
    redirect_to :action => :status
  end

  def users
    gs = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "
    @im_push = false     

    # NOT DRY, IM Stuff
    @user_colors = gs.get_user_colors
    @user_ims = InstanceMessage.get_user_messages gs 
    @the_users_name = gs.get_users_name

  end
  
  def options
      gs = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "                        
      @statistics_data_table = gs.statistics
  end
end