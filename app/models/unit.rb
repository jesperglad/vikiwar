class Unit < ActiveRecord::Base
  @@unit_ships = "longships,cargo-vessels,snekkjas"

  belongs_to :unit_type
  belongs_to :user
  belongs_to :game_session

  has_many :units_in_cargo, :class_name => 'Unit', :foreign_key => 'in_cargo_of_id'
  belongs_to :in_cargo_of, :class_name => 'Unit', :foreign_key => 'in_cargo_of_id'

  has_many :orders

def Unit.create_unit_info_array(the_user_id, current_game_session, u)
    if (u.experience == nil)
      u.experience = 0
      u.save
    end
    unit_in_cargo_array = Array.new
    u.units_in_cargo.each do |a_unit_in_cargo|
      unit_in_cargo_array.push(a_unit_in_cargo.id)
    end

    unit_info =[u.id, u.user_id, u.unit_type_id, u.healt, u.location_hex_index, u.experience, u.in_cargo_of_id, unit_in_cargo_array];
    if (u.orders) && (u.user_id == the_user_id)
      unit_orders_this_turn = u.orders.find :all, :conditions => ["turn = ?",current_game_session.current_turn_number]

      orders = nil
      unit_orders_this_turn.each do |order|
        if orders == nil
          orders = Array.new
        end
        orders.push(order.order_type,  order.from_hex_index, order.dest_hex_index)
      end      
    end

    return unit_info
end

def Unit.create_units_hash(the_user_id, visible_hexs, current_game_session)
    units_h = Hash.new()

    units_a = Unit.units_alive nil, current_game_session

    units_a.each do |u|
      # if visible_hexs is nil then we include every unit, otherwise only the units
      # which is in a visible hex
      if visible_hexs == nil || visible_hexs.index(u.location_hex_index) != nil
        ua = units_h[u.location_hex_index]

        if (ua == nil)
          ua = Array.new
          units_h[u.location_hex_index] = ua
        end

        ua.push(Unit.create_unit_info_array(the_user_id, current_game_session, u))

        # For the units added we need to add any additioal units that might be in the cargo
        u.units_in_cargo.each do |a_unit_in_cargo|
          last_index = current_game_session.region.areas.size
          ua2 = units_h[last_index]
          if (ua2 == nil)
            ua2 = Array.new
            units_h[last_index] = ua2
          end
          ua2.push(Unit.create_unit_info_array(the_user_id, current_game_session, a_unit_in_cargo))
        end
      end
    end

    return units_h
end

def Unit.remove_all_units_in_game_session the_game_session_id
  Unit.delete_all(["game_session_id = ?",the_game_session_id])
end

def Unit.unit_from_unit_id the_unit_id, gs
  return Unit.find(:first, :conditions => ["id = ? and game_session_id = ?", the_unit_id, gs.id])
end

def Unit.unit_alive the_unit_id, gs
  # puts "------> unit_alive #{gs.id}"
  return Unit.find(:first, :conditions => ["id = ? and game_session_id = ? and healt > '0' ",the_unit_id, gs.id])
end

def Unit.unit_in_hex the_hex_index, gs
  return Unit.find(:first, :conditions => ["game_session_id = ? and location_hex_index = ?",gs.id, the_hex_index])
end


def Unit.unit_alive_in_hex the_hex_index, gs
  return Unit.find(:first, :conditions => ["game_session_id = ? and location_hex_index = ? and healt > '0'",gs.id, the_hex_index])
end

def Unit.unit the_user, the_unit_type, gs
  if (the_unit_type)
    return Unit.find(:first, :conditions => ["unit_type_id = ? and user_id = ? and game_session_id = ?", the_unit_type.id, the_user.id, gs.id])
  end

  return Unit.find(:first, :conditions => ["user_id = ? and game_session_id = ?", the_unit_type.id, the_user.id, gs.id])
end

def Unit.unit_from_id the_unit_id
  return Unit.find(:first, :conditions => ["unit_id = ?", the_unit_id])
end

def Unit.units_alive the_user, gs  
  if the_user
    # puts "------> unit_alive #{the_user.id}, #{gs.id}"
    return Unit.find(:all, :conditions => ["user_id = ? and game_session_id = ? and healt > '0'",the_user.id, gs.id])
  end

  # puts "------> unit_alive #{gs.id}"
  return Unit.find(:all, :conditions => ["game_session_id = ? and healt > '0'", gs.id])
end

def Unit.units_alive_from_user_id the_user_id, gs
  return Unit.find(:all, :conditions => ["user_id = ? and game_session_id = ? and healt > '0'",the_user_id, gs.id])
end

def Unit.units the_user, the_unit_type, gs
  if (the_unit_type)
    return Unit.find(:all, :conditions => ["unit_type_id = ? and user_id = ? and game_session_id = ?", the_unit_type.id, the_user.id, gs.id])
  end

  return Unit.find(:all, :conditions => ["user_id = ? and game_session_id = ?", the_user.id, gs.id])
end

def Unit.units_alive_at_start_of_turn gs
  return Unit.find(:all, :conditions => ["game_session_id = ? and (healt > '0' or died_in_turn = ?)",gs.id, (gs.current_turn_number-1)])
end

def Unit.units_starvt gs, the_user_id
  return Unit.find(:all, :conditions => ["game_session_id = ? and user_id = ? and died_in_turn = ? and healt = '-100' ", gs.id, the_user_id , (gs.current_turn_number-1)])
end

  def clone_unit()
    # print "_cu_"
    unit_clone = Unit.create(:unit_type => self.unit_type, :experience => self.experience, :user => self.user, :game_session => self.game_session, :healt => self.healt, :location_hex_index=> self.location_hex_index)    
    
    return unit_clone    
  end
  
  def terrain_combat_bonus
    area = self.game_session.region.areas.find(:first, :conditions => ["position_index = ?",self.location_hex_index])
    tute = TerrainUnittypeEffects.find(:first, :conditions => ["unit_type_id = ? and terrain_id = ?", self.unit_type.id, area.terrain.id])
    
    return tute.combat_bonus
  end

  def area_element_combat_bonus
    ae = AreaElement.get_area_element_at_index(self.location_hex_index, self.game_session)
    aeute = AreaElementUnitTypeEffects.find(:first, :conditions => ["unit_type_id = ? and area_element_type_id = ?", self.unit_type.id, ae.area_element_type.id])

    return aeute.combat_bonus
  end
  
  def unit_vs_unit_bonus vs_unit, is_defending
    utute = UnitTypeUnitTypeEffects.find(:first, :conditions => ["att_unit_type_id = ? and def_unit_type_id = ?", self.unit_type_id, vs_unit.unit_type_id])
    return utute.combat_bonus
    
    # return self.unit_type.send("combat_"+vs_unit.unit_type.name)
  end
  
  def combo
    return 0
  end
  
  def rand_value
    return (10.0 + 2.0*(rand - 0.5)*self.unit_type.randomness)/10.0
    
  end
  
  def recive_damage the_amount_of_damge
    self.healt = self.healt - the_amount_of_damge
    self.save
  end
  
  def do_have_heal_order
    if (self.orders.length == 1) && (self.orders[0].order_type == "heal")
        return true              
    end 
    return false    
  end

  def do_have_move_order current_turn
    move_order = orders.find(:first, :conditions => ["order_type = 'move' and turn = ?",current_turn])

    if (move_order)
      return true
    else
      return false
    end
  end

  def is_unit_ship?
    if (@@unit_ships.index(self.unit_type.name))
      return true
    end

    return false
  end
  
  def embak?
    if self.in_cargo_of_id
      return true
    end

    return false
  end

  def can_embak?
    if (@@unit_ships.index(self.unit_type.name))
      return false
    end

    return true
  end

  def room_left_in_cargo?
    self.unit_type.cargo_size > units_in_cargo.size
  end  
end