require "rexml/document"
include REXML    # so that we don't have to prefix everything with REXML::...

class Region < ActiveRecord::Base
  acts_as_tree
  has_many :areas

  # The list of regions that this regions give access to
  has_many :open_regions,
           :class_name => "Region",
           :foreign_key => "access_region_id"

  # The region that give access to this region
  belongs_to :access_region,
             :class_name => "Region"

  # The users which have access to this region
  has_and_belongs_to_many :users
  
private
  def Region.set_region_info this_region_name, access_region_name, parent_region, hex_indexs, the_description
    # puts "Region.set_region_info: #{this_region_name}, #{access_region_name}, #{parent_region.name}, #{hex_indexs}, #{the_description}"
    region = Region.find :first, :conditions => ["name = ?", this_region_name]
    access_region = Region.find :first, :conditions => ["name = ?", access_region_name]

    if (region && access_region)
      # puts "\tregion: #{region.name}, access_region: #{access_region.name}"
      access_region.open_regions << region
      access_region.save

      region.parent= parent_region
      region.hex_indexs = hex_indexs
      region.description = the_description

      region.save
      
    end
  end

public
  def Region.get_regions_from_names the_region_names
    the_regions = Array.new

    the_region_names.each {|name|
      the_regions.push(Region.find(:first, :conditions => ["name = ?",name]))
    }

    return the_regions
  end

  def Region.parse_region_info doc        
    ele_regions = doc.root.elements["regions"]    
    ele_map_region = ele_regions.elements["region"]
    ele_map_region_name = ele_map_region.attributes.get_attribute("name").value

    if !(Region.find :first, :conditions => ["name = ?", ele_map_region_name])
      GameSession.load_CSV ""+ele_map_region_name+"_game_session.csv"    
    end    
    map_region = Region.find :first, :conditions => ["name = ?", ele_map_region_name]

    elements_stack = Array.new
    elements_stack.push ele_map_region
    while !elements_stack.empty?
      access_region = elements_stack.pop
      access_region.elements.each do |child|
        if access_region != child && child.name == "region"
          # puts "\tRegions:"
          # puts "\t\tAccess region: #{access_region.attributes.get_attribute("name").value}"
          # puts "\t\tchild: #{child.attributes.get_attribute("name").value}"
          # puts "\t\tchild hexs: #{child.attributes.get_attribute("hexs").value}"

          elements_stack.push child
          new_region_name = child.attributes.get_attribute("name").value
          if !(Region.find :first, :conditions => ["name = ?", new_region_name])
            GameSession.load_CSV ""+new_region_name+"_game_session.csv"
          end          

          Region.set_region_info(
            new_region_name,
            access_region.attributes.get_attribute("name").value,
            map_region,
            child.attributes.get_attribute("hexs").value,
            child.attributes.get_attribute("description").value)
        end
      end
    end
  end

  def Region.start_regions doc
    # puts "*** Region.start_regions"
    ele_regions = doc.root.elements["regions"]
    ele_map_region = ele_regions.elements["region"]

    the_start_regions = Array.new
    ele_map_region.elements.each("region") { |child|
      # puts "\tstart region: #{child.attributes.get_attribute("name").value}, child.name: #{child.name}"
      a_start_region = Region.find :first, :conditions => ["name = ?", child.attributes.get_attribute("name").value]
      the_start_regions.push a_start_region      
    }
    return the_start_regions
  end

  def Region.get_regions_hexes regions
    hexes = Array.new
    regions.each do |region|
      hexes << region.hex_indexes
    end

    return hexes
  end

  def init
    t = Terrain.find :first, :conditions => "name = 'grassland' "

    for hex_index in 0..(self.w_hex_map * self.h_hex_map - 1)
      Area.create(:position_index => hex_index, :terrain => t, :region =>self)
    end    
  end
  
  def areas_next_to_area(the_index)
    as = Array.new
    @r_w ||= self.w_hex_map
    @r_h ||= self.h_hex_map
    
    x_loc =  Area.get_hex_x the_index, @r_w 
    y_loc = Area.get_hex_y the_index, x_loc, @r_w 
        
    if (x_loc > 0)   # West      
      as.push(the_index - 1);
    end      

    if (x_loc < (@r_w-1))  # East      
      as.push(the_index+1);
    end

    if (y_loc%2 == 1) 
      if  ( (x_loc < (@r_w-1))  && (y_loc > 0) ) 
        a = the_index-@r_w+1; # Northeast, odd array index
        as.push(a);
      end
    
      if ((x_loc >= 0)  && (y_loc > 0))
        a = the_index-@r_w; # Northwest, odd array ubdex
        as.push(a);
      end
    
      if  ((x_loc >= 0) && (y_loc < (@r_h-1)))
        a = the_index+@r_w; # Southwest, odd array index
        as.push(a);
      end
    
      if ( (x_loc < (@r_w-1)) && (y_loc < (@r_h-1)) ) 
        a = the_index+1+@r_w; # Southeast, odd array index
        as.push(a);      
      end
      
    else
      if  ( (x_loc <= (@r_w-1)) && (y_loc > 0) )
        a = the_index-@r_w; # Northeast, even array index
        as.push(a);
      end
    
      if ( (x_loc > 0) && (y_loc > 0) ) 
        a = the_index-@r_w-1; # Northwest, even array ubdex
        as.push(a);
      end
      
      if  ( (x_loc > 0) && (y_loc < (@r_h-1)) ) 
        a = the_index+@r_w - 1; # Southwest, even array index
        as.push(a);     
      end
         
      if ( (x_loc <= (@r_w-1))  && (y_loc < (@r_h-1)) )
        a = the_index +@r_w; # Southeast, even array index
        as.push(a);    
      end
    end    
       
    return as;
 end

 def get_areas_within_range(the_location_hex_index, the_range)
    old_length = 0;
    the_index = the_location_hex_index
    hexs = [the_index]
  
    
    for range in 1...the_range
        new_length = hexs.length

        for i in old_length...new_length
            hs = areas_next_to_area(hexs[i]);
        
            for j in 0...hs.length 
                if (hexs.index(hs[j]) == nil)
                  hexs.push(hs[j]);
                end                       
            end
        end
        
        old_length = new_length;
    end   

    return hexs;
  end
  
  def accesable_regions
    return Region.find(:all, :conditions => ["access_region_id = ?", self.id])
  end
end
