class AreaElement < ActiveRecord::Base
  belongs_to :area_element_type
  belongs_to :user  
  belongs_to :game_session   
  
  has_many :orders

  def AreaElement.remove_all_area_elements_in_game_session the_game_session_id
    AreaElement.delete_all(["game_session_id = ?",the_game_session_id])
  end

  def AreaElement.get_area_element_at_index hex_index, gs
    return gs.area_elements.find(:first, :conditions => ["location_hex_index = ?",hex_index])
  end

  def clone_area_element()
    # puts "_cae_ #{self.area_element_type.id}"
    ae_clone = AreaElement.create(:area_element_type => self.area_element_type, :user => self.user, :game_session => self.game_session, :location_hex_index=> self.location_hex_index)    
    
    return ae_clone    
  end  
  
  def conqured new_user
    self.user = new_user
    
    orders.each do |o|
      o.has_been_executed = true;
      o.save    
    end
    
    self.save    
  end

  def AreaElement.create_area_elements_hash(the_user_id, visible_hexs, current_game_session)
    ars_h = Hash.new()
    ars_a = AreaElement.find(:all, :conditions => ["game_session_id = ?",current_game_session.id])

    ars_a.each do |ar|
      # if visible_hexs is nil then we include every area element, otherwise only
      # the area elements which is in a visible hex
      if visible_hexs == nil || visible_hexs.index(ar.location_hex_index) != nil
        ara = ars_h[ar.location_hex_index]

        if (ara == nil)
          ara = Array.new
          ars_h[ar.location_hex_index] = ara
        end

        ara.push(ar.id, ar.user_id, ar.area_element_type_id, ar.location_hex_index, ar.name, ar.resource_gain, ar.level)

        if (ar.orders) && (ar.user_id == the_user_id)
          ar_orders_this_turn = ar.orders.find :all, :conditions => ["turn = ?",current_game_session.current_turn_number]
          if ar_orders_this_turn && ar_orders_this_turn.size > 0
            ar_orders_this_turn.each do |order|
              ara.push([order.order_type, order.action])
            end
          end
        end

      end
    end

    # puts  "*** AreaElement.create_area_elements_hash ****\n"
    # ars_h.keys.each do |key|
    #  puts "         param: '#{key.to_s}' => #{ars_h[key].to_s} \n"
    # end
    return ars_h
  end

  def upgrad
    self.level += 1
    self.save
    
    return true
  end

  def resource_gain
    self.area_element_type.income
  end
  
  def modified_resource_gain
    return self.resource_gain * (self.level + 1)
  end
end
