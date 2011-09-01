class CreateDefaultData < ActiveRecord::Migration
  def self.up     
    create_default_data
  end

  def self.down
  end
end


  def create_default_data        
    users = Array.new
    users[0] = User.create(:name => 'Open 1', :password => 'iodfhur9237_?45', :password_confirmation => 'iodfhur9237_?45', :email => "du1@glads.dk", :in_game_name => "Open 1", :account_type => 'proxy_user')
    users[1] = User.create(:name => 'Open 2', :password => 'qeytgnb983bjkf', :password_confirmation => 'qeytgnb983bjkf', :email => "du2@glads.dk", :in_game_name => "Open 2", :account_type => 'proxy_user')
    users[2] = User.create(:name => 'Open 3', :password => 'ti4395_4375', :password_confirmation => 'ti4395_4375', :email => "du3@glads.dk", :in_game_name => "Open 3", :account_type => 'proxy_user')
    users[3] = User.create(:name => 'Open 4', :password => 'bfmur__vkf', :password_confirmation => 'bfmur__vkf', :email => "du4@glads.dk", :in_game_name => "Open 4", :account_type => 'proxy_user')
    users[4] = User.create(:name => 'Open 5', :password => 'teitn58_fvxfv', :password_confirmation => 'teitn58_fvxfv', :email => "du5@glads.dk", :in_game_name => "Open 5", :account_type => 'proxy_user')
    users[5] = User.create(:name => 'Open 6', :password => 'M459bRT__cvcv', :password_confirmation => 'M459bRT__cvcv', :email => "du6@glads.dk", :in_game_name => "Open 6", :account_type => 'proxy_user')
    users[6] = User.create(:name => 'Open 7', :password => 'YROP_bvmc73', :password_confirmation => 'YROP_bvmc73', :email => "du7@glads.dk", :in_game_name => "Open 7", :account_type => 'proxy_user')
    User.create(:name => 'admin', :password => 'DR_Nokia*', :password_confirmation => 'DR_Nokia*',  :email => "admin1@glads.dk", :in_game_name => "META GOD", :account_type => 'admin')

    Terrain.parse_terrain_info Document.new(File.open('default_data.xml'))
    AreaElementType.parse_area_element_info Document.new(File.open('default_data.xml'))
    UnitType.load_unit_type_data("vikiwar_unit_types_001.csv")

    
    # city = AreaElementType.create(:name => "city",  :sight_range => 3)

    # print("Creating region: World ... done\n")
    world = Region.create(:name => "World")

    # print("Creating region: Scandinavia ... done\n")
    scandinavia = world.children.create(:name => "Scandinavia")

    Region.parse_region_info Document.new(File.open('default_data.xml'))
  end
