require 'csv'

class UnitType < ActiveRecord::Base
  @@MOVEMENT_COST_START_INDEX = 15

  # [name, resource_cost, maintenance_cost, attack_range_min, attack_range_max, action_points,[terrains_movement_cost]]
  def UnitType.create_unit_type_movement_costs the_unit_type
    movement_costs = Hash.new
    tutes = TerrainUnittypeEffects.find :all, :conditions => ["unit_type_id = ?", the_unit_type.id]
    tutes.each do |tute|
      movement_costs[tute.terrain.name] = tute.movement_cost
    end

    return movement_costs
  end
  
  def UnitType.create_unit_types_hash user, gs
    unit_types = UnitType.find(:all)
    unit_types_array = Array.new

    unit_types.each do |ut|
      uta = [ut.name, ut.resource_cost, ut.maintenance_cost, ut.attack_range_min, ut.attack_range_max, ut.action_points,
        UnitType.create_unit_type_movement_costs(ut), 
        ut.level,
        ut.possible_orders,
        ut.is_allowed_to_build(user,gs),
        ut.description,
        ut.can_build,
        ut.cargo_size
      ]

      unit_types_array.push(uta);

    end

    return unit_types_array
  end

  def UnitType.load_unit_type_data(file_name)
    # print "Loading unit types: "+file_name+" ... ";

    terrains = Terrain.find :all    
    area_element_types = AreaElementType.find :all
    
    row_hash = Hash.new
    headers = nil
    CSV.foreach(file_name) do |row|
      if headers
        params = Hash.new
        row_counter = 0
        headers.each do |key|
          params[key] = row[row_counter]
          row_counter += 1
        end
        # UnitType.create(params)

        ut = UnitType.find :first, :conditions => ["name = ?", row[0]]
        if (ut)
          ut.name = row[0]          
          ut.attack_strength = row[1]
          ut.attack_range_min = row[2]
          ut.attack_range_max = row[3]
          ut.defensive_strength = row[4]
          ut.randomness = row[5]
          ut.initiative = row[6]
          ut.action_points = row[7]
          ut.sight_range = row[8]
          ut.resource_cost = row[9]
          ut.maintenance_cost = row[10]
          ut.level = row[11]
          ut.possible_orders = row[12].gsub(/[;]/, ',')
          ut.description = row[13]
          ut.can_build = row[14]
          ut.cargo_size = row[15]
          ut.save                    
          
          terrains.each {|t|
            tute = TerrainUnittypeEffects.find :first, :conditions => ["unit_type_id = ? and terrain_id = ?",ut.id, t.id]
            if !tute
              tute = TerrainUnittypeEffects.create :terrain => t, :unit_type => ut, :movement_cost => row[@@MOVEMENT_COST_START_INDEX+t.id], :combat_bonus => row[@@MOVEMENT_COST_START_INDEX+terrains.size+t.id]
            else
              tute.movement_cost = row[@@MOVEMENT_COST_START_INDEX+t.id]
              tute.combat_bonus = row[@@MOVEMENT_COST_START_INDEX+terrains.size+t.id]
              tute.save            
            end
          }

          area_element_types.each {|aet|
            aeute = AreaElementUnitTypeEffects.find :first, :conditions => ["unit_type_id = ? and area_element_type_id = ?",ut.id, aet.id]
            column_index = @@MOVEMENT_COST_START_INDEX+2*terrains.size+aet.id
            if !aeute              
              AreaElementUnitTypeEffects.create :unit_type => ut, :area_element_type => aet, :combat_bonus => row[column_index]
            else
              aeute.combat_bonus = row[column_index]
              aeute.save
            end
          }

          # unit_types.each {|a_ut|
          #  utute = UnitTypeUnitTypeEffects.find :first, :conditions => ["att_unit_type_id = ? and def_unit_type_id = ?", ut.id, a_ut.id]
          #  utute.combat_bonus = row[@@MOVEMENT_COST_START_INDEX+terrains.size+t.id]
          #  utute.save
          # }
          
        else
          ut = UnitType.create(
            :name => row[0],
            :attack_strength => row[1],:attack_range_min => row[2],:attack_range_max => row[3], :defensive_strength => row[4],
            :randomness => row[5], :initiative => row[6], :action_points => row[7], :sight_range => row[8],
            :resource_cost => row[9], :maintenance_cost => row[10], :level => row[11],
            :description => row[13])
          
          # :sea => row[11], :mountains => row[12], :grassland => row[13], :swamp => row[14], :hills => row[15], :forest => row[16],
          # :combat_sea => row[17], :combat_mountains => row[18], :combat_grassland => row[19], :combat_swamp => row[20], :combat_hills => row[21], :combat_forest => row[22]
          # :combat_swordsmen => row[26], :combat_axemen => row[27], :combat_pikemen => row[28], :combat_berserker => row[29], :combat_horsemen => row[30], :combat_archers => row[31], :combat_scouts => row[32],
          # :combat_city => row[25],
          
          terrains.each {|t|
            TerrainUnittypeEffects.create :terrain => t, :unit_type => ut, :movement_cost => row[@@MOVEMENT_COST_START_INDEX+t.id], :combat_bonus => row[@@MOVEMENT_COST_START_INDEX+terrains.size+t.id]
          }          

          area_element_types.each {|aet|
            AreaElementUnitTypeEffects.create :unit_type => ut, :area_element_type => aet, :combat_bonus => row[@@MOVEMENT_COST_START_INDEX+2*terrains.size+aet.id]
          }

        end

        row_hash[ut.id] = row
        
        # print "\t"+row[0]+","+row[1]+","+row[2]+","+row[3]+","+row[4]+","+row[5]+","+row[6]+","+row[7]+","+row[8]+","+row[9]+","+row[10]+","+row[11]+","+row[12]+","+row[13]+","+row[14]+","+row[15]+","+row[16]+","+row[17]+","+row[18]+","+row[19]+","+row[20]+","+row[21]+","+row[22]+","+row[23]+","+row[24]+","+row[25]+","+row[26]+","+row[27]+","+row[28]+","+row[29]+","+row[30]+","+row[31]+"\n";
      else
        headers = row
      end
    end

    att_unit_types = UnitType.find :all
    def_unit_types = Array.new att_unit_types
    att_unit_types.each {|att_ut|
      the_row = row_hash[att_ut.id]
      def_unit_types.each {|def_ut|
        utute = UnitTypeUnitTypeEffects.find :first, :conditions => ["att_unit_type_id = ? and def_unit_type_id = ?", att_ut.id, def_ut.id]
        if utute
          utute.combat_bonus = the_row[@@MOVEMENT_COST_START_INDEX+2*terrains.size+2+def_ut.id]
          utute.save
        else
          UnitTypeUnitTypeEffects.create :combat_bonus => the_row[@@MOVEMENT_COST_START_INDEX+2*terrains.size+2+def_ut.id], :att_unit_type => att_ut, :def_unit_type => def_ut
        end
       }
    }
  end

  def is_allowed_to_build user, gs
    if !user || !gs
      return false
    end
    
    if self.name == "chief"
      chiefs = Unit.units user, self, gs

      if (chiefs.size > 0)
        return false
      end
    end

    return true
  end
end