require 'csv'

class LoadMapData < ActiveRecord::Migration
  def self.up
    scandinavia = Region.find(:first, :conditions => "name = 'Scandinavia' ")
    
#    bornholm = scandinavia.children.create(:name => "Bornholm", :w_hex_map =>7, :h_hex_map => 8)
#    gs_bor = GameSession.create(:name => ""+bornholm.name, :region => bornholm, :state => "META", :max_num_of_players => 2);
#    load_map_data("Bornholm.csv", bornholm, gs_bor)

#    bornholm2 = scandinavia.children.create(:name => "Bornholm2", :w_hex_map =>8, :h_hex_map => 10)
#    gs_bor2 = GameSession.create(:name => ""+bornholm2.name, :region => bornholm2, :state => "META", :max_num_of_players => 2);
#    load_map_data("Bornholm2.csv", bornholm2, gs_bor2)
    
    # fyn = scandinavia.children.create(:name => "Fyn", :w_hex_map =>31)
    # gs_fyn = GameSession.create(:name => ""+fyn.name, :region => fyn, :state => "META", :max_num_of_players => 6);
    # load_map_data("Fyn.csv", fyn, gs_fyn)

    # fyn2 = scandinavia.children.create(:name => "Fyn II", :w_hex_map =>33)
    # gs_fynII = GameSession.create(:name => ""+fyn2.name, :region => fyn2, :state => "META", :max_num_of_players => 6);
    # load_map_data("Fyn2.csv", fyn2, gs_fynII)

#    ror = scandinavia.children.create(:name => "Round and Round", :w_hex_map => 13, :h_hex_map => 13)
#    gs_ror = GameSession.create(:name => ""+ror.name, :region => ror, :state => "META", :max_num_of_players => 4);
#    load_map_data("Round and Round.csv", ror, gs_ror)

#    mi = scandinavia.children.create(:name => "Monkey Island", :w_hex_map => 16, :h_hex_map => 15)
#    gs_mi = GameSession.create(:name => ""+mi.name, :region => mi, :state => "META", :max_num_of_players => 3);
#    load_map_data("Monkey Island.csv", mi, gs_mi)
    
#    small_2_players = scandinavia.children.create(:name => "Small test map I(2)", :w_hex_map =>11, :h_hex_map => 12)
#    gs_s2p = GameSession.create(:name => ""+small_2_players.name, :region => small_2_players, :state => "META", :max_num_of_players => 2);
#    load_map_data("Small 2 Players.csv", small_2_players, gs_s2p)

#    small_4_players = scandinavia.children.create(:name => "Small test map I(4)", :w_hex_map =>11, :h_hex_map => 12)
#    gs_s4p = GameSession.create(:name => ""+small_4_players.name, :region => small_4_players, :state => "META", :max_num_of_players => 4);
#    load_map_data("Small 4 Players.csv", small_4_players, gs_s4p)

#     small_4_players_test_setup = scandinavia.children.create(:name => "Small test map I(4), test setup", :w_hex_map =>11, :h_hex_map => 12)
#     gs_s4pt = GameSession.create(:name => ""+small_4_players_test_setup.name, :region => small_4_players_test_setup, :state => "META", :max_num_of_players => 4);
#     load_map_data("Small 4 Players - Win in 1 turn.csv", small_4_players_test_setup, gs_s4pt)
     
#     small_6_players = scandinavia.children.create(:name => "Small test map I(6)", :w_hex_map =>11, :h_hex_map => 12)
#     gs_s6p = GameSession.create(:name => ""+small_6_players.name, :region => small_6_players, :state => "META", :max_num_of_players => 6);
#     load_map_data("Small 6 Players.csv", small_6_players, gs_s6p)
     
  end

  def self.down
  end
 
end

def load_map_data(file_name, the_region, the_gs) 
    print "Loading: "+file_name+" ... ";

    t = Terrain.find :all

    # t = Array.new
    # t[0] = Terrain.find :first, :conditions => "name = 'sea' "
    # t[1] = Terrain.find :first, :conditions => "name = 'grassland' "
    # t[2] = Terrain.find :first, :conditions => "name = 'hills' "
    # t[3] = Terrain.find :first, :conditions => "name = 'forest' "
    # t[4] = Terrain.find :first, :conditions => "name = 'mountains' "
    # t[5] = Terrain.find :first, :conditions => "name = 'swamp' "
    
    u = Array.new
    u[0] = User.find :first, :conditions => "name = 'Open 1' "
    u[1] = User.find :first, :conditions => "name = 'Open 2' "
    u[2] = User.find :first, :conditions => "name = 'Open 3' "
    u[3] = User.find :first, :conditions => "name = 'Open 4' "
    u[4] = User.find :first, :conditions => "name = 'Open 5' "
    u[5] = User.find :first, :conditions => "name = 'Open 6' "
    u[6] = User.find :first, :conditions => "name = 'Open 7' "
    
    unit_types = Array.new
    unit_types[0] = UnitType.find :first, :conditions => "name = 'swordsmen' " 
    unit_types[1] = UnitType.find :first, :conditions => "name = 'axemen' " 
    unit_types[2] = UnitType.find :first, :conditions => "name = 'pikemen' " 
    unit_types[3] = UnitType.find :first, :conditions => "name = 'berserker' " 
    unit_types[4] = UnitType.find :first, :conditions => "name = 'horsemen' "
    unit_types[5] = UnitType.find :first, :conditions => "name = 'archers' "
    unit_types[6] = UnitType.find :first, :conditions => "name = 'scouts' "

    # TODO: Needs update to support more AreaElements
    aes[1] = AreaElementType.find :first, :conditions => "name = 'city' "
    aes[2] = AreaElementType.find :first, :conditions => "name = 'harbor' "

    for i in 0..(the_gs.max_num_of_players-1)
      the_gs.user_add_proxy(u[i])
    end
    
  CSV.open(file_name, "r") do |row|
    if (row[0]) 
      hex_index = row[0].to_i
     
      if (row[1]) 
        terrain_index = row[1].to_i
        if terrain_index >= 0
          a = Area.create(:position_index => hex_index, :terrain => t[terrain_index], :region =>the_region)
          print "a"
        else
          print "E"
        end
        
        if row[2]  # Unit
          unit_type_id = row[2].to_i          
          
          if (row[3])
            unit_owner = row[3].to_i;                        
            Unit.create(:unit_type => unit_types[unit_type_id], :experience => 1, :healt => 9, :location_hex_index=> hex_index, :game_session => the_gs, :user => u[unit_owner]);
             print "u"
          end                      
        end

        # TODO: Needs update to support more AreaElements
        if row[4] # City
          ae_type_id = row[4].to_i
          ae = AreaElement.create(:area_element_type => aes[ae_type_id],  :location_hex_index=> hex_index,  :game_session => the_gs)
          print "*"
          if row[5]
            owner = row[5].to_i
            ae.user = u[owner];
            ae.save
          end
        end
      end      
    end
  end
  print "...end \n"
end