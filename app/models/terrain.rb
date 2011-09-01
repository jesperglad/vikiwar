require "rexml/document"
include REXML    # so that we don't have to prefix everything with REXML::...

class Terrain < ActiveRecord::Base
  has_many :areas

  def Terrain.parse_terrain_info doc
    terrains = doc.root.elements["terrains"]
    terrains.elements.to_a.each {|terrain_xml|
      name = terrain_xml.attributes.get_attribute("name").value
      healing_modifier = terrain_xml.attributes.get_attribute("healing_modifier").value
      description = terrain_xml.attributes.get_attribute("description").value

      terrain = Terrain.find :first, :conditions => ["name = ?", name]
      if (terrain)
        terrain.healing_modifier = healing_modifier
        terrain.description = description
        terrain.save

      else
        Terrain.create :name => name, :healing_modifier => healing_modifier, :description => description
        
      end

      # puts "Terrain: #{name}, #{healing_modifier}"
    }
 end

end
