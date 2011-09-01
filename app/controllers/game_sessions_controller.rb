class GameSessionsController < GenericHexmapController
  before_filter :require_user

private
  def store_create_battle_field_form_values the_params
    game_session_hash = the_params[:game_session]

    session[:selected_battle_field_value] = game_session_hash[:battle_field].to_s
    session[:name_of_battle_field] = game_session_hash[:name].to_s

    the_params.keys.each do |key|
      if key.include? "_param"
        session[key] = the_params[key]
      end
    end
    
  end
  
  def is_email the_email_s
    return (the_email_s.upcase =~ /^[A-Z0-9._%+-]+@([A-Z0-9.-]+\.)+([A-Z]{2,4})$/)
  end

  # Method is to be moved to game_session
  def start_game_session gs_meta, the_params    
        game_session_hash = the_params[:game_session]

        gs = gs_meta.clone_game_session
        gs.state = "STARTING"
        gs.host = @the_user
        gs.user_join(@the_user, "active")
        gs.name = CGI::escapeHTML(game_session_hash[:name])
        gs.current_turn_number = 1
        gs.duration_between_turns = game_session_hash[:duration_between_turns]
        gs.latest_turn_ended_at = Time.now
        gs.save
        
        the_params.keys.each do |key|
          if key.include? "_param"
            input_text = the_params[key].strip

            # is the string not empty and is it not an email?
            if (is_email input_text)
              if User.do_email_exists input_text
                the_user = User.find :first, :conditions => ["email = ?", input_text]
                NextworldMailer.deliver_existing_player_invite_mail(@the_user, the_user, gs)
              else
                NextworldMailer.deliver_new_player_invite_mail(@the_user, input_text, gs)
              end            
            elsif (the_user = User.find :first, :conditions => ["in_game_name = ?", input_text])
              NextworldMailer.deliver_existing_player_invite_mail(@the_user, the_user, gs)
            end
          end
        end        

        NewsItem.create(
          :title => "A battle is about to start",
          :news_date => Time.now,
          :tag => "battle-news",
          :content => "The battle of '"+gs.name+"' is about to start at "+gs.region.name+".")

  end  

  def verify_player_names_input the_params
    names_okay = true
    
    the_params.keys.each do |key|
      if key.include? "_param"
        input_text = the_params[key].strip

        # is the string not empty and is it not an email?
        if !input_text.empty? && !(is_email input_text)

          if !(User.find :first, :conditions => ["in_game_name = ?", input_text])
            flash[key+"_flash"] = "It was not possible to find a player with the in game name '#{input_text}'."
            names_okay = false
            
          end         
        end
      end
    end

    return names_okay
  end

  def find_visible_hexs(the_user)
    visible_hexs = Array.new

    region_names = the_user.open_region_names.split(',')
    region_names.each do |region_name|
      puts "region_name: #{region_name}"
      region = Region.find :first, :conditions => ["name = ?", region_name]
      if region
        region.hex_indexs.split(',').each do |hex|
          visible_hexs.push(hex)
        end
      end
    end

    return visible_hexs;
  end

  def game_sessions_user_can_join the_user
    gs_starting = GameSession.find :all, :conditions => "state = 'STARTING' "

    @game_sessions_user_can_join = Array.new
    gs_starting.each do |gs|
      if ((gs.user_in_game_session(@the_user) == false) && (gs.get_num_of_poxy_users > 0))
        @game_sessions_user_can_join.push gs

      end
    end

    return @game_sessions_user_can_join
  end

  def get_battles_in_hex gs_hash, hex
    if !gs_hash[hex]
      gs_hash[hex] = Array.new
    end

    return gs_hash[hex]
  end
  
  def battles_hash filter
    gs_hash = Hash.new
    
    the_game_sessions = current_user.game_sessions
    if filter == "join_a_battle"
      the_game_sessions = game_sessions_user_can_join current_user
    end

    the_game_sessions.each { |gs|
       gs.region.hex_indexs.split(',').each {|hex|          
          gsus = gs.game_session_user_statuses.find :first, :conditions => ["user_id = ?",current_user.id]
          if gsus
            if gsus.removed == false
              get_battles_in_hex(gs_hash, hex).push([gs, gsus.orders_recived])
            end
          else  
            get_battles_in_hex(gs_hash,hex).push([gs, false])
          end          
       }      
    }

    return gs_hash
  end

  def sub_region_names_hash parent_region
    region_names_hash = Hash.new

    sub_regions = Region.find :all, :conditions => ["parent_id = ?", parent_region.id]
    sub_regions.each { |a_region|
      a_region.hex_indexs.split(',').each { |hex|
        region_names_hash[hex.to_i] = a_region.name
      }      
    }

    return region_names_hash
  end
public

  def index
    puts "*** GameSessionsController.index ****"
    puts "*** params: "
    params.keys.each do |key|
      puts "         param: '#{key.to_s}' => #{params[key].to_s} "
    end

    @turn_durations = [["1 min", 60000],["2 min",120000],["5 min",300000],["15 min",900000],["30 min",1800000],["1 hour",3600000],["2 hours",7200000],["5 hours",18000000],["12 hours",43200000],["1 day",86400000],["2 days",172800000]]
    @the_user = current_user
    @the_user_id = current_user.id
    @game_sessions = @the_user.game_sessions # DRY it
    @game_sessions_json = @game_session.to_json
    @selected_battle_field_index = 0;
    @max_num_of_players = 0 # Needs to be set when the
    @action_id = params['id']
    @im_push = false
    
    session['max_num_of_players'] = 0
    session[:selected_battle_field_value] = nil
    session[:name_of_battle_field] = nil
    session[:game_session_id] = nil
    
    if @action_id == "create_a_battle"
      gs_selected_bf = session['meta_game_session'];
      if gs_selected_bf
        @max_num_of_players = gs_selected_bf.max_num_of_players
      end
    else
      session['meta_game_session'] = nil;
      flash.discard
    end
    
    the_region = Region.find :first, :conditions => ["name = 'Denmark'"]    
    gs = GameSession.find :first, :conditions => ["name = 'Denmark' and state = 'META'"]
    puts "the_region: #{the_region.name}, gs: #{gs.name}"
    @region_name = the_region.name

    set_static_hexmap_layout
    set_region_depending_hexmap_layout the_region
    set_static_model
    set_game_session_depending_model gs

    create_areas_model_and_imagemap(the_region, sub_region_names_hash(the_region))
            
    @visible_hexs_json = find_visible_hexs(@the_user).to_json
    @battles_hash_json = battles_hash(params[:id]).to_json
    
  end
  
  def battle_field_selected
    puts "*** GameSessionsController.battle_field_selected ****"
    puts "*** params: "
    params.keys.each do |key|
      puts "         param: '#{key.to_s}' => #{params[key].to_s} "
    end

    unless params['selected_index'].blank?     
      region = Region.find :first, :conditions => ["hex_indexs like ?","%" + params['selected_index'] + "%"]
      gs = GameSession.find :first, :conditions => ["state = 'META' and region_id = ?",region.id]
      session['meta_game_session'] = gs
      session['selected_index'] = params['selected_index'];
      @selected_battle_field_index = params['selected_index'];

      @battle_field_name = region.name
      @max_num_of_players = gs.max_num_of_players
      session['max_num_of_players'] = @max_num_of_players
      
      @turn_durations = [["1 min", 60000],["2 min",120000],["5 min",300000],["15 min",900000],["30 min",1800000],["1 hour",3600000],["2 hours",7200000],["5 hours",18000000],["12 hours",43200000],["1 day",86400000],["2 days",172800000]]
      
      render(:partial => 'create_battle_field_form', :layout  => false)
    end
  end

  def status
    # data = Array.new
    @the_user = current_user
    @game_sessions = @the_user.game_sessions # DRY it
    @battles_hash_json = battles_hash("my battles").to_json
    
    render :partial => "my_battles"
    # render(:text => "yo yo".to_json);
  end

  def autocomplete_text_input
    puts "*** GameSessionsController.autocomplete_player_name ****"
    puts "*** params: "
    params.keys.each do |key|
      puts "         param: '#{key.to_s}' => #{params[key].to_s} "
    end

    input_index = params["input_index"]
    user_text = params[input_index+"_param"]
    puts "user_text: #{user_text.upcase}"

    output_html = ""
    # is it an email, or a name
    if is_email user_text
      # handle email
      puts "is email"
    else  
      # handle in game name
      names = User.find :all, :conditions => ["account_type = 'user' and in_game_name like ?",user_text + "%"]
      output_html += "<ul>"
      names.each do |name|
        output_html += "<li>#{name.in_game_name}</li>"
      end
      output_html += "</ul>"
    end
    
    render(:text => output_html);
  end
  
  def create_battle
    if user_max_num_of_battles_reaced
      redirect_to :action => :index, :id => ""
    else
      @max_num_of_players = session['max_num_of_players']
      @selected_battle_field_value = session[:selected_battle_field_value]
      @name_of_battle_field = session[:name_of_battle_field]
      @text_input = Hash.new
      session.keys.each do |key|
        if (key.instance_of?("".class)) && (key.include? "_param")
          @text_input[key] = session[key]
        end
      end

      @the_user = current_user
      @the_user_id = current_user.id    
    
      @game_session_names = Array.new
      @turn_durations = [["1 min", 60000],["5 min",300000],["15 min",900000],["1 hour",3600000],["12 hours",43200000],["1 day",86400000],["2 days",172800000]]
      (GameSession.find :all, :conditions => "state = 'META' ").each do |gs|
        if (gs.region.publish)
          @game_session_names << [gs.name+" - ("+gs.max_num_of_players.to_s+" player)",gs.id]
        end      
      end
    end
  end
  
  def create_battle_done    
    # puts "*** GameSessionsController.create_battle_done ****"
    # puts "*** params: "
    # params.keys.each do |key|
    #  puts "         param: '#{key.to_s}' => #{params[key].to_s} "
    # end
    store_create_battle_field_form_values params
    
    game_session_hash = params[:game_session]
    
    if game_session_hash[:name] == nil || game_session_hash[:name].empty?
      flash[:missing_battle_name] = "It was not possible to create the battle, as the name of the battle is missing."
      redirect_to :action => :index, :id => :create_a_battle

    elsif !(verify_player_names_input params)      
      redirect_to :action => :index, :id => :create_a_battle

    else
      @the_user = current_user
      @the_user_id = @the_user.id
      
      # session['meta_game_session'] is set in the method battle_field_selected
      gs_meta = session['meta_game_session']
        
      if (gs_meta == nil)
        flash[:note] = "Battle field not selected"
        redirect_to :action => :index        
      else
        start_game_session gs_meta, params
        redirect_to :action => :index        
      end      
    end    
  end

  def inspect_game_session
    session[:game_session_id] = params[:id]

    redirect_to :action => "index", :controller => "main"
  end
  
  def join_game_session
    game_session_id  = params[:id]    
    
    gs = GameSession.find :first, :conditions => ["id = ?",game_session_id]

    @the_user_id = current_user.id
    
    gs.user_join(current_user, "active")
    gs.save

    redirect_to :action => "index"
  end

  def remove
    game_session_id  = params[:id]
    gs = GameSession.find :first, :conditions => ["id = ?",game_session_id]

    @the_user = current_user
    @the_user_id = @the_user.id

    gsus = gs.game_session_user_statuses.find :first, :conditions => ["user_id = ?",@the_user_id]
    gsus.removed = true
    gsus.save

    if gs.destory_all_child_rows(true)
      gs.destroy
    end
    
    redirect_to :action => "index"
  end

  def ranking
    @the_user = current_user
    @the_user_id = @the_user.id

    @users = User.find :all
    @users.sort! {|x,y| y.rank <=> x.rank }
  end

  def retread
    game_session_id  = params[:id]
    gs = GameSession.find :first, :conditions => ["id = ?", game_session_id]

    user = current_user
    @the_user_id = user.id

    gs.user_remove(user)
    gs.save
    
    redirect_to :action => "index"    
  end
end
