class Order < ActiveRecord::Base
  belongs_to :unit
  belongs_to :area_element
  
  validates_numericality_of :turn
  
  #
  # Order Parser
  #   
  def Order.next_part the_order_string    
    the_comma_index = the_order_string.index(',')
    the_return_string = the_order_string.slice!(0, the_comma_index+1)  
    
    return the_return_string.delete(',').strip()
  end
  
  def Order.parse_unit_order_string gs, the_user_id, the_order_string          
      the_unit_id = Order.next_part(the_order_string).to_i
      # puts("\t\tthe_unit_id: #{the_unit_id}")
               
      the_num_of_orders = Order.next_part(the_order_string).to_i
      # puts("\t\tthe_num_of_orders: #{the_num_of_orders}")
    
      unit = Unit.unit_alive the_unit_id, gs
      
      for order_index in 1..the_num_of_orders do
        the_order_type = Order.next_part(the_order_string)        
        # puts("\t\tthe_order_type: #{the_order_type}")

        the_from_hex_index = Order.next_part(the_order_string).to_i
        # puts("\t\tthe_from_hex_index: #{the_from_hex_index}")
        
        the_dest_hex_index = Order.next_part(the_order_string).to_i
        # puts("\t\tthe_dest_hex_index: #{the_dest_hex_index}")
                    
        if (unit) && (unit.user_id == the_user_id)
          order = Order.create :order_type => the_order_type, :turn => gs.current_turn_number, :from_hex_index => the_from_hex_index, :dest_hex_index => the_dest_hex_index, :has_been_executed => false
          unit.orders << order
          order.unit = unit
          order.save
          unit.save
        
          # puts(" ** Unit Order Created ** ")
        end
      end               
   end
 
   def Order.parse_area_element_order_string gs, the_user_id, the_order_string
      the_area_element_id = Order.next_part(the_order_string).to_i
      # puts("\t\tthe_area_element_id #{the_area_element_id}")
               
      the_num_of_orders =Order.next_part(the_order_string).to_i
      # puts("\t\tthe_num_of_orders: #{the_num_of_orders}")
    
      area_element = gs.area_elements.find :first, :conditions => ["id = ?",the_area_element_id]
      for order_index in 1..the_num_of_orders do
        the_order_type = Order.next_part(the_order_string)        
        # puts("\t\tthe_order_type: #{the_order_type}")
      
        the_action = Order.next_part(the_order_string)
        # puts("\t\tthe_action: #{the_action}")
              
        if (area_element) && (area_element.user_id == the_user_id)
          order = Order.create :order_type => the_order_type, :turn => gs.current_turn_number, :action => the_action, :has_been_executed => false        
          area_element.orders << order
          order.area_element = area_element
          order.save
          area_element.save
        
          # puts(" ** Area Element Order Created ** ")
        end
      end                         
  end
      
  def heal
    # print "*** Heal Unit ***\n"
    self.hist_succeded = true
    self.hist_from_hex_index = self.from_hex_index
    self.hist_my_start_healt = self.unit.healt
    
    area = self.unit.game_session.region.areas.find :first, :conditions => ["position_index = ?",self.unit.location_hex_index]

    if self.unit.healt < 9
      healt = 0
      if self.unit.unit_type.name == "berserker"
        healt = area.terrain.healing_modifier + Integer((8 - (self.unit.healt + 1)) / 2)
      elsif self.unit.is_unit_ship?
        healt = 1
      else
        healt = area.terrain.healing_modifier
      end

      if self.unit.healt == 8 && healt > 1
        healt = 1
      end
      
      self.unit.healt += healt
      self.hist_my_looses = healt

    end
    
    self.has_been_executed = true
    self.save
    
    self.unit.save    
    
    return true        
  end

private
  def do_move    
    self.hist_from_hex_index = self.unit.location_hex_index
    self.hist_succeded = true
    
    self.unit.location_hex_index = self.dest_hex_index
    self.unit.save 
    
    self.has_been_executed = true        
    self.save
  end

  def do_move_embak unit_to_embak_on
    do_move
    self.action = "embak"
    self.unit.location_hex_index = -1
    
    unit_to_embak_on.units_in_cargo << self.unit

    unit_to_embak_on.save
    self.unit.save
    self.save
  end

  def do_move_disembak
    do_move
    self.hist_from_hex_index = self.unit.in_cargo_of.location_hex_index

    self.unit.in_cargo_of.units_in_cargo.delete(self.unit)
    self.unit.in_cargo_of.save
    self.unit.save
    self.save
  end
  
public
  def is_from_hex_ok
    if self.unit.in_cargo_of
      return ((self.unit.location_hex_index == -1) && (self.unit.in_cargo_of.location_hex_index == self.from_hex_index))
    else
      return (self.unit.location_hex_index == self.from_hex_index)
    end
  end
  
  def move    
    if ((self.unit.healt > 0) && (self.is_from_hex_ok))
      user = self.unit.user
      current_game_session = self.unit.game_session
      area = current_game_session.region.areas.find :first, :conditions => ["position_index = ?",self.dest_hex_index]
      area_elements_in_area = current_game_session.area_elements.find :all, :conditions => ["location_hex_index = ?",self.dest_hex_index]
        
      if area.is_any_units_in_area current_game_session
        unit_with_cargo_space = area.get_unit_with_cargo_space_in_area current_game_session
        if unit_with_cargo_space && self.unit.can_embak? && unit_with_cargo_space.room_left_in_cargo?
          do_move_embak unit_with_cargo_space
          return true
        end

        return false
          
      elsif (area_elements_in_area) && (area_elements_in_area.length > 0)
          area_elements_in_area.each do |ae|
            if ((ae.area_element_type.name == "city") || (ae.area_element_type.name == "harbor")) && (ae.user != user) && (ae.user != nil)
              self.hist_from_hex_index  = self.dest_hex_index
              self.save
              return false

            elsif ((ae.area_element_type.name == "city") || (ae.area_element_type.name == "harbor")) && (ae.user == nil)
              self.hist_area_element_user_id = ae.user
              ae.conqured(user)
              do_move
              
              return true

            else
              do_move
              return true
              
            end
          end
      elsif (self.unit.in_cargo_of)
          do_move_disembak
          return true;          
      else
          do_move
          return true;           
        end                               
      end   
      
      self.hist_from_hex_index  = self.dest_hex_index
      self.save
      
      return false;      
  end

  def update_unit_experience the_unit
    rand_value = 1 + rand(2**(2 + the_unit.experience));
    if (rand_value == 1)
      the_unit.experience +=1
    end
  end

  def kill_units_in_cargo the_unit, gs
    if the_unit.units_in_cargo
      the_unit.units_in_cargo.each do |a_unit_in_cargo|
        a_unit_in_cargo.healt = 0
        a_unit_in_cargo.died_in_turn = gs.current_turn_number
        a_unit_in_cargo.save
      end
    end
  end
  
  def attack_unit gs, def_unit
    combat_system = CombatSystemVikiwar.new logger
    
    print "*** Attack Unit ***\n"
    print "att_unit: #{self.unit.id}, #{}(str)\n"
    print "def_unit: #{def_unit.id}\n"

    att_unit = self.unit

    self.hist_succeded = true
    self.hist_from_hex_index = self.dest_hex_index
    self.hist_other_unit_id = def_unit.id
    self.hist_my_start_healt = att_unit.healt
    self.hist_other_unit_start_healt = def_unit.healt

    combat_system.combat_close att_unit, def_unit, gs.current_turn_number
    
    self.hist_my_looses = self.hist_my_start_healt - att_unit.healt
    self.hist_other_unit_looses = self.hist_other_unit_start_healt - def_unit.healt
   
    if def_unit.do_have_heal_order
      def_unit.orders[0].hist_succeded = false
      def_unit.orders[0].has_been_executed = true
      def_unit.orders[0].save
    end
    
    if (def_unit.healt == 0)
      def_unit.died_in_turn = gs.current_turn_number
      kill_units_in_cargo(def_unit, gs)
      
      area_element_in_hex = AreaElement.get_area_element_at_index self.dest_hex_index, gs

      if area_element_in_hex
        self.hist_area_element_user_id = area_element_in_hex.user
        area_element_in_hex.user = nil;
        area_element_in_hex.orders.each do |o|
          o.has_been_executed = true;
          o.save
        end
        area_element_in_hex.save

        self.hist_other_area_element_id = area_element_in_hex.id        
      end
    end       

    if (att_unit.healt == 0) 
      att_unit.died_in_turn = gs.current_turn_number
      kill_units_in_cargo(att_unit, gs)
    end
    
    self.has_been_executed = true
    self.save

    update_unit_experience def_unit
    update_unit_experience att_unit

    att_unit.save
    def_unit.save
    
    return true    
  end
  
  def attack_empty_area_element area_element_in_hex
    self.hist_area_element_user_id = area_element_in_hex.user
    area_element_in_hex.user = nil;
    area_element_in_hex.orders.each do |o|
      o.has_been_executed = true;
      o.save

    end
    area_element_in_hex.save

    self.hist_succeded = true
    self.hist_from_hex_index = self.dest_hex_index
    self.hist_other_area_element_id = area_element_in_hex.id
    self.hist_my_start_healt = self.unit.healt
    
    self.has_been_executed = true
    self.save
    
    return true
  end
  
  def attack
    # print "*** Attack ***\n"
    
    gs = self.unit.game_session    
    def_unit = gs.units.find :first, :conditions => ["location_hex_index = ? and healt > '0' ", self.dest_hex_index]
    if ((def_unit) && (self.unit.location_hex_index == self.from_hex_index))
      return attack_unit(gs, def_unit)
    else
      area_element_in_hex = AreaElement.get_area_element_at_index self.dest_hex_index, gs
      
      if area_element_in_hex && area_element_in_hex.user != nil && area_element_in_hex.user != self.unit.user && self.unit.location_hex_index == self.from_hex_index
        return attack_empty_area_element(area_element_in_hex)
      else
        return false
      end
    end
  end

  def raid
    the_user = self.unit.user
    gs = self.unit.game_session
    ae_in_hex = AreaElement.get_area_element_at_index(self.dest_hex_index, gs)

    if !ae_in_hex
      return false
    end
    
    ae_owner_gsus = gs.game_session_user_statuses.find :first, :conditions => ["user_id = ?",ae_in_hex.user.id]
    current_gsus = gs.game_session_user_statuses.find :first, :conditions => ["user_id = ?",the_user.id]

    if !ae_owner_gsus || !current_gsus
      return false
    end
    
    if ae_owner_gsus.resources >= 20
      self.hist_my_looses = self.hist_other_unit_looses = 20
      ae_owner_gsus.resources -= 20
      current_gsus.resources += 20

    else
      self.hist_my_looses = self.hist_other_unit_looses = ae_owner_gsus.resources      
      current_gsus.resources += ae_owner_gsus.resources
      ae_owner_gsus.resources = 0

    end
    current_gsus.save
    ae_owner_gsus.save

    self.hist_succeded = true
    self.has_been_executed = true
    self.save

    return true
  end
  
  def upgrad
    gs = self.unit.game_session
    area_element_in_hex = AreaElement.get_area_element_at_index self.dest_hex_index, gs

    if area_element_in_hex && area_element_in_hex.user != nil && area_element_in_hex.user == self.unit.user && self.unit.location_hex_index == self.from_hex_index
      if area_element_in_hex.upgrad
          self.unit_id = self.unit.id
          self.has_been_executed = true
          self.hist_succeded = true
          self.hist_from_hex_index = area_element_in_hex.location_hex_index
          self.hist_user_id = self.unit.user.id
          self.hist_unit_type_id = self.unit.unit_type.id
          self.save
          
          return true
      end
    end

    return false
  end

  def build
      current_game_session = self.area_element.game_session
      user = self.area_element.user
      gsus = current_game_session.game_session_user_statuses.find :first, :conditions => ["user_id = ?",user.id]
      area = current_game_session.region.areas.find :first, :conditions => ["position_index = ?",self.area_element.location_hex_index]
      if area.is_any_units_in_area current_game_session
        return false
        
      else
        unit_type = UnitType.find :first, :conditions => ["name = ?",self.action]
      
        if (unit_type) && (unit_type.level <= current_game_session.level) && (unit_type.resource_cost <= gsus.resources )
          gsus.resources -= unit_type.resource_cost
          gsus.save
          
          the_unit = Unit.create(
            :unit_type => unit_type, 
            :healt => 9, 
            :experience => 1,
            :location_hex_index => self.area_element.location_hex_index, 
            :game_session => current_game_session,
            :user => user)

          self.unit_id = the_unit.id
          self.has_been_executed = true
          self.hist_succeded = true
          self.hist_from_hex_index = self.area_element.location_hex_index
          self.hist_user_id = user.id
          self.hist_unit_type_id = unit_type.id
          self.save
          
          return true
           
        else
           return false
           
        end                        
      end
  end
  
  def execute
    if (self.unit == nil) && (self.area_element == nil)
      return false    
    end
    
    if (self.unit)
      self.unit.reload
    else
      self.area_element.reload
    end
    
    if ( ((self.unit) && (self.unit.healt > 0)) || (self.area_element) )                          
      if (self.has_been_executed == false)
      
        if ((self.unit) && (self.order_type == "move"))
          return move      
        
        elsif ((self.unit) && (self.order_type == "attack"))
          return attack
        
        elsif ((self.unit) && (self.order_type == "raid"))
          return raid

        elsif ((self.unit) && (self.order_type == "heal"))
          return heal

        elsif ((self.unit) && (self.order_type == "upgrad"))
          return upgrad
          
        elsif ((self.area_element) && (self.order_type == "build"))
          return build
        
        end            
      else
          return false
        
      end
    else
      return false
      
    end
  end
end
