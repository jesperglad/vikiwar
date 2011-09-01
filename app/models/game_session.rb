require 'csv'
# require 'json/pure'

class GameSession < ActiveRecord::Base
  # @@COLORS = ["blue","red","green","purple","yellow"]
  @@COLORS = ["blue","red","green","purple"]
  
  belongs_to :region
  belongs_to :host, :class_name => "User", :foreign_key => :host_id
  has_many :units
  has_many :area_elements
  
  has_many :game_session_user_statuses
  has_many :users, :through => :game_session_user_statuses

  validates_presence_of :name

  validates_associated :region
  
#
# General Game Session class methods
#  
def GameSession.state(key)
  return @@STATES[key]
end
  
def GameSession.get_colors
  return @@COLORS
end


def GameSession.clean_all
  # puts "**** GameSession.clean_all ****"
  gss = GameSession.find :all

  gss.each do |gs|
    puts "\tgs: #{gs.name}, #{gs.id} ... "
    if !Region.find_by_id(gs.region) # Do region exists? If not lets clean up!
      puts "\tDeleting"
      # Area.remove_all_areas_in_region gs.region.id
      gs.destory_all_child_rows true #units, areaelements, and gsus
      gs.destroy
    end
  end
end

def get_gsus the_user
  return game_session_user_statuses.find(:first, :conditions => ["user_id = ?",the_user.id])
end

def go_active  
  # self.reload
  if (self.get_num_of_active_users == self.max_num_of_players)
    self.state = "ACTIVE"
    self.latest_turn_ended_at = Time.now
    self.save

    self.game_session_user_statuses.each do |gsus|
      gsus.user.num_of_games += 1
      gsus.user.save
      # puts "GameSession.go_active #{gsus.user.name}"
      NextworldMailer.deliver_battle_started_mail(gsus.user, self.name)
    end
    
    NewsItem.create(
      :title => "There will be blood",
      :news_date => Time.now,
      :tag => "battle-news",
      :content => "The battle of '"+self.name+"' has started.")
    
  end
end

def get_users_name
  users_name = Hash.new
  
  game_session_user_statuses.each do |gsus|
    users_name[gsus.user.id] = gsus.user.in_game_name
  end
 
  return users_name
end

def get_user_colors
  user_colors = Hash.new
  game_session_user_statuses.each do |gsus|
    user_colors[gsus.user.id] = gsus.user_color
  end
  
  return user_colors
end  

def get_users_status
  users_status = Hash.new
  game_session_user_statuses.each do |gsus|
    us = Array.new
    us[0] = gsus.orders_recived       
    us[1] = User.is_user_online(User.find_by_id(gsus.user.id))
    us[2] = gsus.state
    us[3] = gsus.ask_for_peace
    us[4] = gsus.user.rank
    us[5] = is_allowed_to_be_reminde(gsus.user)
    users_status[gsus.user.id] = us

    # puts "get_users_status: #{us}"
  end

  
  return users_status  
end

  #
  # Game Session Setup
  # 
  def clone_game_session    
    gs_clone = GameSession.create(
      :name => self.name,
      :state => self.state,
      :max_num_of_players => self.max_num_of_players,
      :starting_gold => self.starting_gold,
      :level => self.level,
      :current_turn_number => self.current_turn_number,
      :duration_between_turns => self.duration_between_turns,
      :latest_turn_ended_at => self.latest_turn_ended_at
    )
    
    gs_clone.region = self.region
    self.users.each do |user|
      gs_clone.user_add_proxy(user)
      user.save
    end      

    self.units.each do |unit|
      unit_clone = unit.clone_unit
      gs_clone.units << unit_clone
      unit_clone.game_session = gs_clone      
      unit_clone.save
    end
    
    self.area_elements.each do |ae|
      ae_clone = ae.clone_area_element
      ae_clone.game_session = gs_clone
      ae_clone.save
    end
    
    gs_clone.save
    
    return gs_clone    
  end  

  def destory_all_child_rows do_force
    # Check if there is any users still refering to this game_session
    # puts "GameSession.destory_all_child_rows #{do_force}"
    
    num_of_users = 0
    game_session_user_statuses.each do |gsus|
      if (!gsus.removed)
        num_of_users += 1
      end
    end
    
    puts "\tnum_of_users = #{num_of_users}"
    if ((num_of_users > 0) && (do_force))
      puts "\treturn false;"
      return false
    else
      # self.region.children.delete(self)
      puts "\tdestroy units"
      self.units.each do |u|
        u.destroy
      end

      puts "\tdestroy area elements"
      self.area_elements.each do |ae|
        ae.destroy
      end

      puts "\tdestroy gsus"
      self.game_session_user_statuses.each do |gsus|
        puts "\t\tdestroy gsus #{gsus.user.name}"
        gsus.user.game_session_user_statuses.delete gsus
        gsus.destroy
      end
      
      puts "\treturn true;"
      return true;
    end

  end

  #
  # User handling
  #
  def get_num_of_active_users
    puts "game_session.get_num_of_active_users"
    num_of_active_users = 0
    game_session_user_statuses.each do |gsus|
      if (gsus.state == "active")
        num_of_active_users += 1
      end
    end

    puts "game_session.get_num_of_active_users return #{num_of_active_users}"

    return num_of_active_users
  end

  def user_in_game_session (the_user) 
    the_user_in_gs = users.find :first, :conditions => ["user_id = ?",the_user.id]
    
    if (the_user_in_gs)
      return true
    else 
       return false
    end
  end

  def get_num_of_poxy_users
    the_proxy_users = self.users.find :all, :conditions => "account_type = 'proxy_user' "

    if the_proxy_users == nil
      return 0
    else
      return the_proxy_users.size
    end
  end

  def replace_user(new_user, old_user, the_user_state)      
      the_units = Unit.units old_user, nil, self
      the_units.each do |unit|
        new_user.units << unit
        unit.save
      end

      the_area_elements = self.area_elements.find :all, :conditions => ["user_id = ?",old_user.id]
      the_area_elements.each do |ae|
        new_user.area_elements << ae
        ae.save
        ae.reload()
      end
     
      gsus = get_gsus old_user
      gsus.user = new_user
      gsus.state = the_user_state
      gsus.save
      
      self.save
  end
  
  def user_join(the_user, the_user_state)
    # puts "user_join, the_user: #{the_user.name}"
    # self.reload
    the_proxy_user = self.users.find :first, :conditions => "account_type = 'proxy_user' "        
    if the_proxy_user
      self.replace_user(the_user, the_proxy_user, the_user_state)

      NewsItem.create(
        :title => "A viking go to war",
        :news_date => Time.now,
        :tag => "battle-news",
        :content => "'"+the_user.in_game_name+"' is going to war, and has joined the battle of '"+self.name+"'.")
    end        

    self.go_active    
  end

  def user_add_proxy(the_user)
    # puts "user_add_proxy, the_user: #{the_user.name}"
    the_color = @@COLORS[users.size]
    GameSessionUserStatus.create(:game_session => self, :user => the_user, :state => "proxy", :user_color => the_color, :resources => self.starting_gold, :orders_recived => false)
  end

  def user_remove(the_user)
    num_of_free_slots = self.max_num_of_players - self.get_num_of_poxy_users
    proxy_user_name = "Open "+num_of_free_slots.to_s
    proxy_user = User.find :first, :conditions => ["name = ?", proxy_user_name]

    if self.max_num_of_players == self.get_num_of_poxy_users
      self.game_session_user_statuses.each do |gsus|
        gsus.removed = true
        gsus.save
      end

      replace_user(proxy_user, the_user, "proxy")
      
      if self.destory_all_child_rows(false)
        self.destroy
      end
    end

    
  end

  def is_allowed_to_be_reminde(the_user)
    if self.state == "ACTIVE"
      gsus = GameSessionUserStatus.find :first, :conditions => ["user_id = ? and game_session_id = ?", the_user.id, self.id]
      return gsus.is_allowed_to_be_reminde
    end

    return false
  end

  def send_reminder(to_user, from_user)
    # puts "**** send_reminder "
    if self.is_allowed_to_be_reminde(to_user)
      # puts "**** send_reminder is allowed"
      NextworldMailer.deliver_reminder_time_is_up(to_user, from_user, self)
      gsus = GameSessionUserStatus.find :first, :conditions => ["user_id = ? and game_session_id = ?", to_user.id, self.id]
      gsus.reminder_send = true
      gsus.save
      
    end
  end
  
  #
  # Order Parser
  #   
  def next_order_part the_order_string    
    the_comma_index = the_order_string.index(',')
    the_return_string = the_order_string.slice!(0, the_comma_index+1)
    #puts("next_order_part: the_return_string = \"#{the_return_string}\" the_order_string = \"#{the_order_string}\"");
    
    return the_return_string.delete(',').strip()
  end
 
  
  def parse_order_string the_user_id, the_order_string
    # puts("\tparse_order_string")
       
    while ((the_order_string != nil) && (the_order_string.length > 1))
      the_element_type = next_order_part(the_order_string)
      # puts("\t\tthe_element_type: #{the_element_type}")

      if (the_element_type == "unit") 
        Order.parse_unit_order_string self, the_user_id, the_order_string
      elsif (the_element_type == "area_element")
        Order.parse_area_element_order_string self, the_user_id, the_order_string
      end

    end            
  end
    
  #
  # Order handling
  #
  def save_orders(the_user_id, the_orders_string)
    # puts("save_orders: #{the_orders_string}")
    # delete_orders the_user_id
    gsus = game_session_user_statuses.find :first, :conditions => ["user_id = ?",the_user_id]
    
    parse_order_string the_user_id, the_orders_string        
    gsus.orders_recived = true
    gsus.last_turn_order_recived = self.current_turn_number
    gsus.save        
  end
  
  def delete_orders the_user_id
    units_owned_by_user = Unit.units the_user, nil, self

    units_owned_by_user.each do |u|
      u.orders.each do |o|
        Order.delete(o)
      end
    end
    
    area_elements_owned_by_user = area_elements.find :all, :conditions => ["user_id = ?",the_user_id.to_s]
    area_elements_owned_by_user.each do |ae|
      ae.orders.each do |o|
        Order.delete(o)
      end
    end
    
  end
  
  def is_all_orders_recived    
    self.game_session_user_statuses.each do |gsus|
      if ((gsus.orders_recived == false) && (gsus.state == "active"))
        return false        
      end
    end
   
    return true
  end

  def income gsus
    the_income = 0

    area_elements_owned_by_user = self.area_elements.find :all, :conditions => ["user_id = ?",gsus.user.id]

    area_elements_owned_by_user.each do |ae|
      the_income += ae.modified_resource_gain
    end

    gsus.income = the_income
    gsus.save
    
    return the_income
  end
  
  def expenses gsus
      the_expenses = 0
      units_owned_by_user = Unit.units_alive gsus.user, self
      units_owned_by_user.each do |unit|
        the_expenses += unit.unit_type.maintenance_cost
      end

      gsus.expenses = the_expenses
      gsus.save

      return the_expenses
  end

  def phase_collect_resources    
    self.game_session_user_statuses.each do |the_gsus|
      the_gsus.reload
      the_income = income the_gsus

      the_gsus.resources += the_income
      the_gsus.save
      
    end      
  end

  
  def phase_handle_expenses
    self.game_session_user_statuses.each do |the_gsus|
      total_cost = expenses the_gsus
      
      if total_cost > the_gsus.resources        
        units_owned_by_user =  Unit.units_alive the_gsus.user, self
        new_cost = total_cost        
        
        while new_cost > the_gsus.resources && units_owned_by_user.size > 0
          rand_unit_index = rand units_owned_by_user.size
          unit_to_be_removed = units_owned_by_user.delete_at rand_unit_index
                   
          unit_to_be_removed.healt = -100 # A healt value of -100 indicate the unit died from starvation
          unit_to_be_removed.died_in_turn = self.current_turn_number
          unit_to_be_removed.save
          
          new_cost -= unit_to_be_removed.unit_type.maintenance_cost
        end
        the_gsus.resources = 0
        the_gsus.save
        
        expenses the_gsus # We need to set the recalculated expenses in the databases

      else
        the_gsus.resources -= total_cost        
        
      end
      the_gsus.save
      
    end
  end
  
  def phase_sort_orders
    orders_initiative = Array.new           
    
    units.each do |u|
      if u.healt > 0
        order_counter = 0

        unit_orders_this_turn = u.orders.find :all, :conditions => ["turn = ?",self.current_turn_number]
        
        # Do unit have orders       
        if unit_orders_this_turn.length > 0                  
          unit_orders_this_turn.each do |o|          
            order_initiative_bonus = 1000000 + (order_counter * 1000)
            if (o.order_type == "upgrad")
              order_initiative_bonus += 20
            elsif (o.order_type == "attack")
              order_initiative_bonus += 30
            elsif  (o.order_type == "move")
              order_initiative_bonus += 40
            end                         
            ini = ((u.unit_type.initiative.to_f + u.experience.to_f)*(10.0 + 2.0*(rand-0.5)*u.unit_type.randomness.to_f))/10.0 +order_initiative_bonus
            orders_initiative.push [o, order_initiative_bonus, ini]
            o.initiative = ini
            o.save
            
            order_counter += 1
          end
       else # The unit do not have any order such it will heal if it needs           
         if (u.healt < 9) 
            o = Order.create :order_type => "heal", :turn => self.current_turn_number, :from_hex_index => u.location_hex_index, :dest_hex_index => u.location_hex_index, :has_been_executed => false
            u.orders << o
            o.unit = u            
            u.save                                 
            
            order_initiative_bonus = ini = 500000
            orders_initiative.push [o, order_initiative_bonus, ini]
            o.initiative = ini
            o.save
         end         
       end
      end
    end
        
    area_elements.each do |ae|
      order_counter = 0      
      ae_orders_this_turn  = ae.orders.find :all, :conditions => ["turn = ?",self.current_turn_number]
      ae_orders_this_turn.each do |o|
        order_initiative_bonus = 0
        if  (o.order_type == "build")
          order_initiative_bonus += 100
        end                    
      
        ini =  rand + order_initiative_bonus
        orders_initiative.push [o, ini, ini]     
        o.initiative = ini
        o.save
        
        order_counter += 1 
      end
    end
        
    orders_initiative.sort! {|a,b| a[2] <=> b[2]}
        
    # orders_sorted = Array.new
    # orders_initiative.reverse_each do |a|
    #  orders_sorted.push a
    # end    

    # print "Orders sorted:\n"
    orders_initiative.each do |a|
      print "\tOrder type - initiative: #{a[0].initiative}, order: #{a[0].id}, unit: #{a[0].unit_id} , order type: #{a[0].order_type}, from: #{a[0].from_hex_index}, dest: #{a[0].dest_hex_index}, turn = #{a[0].turn}\n"
    end
    
    return orders_initiative
  end  
  
  def phase_execute_orders orders_sorted    
    at_least_one_order_executed = true
    num_of_orders_executed = 0
    while at_least_one_order_executed
      at_least_one_order_executed = false
      orders_sorted.each do |a|
        o = a[0]
        o.reload
        if (o.has_been_executed == false)
            puts "***** DO UPGRAD 3 *****"
            if o.execute
              num_of_orders_executed += 1
              o.hist_executed_as_order_num = num_of_orders_executed
              o.save
              
              at_least_one_order_executed = true                                     
            end
            # Order.destroy(o)          
          end          
      end               
    end

    orders_sorted.each do |a|
      o = a[0]
      o.reload
      if !o.has_been_executed
        num_of_orders_executed += 1
        o.hist_executed_as_order_num = num_of_orders_executed
        o.save     
      end
    end

    # orders_sorted.each do |a|
    #  o = a[0]
    #  Order.destroy(o)      
    # end
    
    # Remove all units with less than zero healt
    # self.units.each do |u|
    #  u.reload
    #  print "\tUnits: u.healt: #{u.healt}\n"      
    #  if (u.healt <= 0)
    #    print "\t\tDeleting unit: u.id: #{u.id}\n"
    #    Unit.destroy(u)
    #   end      
    # end

    # Remove all the executed orders text
    gsuses = game_session_user_statuses.find :all    
    gsuses.each do |gsus|      
      gsus.orders_result_text = nil
      gsus.orders_recived = false
      gsus.save
    end            
    # puts(" end execute_orders()")
  end
  
  #
  #
  #
# def get_resource_info user_id
#  resource_info = Hash.new
#
#  area_elements_owned_by_user = self.area_elements.find :all, :conditions => ["user_id = ?",user_id]
#  area_elements_owned_by_user.each do |ae|
#    if ae.resource_gain > 0
#      if resource_info[ae.area_element_type.name]
#        resource_info[ae.area_element_type.name] += ae.resource_gain
#      else
#        resource_info[ae.area_element_type.name] = ae.resource_gain
#      end
#    end
#  end
#
#  units_owned_by_user = self.units.find :all, :conditions => ["user_id = ? and healt > '0' ",user_id]
#  units_owned_by_user.each do |unit|
#    if resource_info[unit.unit_type.name]
#        resource_info[unit.unit_type.name] -= unit.unit_type.maintenance_cost
#    else
#      resource_info[unit.unit_type.name] = -unit.unit_type.maintenance_cost
#    end
#  end
#
#  return resource_info
# end

  #
  #
  #
  def update_user_state
    # puts "GameSession.update_user_state"
    game_session_user_statuses.each do |gsus|
      area_elements_owned_by_user = self.area_elements.find :all, :conditions => ["user_id = ?",gsus.user.id]
      
      num_of_cities = 0
      area_elements_owned_by_user.each do |ae|
        # TODO: Needs update to support more AreaElements
        if((ae.area_element_type.name == "city") || (ae.area_element_type.name == "harbor"))
          num_of_cities += 1
        end        
      end
      
      if (num_of_cities == 0) || (gsus.is_chief_killed?)
        if (gsus.state == "active")           
          gsus.state = "killed"
          gsus.save
          NextworldMailer.deliver_battle_ended_mail(@the_user, gs.name)
        end              
      end
      # puts "GameSession.update_user_state, gsus.user.name: #{gsus.user.name}, gsus.state: #{gsus.state}, gsus.last_turn_order_recived: #{gsus.last_turn_order_recived}, self.current_turn_number: #{self.current_turn_number} "
      if ((gsus.state == "active") && (gsus.last_turn_order_recived <= self.current_turn_number - 3))
        gsus.state = "inactive"
        gsus.save
      end
    end
  end

  def is_duration_between_turns_passed
    the_now = Time.now
    dt = (the_now.to_i - self.latest_turn_ended_at.to_i)*1000

    return dt >= self.duration_between_turns
  end

  def game_session_ended
      winner = nil
      loosers = Array.new
      game_session_user_statuses.each do |gsus|
        if gsus.state == "killed" || gsus.state == "inactive"
          gsus.user.did_loose
          loosers.push gsus.user

        elsif gsus.state == "active"
          gsus.user.did_win self
          winner = gsus.user
        end
      end

      if winner
        loosers.each do |looser|
          User.update_rankings winner, looser
        end

        NewsItem.create(
          :title => "We have a winner",
          :news_date => Time.now,
          :tag => "battle-news",
          :content => "A new victory for "+winner.name+" in the battle of '"+self.name+"'.")
      end
      
      self.state = "ENDED"
      self.save

  end
  
  def check_for_peace
    everyone_accepts_peace = true
    game_session_user_statuses.each do |gsus|
      # if (((gsus.state == "active") || (gsus.state == "inactive")) && (gsus.ask_for_peace == false))
      if ((gsus.state == "active")  && (gsus.ask_for_peace == false))
        everyone_accepts_peace = false
      end
    end

    if everyone_accepts_peace
      self.state = "PEACE"
      self.save

      NewsItem.create(
          :title => "Pease",
          :news_date => Time.now,
          :tag => "battle-news",
          :content => "What is the world comming to? The battle of '"+self.name+"' ended in peace.")

    end
  end
  
  def check_victory_condition
    update_user_state    
        
    if self.state == "ACTIVE" &&  get_num_of_active_users < 2
      game_session_ended
    end
  end

  def next_turn  
    self.latest_turn_ended_at = Time.now
    self.current_turn_number = self.current_turn_number+1
    self.is_end_turn_recived = false;
    self.save
  end

  private
  def send_next_turn_emails
      game_session_user_statuses.each do |gsus|
        if ((gsus.state == "active") && (gsus.user != @current_user))
          next_turn_at = self.latest_turn_ended_at + self.duration_between_turns
          if gsus.user.recive_email_notifications
            NextworldMailer.deliver_next_turn_mail(gsus.user, self.name, self.current_turn_number, next_turn_at)
          end
        end
      end    
  end

  public
  def execute_current_turn the_current_user
    @current_user = the_current_user
    
    # puts "execute_current_turn (is_all_orders_recived: #{is_all_orders_recived} is_duration_between_turns_passed: #{is_duration_between_turns_passed})"
    if is_all_orders_recived || is_duration_between_turns_passed
      # puts "execute_current_turn (is_all_orders_recived || is_duration_between_turns_passed)"
      # Remove all the executed orders text
      gsuses = game_session_user_statuses.find :all
      gsuses.each do |gsus|          
          gsus.orders_recived = false
          gsus.reminder_send = false
          gsus.save
      end

      orders_sorted = phase_sort_orders
      phase_execute_orders orders_sorted

      phase_collect_resources
      phase_handle_expenses

      check_victory_condition
      check_for_peace

      next_turn      

      send_next_turn_emails

      return true
    else

      return false
    end
  end

public
  def history_last_turn the_user_id
    print "*** game_session.history\n"

    gsus = game_session_user_statuses.find :first, :conditions => ["user_id = ?",the_user_id]

    if !gsus.game_data_json || !gsus.hist_game_data_json
      return nil
    end

    game_data = JSON.parse(gsus.game_data_json)
    hist_game_data = JSON.parse(gsus.hist_game_data_json)

    visible_hexs = JSON.parse(game_data[2])
    hist_visible_hexs = JSON.parse(hist_game_data[2])

    all_visible_hexs = visible_hexs | hist_visible_hexs
    all_visible_units = Array.new
    all_visible_area_elements_h = AreaElement.create_area_elements_hash(the_user_id, all_visible_hexs, self)
    all_visible_units_h = Hash.new
    all_visible_orders = Array.new

    # Find all units alive at the start of this turn, as even a killed unit might have an order worth viewing
    units_alive_at_start_of_turn = Unit.units_alive_at_start_of_turn self
    units_alive_at_start_of_turn.each do |u|
        print "\t *** the unit #{u.location_hex_index} ***\n";

        unit_orders = u.orders.find :all, :conditions => ["turn = ? and has_been_executed = true", (self.current_turn_number-1)]
        unit_orders.each do |o|
          # Is the order from hex among the visible hexes or is the order succed and the dest hex among the visible hexes
          if all_visible_hexs.include?(o.from_hex_index) || (o.hist_succeded && (all_visible_hexs.include?(o.dest_hex_index)))
            all_visible_orders.push(o)
            print "\t\tOrder\t  (#{o.order_type}: #{o.from_hex_index} -> #{o.dest_hex_index})\n"

            if all_visible_units_h[u.location_hex_index] == nil            
              all_visible_units_h[u.location_hex_index] = [Unit.create_unit_info_array(the_user_id, self, u)]
              print "\t\tUnit\t1-(#{u.location_hex_index})\n"
            else
              # Such there were an existing unit, lets check if it is the same unit (we do not want to have two of the same)
              isNotAdded = true
              all_visible_units_h[u.location_hex_index].each do |a_unit_array|
                if a_unit_array[0] == u.id
                  isNotAdded = false
                end                   
              end
              
              if isNotAdded
                all_visible_units_h[u.location_hex_index].push(Unit.create_unit_info_array(the_user_id, self, u));
              end                    
            end

            # Ensure that unit getting attacked is added, even if these unit is not in a visible hex
            # Do the order have a hist_other_unit_id and is the current unit added and is the current unit in a visible hex
            if o.hist_other_unit_id > 0 && all_visible_units_h[u.location_hex_index] && all_visible_hexs.include?(u.location_hex_index)
              other_unit = Unit.unit_from_unit_id(o.hist_other_unit_id, self) # other_unit = Unit.unit_from_unit_id(o.hist_other_unit_id, gs)
              if other_unit && all_visible_units_h[other_unit.location_hex_index] == nil
                all_visible_units_h[other_unit.location_hex_index] = [Unit.create_unit_info_array(other_unit.user_id, self, other_unit)]
                print "\t\tUnit\t2-(#{other_unit.location_hex_index})\n"
              end
            end

            # Do the order include an area element
            if o.hist_area_element_user_id != -1
              the_area_ele = AreaElement.get_area_element_at_index o.dest_hex_index, self
              
              if (the_area_ele) && (o.hist_area_element_user_id != the_area_ele.user_id)
                the_area_ele.user_id = o.hist_area_element_user_id
              end              
            end
          end

          # If a unit have more orders and a former order fails, the following orders should not be executed
          if !o.hist_succeded
            break
          end
        end

        # Has the unit not been added yet, but is still in a visible or semi visible hex?
        if all_visible_units_h[u.location_hex_index] == nil && all_visible_hexs.include?(u.location_hex_index)
          all_visible_units_h[u.location_hex_index] = [Unit.create_unit_info_array(the_user_id, self, u)]
          print "\t\tUnit\t3-(#{u.location_hex_index})\n"            
        end
    end

    # all_visible_units_h = Hash.new()
    # all_visible_units.each do |u|
    #   ua = all_visible_units_h[u.location_hex_index]
    #   if (ua == nil)
    #      ua = Array.new
    #      all_visible_units_h[u.location_hex_index] = ua
    #   end    
    #   ua.push(Unit.create_unit_info_array(the_user_id, self, u))
    # end

    self.area_elements.each do |ae|
       ae_orders_this_turn  = ae.orders.find :all, :conditions => ["turn = ?",self.current_turn_number-1]
       ae_orders_this_turn.each do |o|
         print "o"
          if all_visible_hexs.include?(o.hist_from_hex_index)
            print "p"
            all_visible_orders.push(o)          
          end

          # If a unit have more orders and a former order fails, the following orders should not be executed
          if !o.hist_succeded
            break
          end
        end        
    end  

    all_visible_orders.sort! {|o1,o2| o1.hist_executed_as_order_num <=> o2.hist_executed_as_order_num}

    units_died_from_stavation = Unit.units_starvt self, the_user_id

    return [all_visible_orders, all_visible_units_h, all_visible_area_elements_h, units_died_from_stavation]
  end 


  def invited_user_joins the_user
    puts "*** invited_user_joins"
    gsus = get_gsus the_user
    gsus.state = "active"
    gsus.save
    
    self.go_active
  end
  
  def surrender the_user
    # puts "game_session.surrender, the_user: #{the_user.name}"
    gsus = get_gsus the_user
    gsus.user.looses += 1
    gsus.state = "killed"
    gsus.orders_recived = true

    gsus.save

    check_victory_condition    
  end

  def ask_for_peace the_user
    # puts "game_session.ask_for_preace, the_user: #{the_user.name}"
    
    gsus = get_gsus the_user
    gsus.ask_for_peace = true
    gsus.save

    check_for_peace    
  end

  def ask_not_for_peace the_user
    gsus = get_gsus the_user
    gsus.ask_for_peace = false
    gsus.save

    check_for_peace
  end

  
  def statistics
    data_table = Array.new
    self.users.each do |the_user|
      aes = self.area_elements.find :all, :conditions => ["user_id = ?",the_user.id]
      cities = Array.new
      aes.each do |ae|
        # TODO: Needs update to support more AreaElements
        if ((ae.area_element_type.name == "city") || (ae.area_element_type.name == "harbor"))
          cities.push ae
        end
      end

      row = Array.new
      row.push "'#{the_user.in_game_name}'"
      row.push cities.length

      data_table.push row
    end

    return data_table
  end
  
  def to_CSV
    output = ""+self.name+","+self.state+",#{self.max_num_of_players.to_s},#{self.starting_gold.to_s},#{self.level.to_s},\n"
    output << "#{self.region.w_hex_map},#{self.region.h_hex_map},\n"
    
    line_index = 1
    
    the_areas_sorted = Area.find :all, :conditions => ["region_id = ?",self.region.id], :order => "position_index"
    the_areas_sorted.each do |a|
      # puts "#{a.position_index}, #{line_index}"
      if (a.position_index != line_index)
        count =a.position_index - 1
        puts "*** line_index: #{line_index}, count: #{count}"
        for i in line_index..count
          output << "#{i},-1,,,,\n"
          line_index += 1
          puts "i: #{i}, line_index: #{line_index}, count: #{count}"
        end
      end
      
      output  << "#{a.position_index},#{a.terrain.id},"

      the_unit = Unit.unit_in_hex a.position_index, gs
      if (the_unit)
        output << "#{the_unit.unit_type_id},#{the_unit.user_id},"
      else
        output << ",,"
      end

      the_ae = AreaElement.get_area_element_at_index a.position_index, self
      
      if (the_ae)
        output << "#{the_ae.area_element_type_id},#{the_ae.user_id}\n"
      else
        output << ",\n"
      end
      line_index += 1
    end

    # puts "GS TO CVS, Output: "+output
    
    File.open(self.name+"_game_session.csv", 'w') {|f| f.write(output) }
  end

  def load_csv_row a_row
    puts "load_csv_row( #{a_row.to_s}";
    #{a_row[0]}, #{a_row[1]}, #{a_row[2]})\n";

    self.name = a_row[0]
    self.state = a_row[1]
    self.max_num_of_players = a_row[2]

    if a_row[3]
      self.starting_gold = a_row[3]
    end

    if a_row[4]
      self.level = a_row[4]
    end
    
    self.save
  end

  def load_csv_region_row parent_region, row
   #  print "load_csv_region_row(#{self.name}, #{row[0]}, #{row[1]})\n";
    return parent_region.children.create(:name => self.name, :w_hex_map =>row[0], :h_hex_map => row[1])
    
  end

  def load_csv_main_row row, the_region, uts, aets, users
    # print "*";
    terrains = Terrain.find :all
    
    if (row[0])
      hex_index = row[0].to_i

      if (row[1])
        terrain_index = row[1].to_i
        if terrain_index > 0
          if terrains[terrain_index -1]
            Area.create(:position_index => hex_index, :terrain => terrains[terrain_index-1], :region =>the_region)
          else
            print "*** ERROR ****\n*** ERROR ****\n*** ERROR ****\n\thex_index #{hex_index}, terrain_index #{terrain_index}"
          end
        end

        if row[2]  # Unit
          unit_type_id = row[2].to_i

          if (row[3])
            unit_owner = row[3].to_i;
            if uts[unit_type_id]
              Unit.create(:unit_type => uts[unit_type_id], :experience => 1, :healt => 9, :location_hex_index=> hex_index, :game_session => self, :user => users[unit_owner]);
            else
              print "*** ERROR ****\n*** ERROR ****\n*** ERROR ****\n\thex_index #{hex_index}, unit_type_id #{unit_type_id}"
            end
          end
        end
        
        # TODO: Needs update to support more AreaElements
        if row[4] # City
          ae_type_id = row[4].to_i
          
          ae = AreaElement.create(:area_element_type => aets[ae_type_id],  :location_hex_index=> hex_index,  :game_session => self)
          # print "*"
          if row[5]
            ae_owner = row[5].to_i
            ae.user = users[ae_owner];
            ae.save
          end
        end
      end
    end
  end

  def GameSession.load_CSV file_name    
    puts "Loading: "+file_name+" ... ";

    scandinavia = Region.find(:first, :conditions => "name = 'Scandinavia' ")
    gs = GameSession.create(:name => "", :region => nil, :state => "META", :max_num_of_players => 0)
         
    users = Array.new
    users[1] = User.find_by_name('Open 1')
    users[2] = User.find_by_name('Open 2')
    users[3] = User.find_by_name('Open 3')
    users[4] = User.find_by_name('Open 4')
    users[5] = User.find_by_name('Open 5')
    users[6] = User.find_by_name('Open 6')
    users[7] = User.find_by_name('Open 7')

    unit_types = Array.new
    unit_types[1] = UnitType.find :first, :conditions => "name = 'swordsmen' "
    unit_types[2] = UnitType.find :first, :conditions => "name = 'axemen' "
    unit_types[3] = UnitType.find :first, :conditions => "name = 'pikemen' "
    unit_types[4] = UnitType.find :first, :conditions => "name = 'berserker' "
    unit_types[5] = UnitType.find :first, :conditions => "name = 'horsemen' "
    unit_types[6] = UnitType.find :first, :conditions => "name = 'archers' "
    unit_types[7] = UnitType.find :first, :conditions => "name = 'scouts' "
    
    ae_types = Array.new
    ae_types[1] = AreaElementType.find :first, :conditions => "name = 'city' "
    ae_types[2] = AreaElementType.find :first, :conditions => "name = 'harbor' "

    row_number = 0
    CSV.foreach(file_name) do |row| # CSV.open(file_name, "r") do |rowC|
      # row = rowC.fields
      # puts "#{row_number}: #{row.size}"
      if (row_number == 0)  
        gs.load_csv_row row
        
      elsif (row_number == 1)
        gs.region = gs.load_csv_region_row scandinavia, row

      elsif (row_number > 1)
        # TODO: Needs update to support more AreaElements
        gs.load_csv_main_row row, gs.region, unit_types, ae_types, users
      end      
      row_number += 1
      
    end

    for i in 1..(gs.max_num_of_players)
      gs.user_add_proxy(users[i])
    end
    gs.save
    
  end  
end