class InstanceMessage < ActiveRecord::Base
  belongs_to :game_session
  belongs_to :from, :class_name => "User", :foreign_key => "from_user_id"
  belongs_to :to, :class_name => "User", :foreign_key => "to_user_id"
  
  def InstanceMessage.get_user_messages gs
    # puts "InstanceMessage.get_user_messages: the_room = '#{the_room}' "
    
    if !gs
      number = InstanceMessage.count :conditions => "game_session_id IS NULL and to_user_id IS NULL"
      if (number > 20)
        ims = InstanceMessage.find :all, :conditions => "game_session_id IS NULL and to_user_id IS NULL", :order => "created_at", :offset => (number - 20), :limit => 20
      else
        ims = InstanceMessage.find :all, :conditions => "game_session_id IS NULL and to_user_id IS NULL", :order => "created_at", :limit => 20
      end
      
      
    else
      number = InstanceMessage.count :conditions => ["game_session_id = ? and to_user_id  IS NULL ", gs.id]
      if (number > 20)
        ims = InstanceMessage.find :all, :conditions => ["game_session_id = ? and to_user_id  IS NULL ", gs.id], :order => "created_at", :offset => (number - 20), :limit => 20
      else
        ims = InstanceMessage.find :all, :conditions => ["game_session_id = ? and to_user_id  IS NULL ", gs.id], :order => "created_at", :limit => 20
      end

            
    end
         
    return ims
  end
end
