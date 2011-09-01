class GinnungagapController < GenericHexmapController
  before_filter :require_admin
  layout "admin"

  def index
    session[:region] = nil
    session[:gs] = nil
  end
  
  def create_region
    if request.post?
      the_region = Region.create(params[:region])
      the_region.init
      session[:region] = the_region

      puts "Game Session: Name = #{params[:region][:name]}, #Players: #{params[:game_session][:numOfPlayers]}"
      gs = GameSession.create(
        :name => ""+params[:region][:name],
        :region => the_region,
        :state => "META",
        :max_num_of_players => params[:game_session][:numOfPlayers],
        :starting_gold => params[:game_session][:startingGold],
        :level => params[:game_session][:level]
      );
      
      session[:gs] = gs
      u = Array.new
      u[0] = User.find :first, :conditions => "name = 'Open 1' "
      u[1] = User.find :first, :conditions => "name = 'Open 2' "
      u[2] = User.find :first, :conditions => "name = 'Open 3' "
      u[3] = User.find :first, :conditions => "name = 'Open 4' "
      u[4] = User.find :first, :conditions => "name = 'Open 5' "
      u[5] = User.find :first, :conditions => "name = 'Open 6' "
      u[6] = User.find :first, :conditions => "name = 'Open 7' "

      for i in 0..(gs.max_num_of_players-1)
        gs.user_add_proxy(u[i])
      end

      redirect_to :action => 'edit_region'
    end    
  end

  def upload_regions
    print "upload_regions:\n"
    params.keys.each do |key|
      print "         param: '#{key.to_s}' => #{params[key].to_s} \n"
    end

    if request.post?
      Dir.entries(".").each {|entri|
        if entri.include? "_game_session.csv"
          if (params['region_'+entri] != nil)
            GameSession.load_CSV entri
          end
        end
      }
    end
    redirect_to :action => "index"
  end

  def upload_regions_info
    # print "upload_regions_info:\n"
    # params.keys.each do |key|
    #  print "         param: '#{key.to_s}' => #{params[key].to_s} \n"
    # end

    if request.post?
      doc = Document.new(File.open(params['uploaded_region_info']))

      Terrain.parse_terrain_info doc
      AreaElementType.parse_area_element_info doc
      UnitType.load_unit_type_data("vikiwar_unit_types_001.csv")

      Region.parse_region_info doc
      start_regions = Region.start_regions(doc)
      users = User.find :all, :conditions => ["account_type = 'user'"]
      users.each do |the_user|
        start_regions.each {|a_start_region|
          the_user.add_open_region a_start_region
        }
      end

      Title.parse_title_info doc
      
      redirect_to :action => "index"
    end
  end
  
#   def create_game_session_from_csv
#    print "create_game_session_from_csv:\n"
#    params.keys.each do |key|
#      print "         param: '#{key.to_s}' => #{params[key].to_s} \n"
#    end
#
#    file = params[:uploaded_file]
#    GameSession.load_CSV file
#  end
  
  def edit_region
    puts "*** edit_region"       
    @the_user_id = current_user.id    

    the_region = current_region
    gs = session[:gs]
    @region_name = the_region.name 
   
    set_static_hexmap_layout
    set_region_depending_hexmap_layout the_region  
    set_static_model
    set_game_session_depending_model gs

    create_areas_model_and_imagemap the_region, nil
  end

  def rename_region
    the_region = Region.find :first, :conditions => ["name = ?",params[:id]]

    if request.post?
      gs = GameSession.find :first, :conditions => ["name = ? and state = 'META'", params[:id]]

      gs.name = params[:region_name]
      gs.save
      
      the_region.name = params[:region_name]
      the_region.save
      
      redirect_to :action => "index"
    else
      @region_name = the_region.name
    end

  end

  def update_regions
    if request.post?
      @all_regions = Region.find(:all)
      @all_regions.each {|the_region|
        if (params['region_publish_'+the_region.name] != nil)
          the_region.publish = true
        else
          the_region.publish = false
        end
        the_region.save

        if (params['dump_cvs_file_'+the_region.name] != nil)
          # puts "the region name: #{the_region.name}"
          gs = GameSession.find :first, :conditions => ["name = ? and state = 'META' ", the_region.name]
          gs.to_CSV          
        end

        if (params['give_user_access_'+the_region.name] != nil)
          # puts "give_user_access, the region name: #{the_region.name}"
          users = User.find :all
          users.each {|u|
            u.add_open_region(Region.find(:first, :conditions => ["name = ?",the_region.name]))
          }
        end
        
        if (params['region_delete_'+the_region.name] != nil)
          the_region.areas.each do |a|
            a.delete
          end

          gss = GameSession.find :all, :conditions => ["region_id = ?", the_region.name]
          gss.each do |gs|
            if gs.destory_all_child_rows(false)
              gs.destroy
            end
         end
         the_region.delete
        end
      }
    end
    redirect_to :action => "index"
  end

  private
  def save_areas the_region, areas_json
    the_areas_h = JSON.parse(areas_json)
    the_areas_a = the_areas_h['areas']

    the_region_areas = Area.find :all, :conditions => ["region_id = ?", the_region.id]
    the_areas_a.each do |a|
      the_area = the_region.areas.find :first, :conditions => ["position_index = ?", a[1]]

      the_region_areas.delete_if {|area_to_check|
        area_to_check.position_index == a[1]
      }

      if the_area.terrain_id != a[0]
        the_area.terrain_id = a[0];
        the_area.save       
      end
    end

    the_region_areas.each do |a|
      the_area = the_region.areas.find :first, :conditions => ["id = ?",a.id]
      if the_area
        the_region.areas.delete(the_area)
        the_area.delete
      end
    end
  end

  public
  def save_region
    the_region = session[:region]
    gs = session[:gs]

    if the_region
      puts "units: #{params["units"]}"
      
      # the_areas_h = JSON.parse(params["areas"])
      # the_areas_a = the_areas_h['areas']
      the_units_h = JSON.parse(params["units"]);      
      the_areas_elements_h = JSON.parse(params["area_elements"])

      save_areas the_region, params["areas"]

      Unit.delete_all(["game_session_id = ?", gs.id])
      AreaElement.delete_all(["game_session_id = ?", gs.id])
      gs.save
      
      the_units_h.each_value do |u_a|
        u = u_a[0]
        puts "\tunits: #{u}, #{u[2]}, #{u[4]}, #{u[1]}\n"
        # u.each do |ue|
        #  puts "\t\tue: #{ue}\n"
        # end
        the_user = User.find :first, :conditions => ["id = ?",u[1]]
        the_unit_type = UnitType.find :first, :conditions => ["id = ?",u[2]]
        the_unit = Unit.create(:unit_type => the_unit_type, :experience => 1, :healt => 9, :location_hex_index=> u[4], :game_session => gs, :user => the_user);
        the_unit.save
      end
      
      puts "The Area Elements: #{the_areas_elements_h}"
      
      the_areas_elements_h.each_value do |ae|
        puts "\tae: #{ae}, #{ae[1]}, #{ae[2]}, #{ae[3]}\n"
        # u.each do |ue|
        #  puts "\t\tue: #{ue}\n"
        # end
        the_user = User.find :first, :conditions => ["id = ?",ae[1]]
        the_ae_type = AreaElementType.find :first, :conditions => ["id = ?",ae[2]]        
        the_ae = AreaElement.create(:area_element_type => the_ae_type, :location_hex_index=> ae[3], :game_session => gs, :user => the_user);

        # Just for debuging
        the_aes = AreaElement.find :all, :conditions => ["area_element_type_id = ? and location_hex_index = ?", the_ae_type, ae[3]]
        the_aes.each { |a_ae|
          puts "\t\tthe ae: #{a_ae.id}, #{a_ae.user_id}, #{a_ae.area_element_type_id}, #{a_ae.location_hex_index}\n"
        }
        the_ae.save
      end

      render(:text => [0].to_json)
      
    else
      render(:text => "Error no region.".to_json)
      
    end
  end
end