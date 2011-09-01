class CreateTestData < ActiveRecord::Migration
  def self.up
      #   t = Array.new
      # t[0] = Terrain.find :first, :conditions => "name = 'sea' "
      # t[1] = Terrain.find :first, :conditions => "name = 'grassland' "
      # t[2] = Terrain.find :first, :conditions => "name = 'hills' "
      # t[3] = Terrain.find :first, :conditions => "name = 'forest' "
      # t[4] = Terrain.find :first, :conditions => "name = 'mountains' "
      # t[5] = Terrain.find :first, :conditions => "name = 'swamp' "
    
      # unit_types = UnitType.find :all
      # city = AreaElementType.find :first

      users = Array.new
      users[0] = User.create(:name => 'user1', :password => 'user1', :password_confirmation => 'user1', :email => "user1@glads.dk", :in_game_name => "Odin", :account_type => 'user')
      users[1] = User.create(:name => 'user2', :password => 'user2', :password_confirmation => 'user2', :email => "user2@glads.dk", :in_game_name => "Thor", :account_type => 'user')
      users[2] = User.create(:name => 'user3', :password => 'user3', :password_confirmation => 'user3', :email => "user3@glads.dk", :in_game_name => "Loke", :account_type => 'user')
      users[3] = User.create(:name => 'user4', :password => 'user4', :password_confirmation => 'user4', :email => "user4@glads.dk", :in_game_name => "Heimdal", :account_type => 'user')
      users[4] = User.create(:name => 'user5', :password => 'user5', :password_confirmation => 'user5', :email => "user5@glads.dk", :in_game_name => "Freja", :account_type => 'user')
      users[5] = User.create(:name => 'user6', :password => 'user6', :password_confirmation => 'user6', :email => "user6@glads.dk", :in_game_name => "Tyr", :account_type => 'user')
      users[6] = User.create(:name => 'user7', :password => 'user7', :password_confirmation => 'user7', :email => "user7@glads.dk", :in_game_name => "Sif", :account_type => 'user')
      # users[7] = User.create(:name => 'Glad', :password => 'foo', :password_confirmation => 'foo', :email => "jesperglad@gmail.com", :in_game_name => "Einheriar Glad", :account_type => 'user')
      
      # scandinavia = Region.find(:first, :conditions => "name = 'Scandinavia' ")
      # fyn = Region.find(:first, :conditions => "name = 'Fyn' ")
      # fyn2 = Region.find(:first, :conditions => "name = 'Fyn II' ")  
      # bornholm = Region.find(:first, :conditions => "name = 'Bornholm' ")
=begin
      bornholm_meta = GameSession.find :first, :conditions => "name = 'Bornholm' "
      # fyn_meta = GameSession.find :first, :conditions => "name = 'Fyn' "
      # fynII_meta = GameSession.find :first, :conditions => "name = 'Fyn II' "
      
#      s2p_meta = GameSession.find :first, :conditions => "name = 'Small test map I(2)' "
#      s4p_meta = GameSession.find :first, :conditions => "name = 'Small test map I(4)' "
#      s4pt_meta = GameSession.find :first, :conditions => "name = 'Small test map I(4), test setup' "
#      s6p_meta = GameSession.find :first, :conditions => "name = 'Small test map I(6)' "
      
    gs = Array.new

    gs[0] = bornholm_meta.clone_game_session
    gs[0].state = "ACTIVE"
    gs[0].user_join(users[0], "active")
    gs[0].user_join(users[1], "active")
    gs[0].name = "Bornholm Rocks"
    gs[0].current_turn_number = 1
    gs[0].duration_between_turns = 120000
    gs[0].latest_turn_ended_at = Time.now
    gs[0].save 

    # gs[1] = fyn_meta.clone_game_session
    # gs[1].state = "ACTIVE"
    # gs[1].user_join(users[0])
    # gs[1].user_join(users[1])
    # gs[1].user_join(users[2])
    # gs[1].user_join(users[3])
    # gs[1].user_join(users[4])
    # gs[1].user_join(users[5])
    # gs[1].user_join(users[6])
    # gs[1].name = "Fyn 1"
    # gs[1].current_turn_number = 1
    # gs[1].duration_between_turns = 120000
    # gs[1].latest_turn_ended_at = Time.now
    # gs[1].save
    
    # gs[2] = fynII_meta.clone_game_session
    # gs[2].state = "ACTIVE"
    # gs[2].user_join(users[0])
    # gs[2].user_join(users[1])
    # gs[2].user_join(users[2])
    # gs[2].user_join(users[3])
    # gs[2].user_join(users[4])
    # gs[2].user_join(users[5])
    # gs[2].user_join(users[6])
    # gs[2].name = "Fyn 2"
    # gs[2].current_turn_number = 1
    # gs[2].duration_between_turns = 120000
    # gs[2].latest_turn_ended_at = Time.now
    # gs[2].save

      gs[3] = s2p_meta.clone_game_session
      gs[3].state = "ACTIVE"
      gs[3].user_join(users[0])
      gs[3].user_join(users[1])
      gs[3].name = "Small 2 Players"
      gs[3].current_turn_number = 1
      gs[3].duration_between_turns = 120000
      gs[3].latest_turn_ended_at = Time.now
      gs[3].save 
      
      gs[4] = s4p_meta.clone_game_session
      gs[4].state = "ACTIVE"
      gs[4].user_join(users[0])
      gs[4].user_join(users[1])
      gs[4].user_join(users[2])
      gs[4].user_join(users[3])
      gs[4].name = "Small 4 Players"
      gs[4].current_turn_number = 1
      gs[4].duration_between_turns = 120000
      gs[4].latest_turn_ended_at = Time.now
      gs[4].save 
      

      gs[5] = s4pt_meta.clone_game_session
      gs[5].state = "ACTIVE"
      gs[5].user_join(users[0])
      gs[5].user_join(users[1])
      gs[5].user_join(users[2])
      gs[5].user_join(users[3])
      gs[5].name = "Small 4 Players, test setup"
      gs[5].current_turn_number = 1
      gs[5].duration_between_turns = 120000
      gs[5].latest_turn_ended_at = Time.now
      gs[5].save 

      gs[6] = s6p_meta.clone_game_session
      gs[6].state = "ACTIVE"
      gs[6].user_join(users[0])
      gs[6].user_join(users[1])
      gs[6].user_join(users[2])
      gs[6].user_join(users[3])
      gs[6].name = "Small 6 Players"
      gs[6].current_turn_number = 1
      gs[6].duration_between_turns = 120000
      gs[6].latest_turn_ended_at = Time.now
      gs[6].save 
    
      # print("Creating random30x30_map")
      # random30x30_map = scandinavia.children.create(:name => "Random30x30", :w_hex_map =>30)
    
      
      # gs[0] = GameSession.create(:name => "Test Game One", :region => random30x30_map, :current_turn_number => 1, :duration_between_turns => 600000, :latest_turn_ended_at => Time.now)
      # gs[0].user_join(users[0])
      # gs[0].user_join(users[1])      
          
    
      # for i in 0...30
      #  for j in 0...30
      #    terrain_index = rand(t.length)
      #    Area.create(:position_index => (i*30+j), :terrain => t[terrain_index], :region =>random30x30_map)        
      #    if terrain_index != 0 && rand(10) > 7
      #      Unit.create(:unit_type => unit_types[rand(4)], :healt => 9, :location_hex_index=> (i*30+j), :game_session => gs[0], :user => users[rand(3)])
      #    end
        
       #   if terrain_index != 0 && rand(100) > 97
       #     AreaElement.create(:area_element_type => city,  :location_hex_index=> (i*30+j), :user => users[rand(3)], :game_session => gs[0])
       #   end
        
       # end
       # print(".")
      # end 
      # print(" done\n")
=end
  end

  def self.down
  end
end
