class AdminController < ApplicationController

  before_filter :require_admin
  
public
  def index
    @all_users = User.find :all
    render
  end

  def delete_users
    puts "*** admin_controller.delete_users ****"
    puts "*** params: "
    params.keys.each do |key|
      puts "         param: '#{key.to_s}' => #{params[key].to_s} "
    end

    if request.post?
      @all_users = User.find(:all)
      @all_users.each {|the_user|
        if(params['user_'+the_user.name] != nil) then
          checked = params['user_'+the_user.name][:checked_value]
          if params['commit'] == "Delete"
            the_user.destroy
          elsif  params['commit'] == "Add Access Region"
            gs_id = params['selected_gs'][0].to_i
            puts "GS, gs_id: #{gs_id}"
            if (gs_id > 1)
              gs = GameSession. find :first, :conditions => ["id = ?", gs_id]
              puts "GS, name: #{gs.name}"
              the_user.add_open_region gs.region
            end
          end
          
        end
      }
    end
    redirect_to(:action => :index)
  end

  def clean_db
    GameSession.clean_all
    redirect_to(:action => :index)
  end

  def game_sessions
    if request.post?
      @all_gs = GameSession.find(:all)
      @all_gs.each {|gs|
        if(params[''+gs.id.to_s] != nil) then
          checked = params[''+gs.id.to_s][:checked_value]
          gs.destory_all_child_rows false #units, areaelements, and gsus
          gs.destroy
        end
      }
    end
    redirect_to(:action => :index)    
  end

  def add_access_region
    # puts "*** admin_controller.add_access_region ****"
    # puts "*** params: "
    # params.keys.each do |key|
    # puts "         param: '#{key.to_s}' => #{params[key].to_s} "
    # end

    subscription_value = params["subscription"]
    the_user_id = subscription_value.to_i
    # puts "  the_user_id = #{the_user_id}"

    commma_index = subscription_value.index(',') + 1
    the_subscription_type = subscription_value[commma_index..-1]
    # puts "  the_subscription_type = #{the_subscription_type}"

    the_user = User.find :first, :conditions => ["id = ?", the_user_id]
    # puts "  the_user.name = #{the_user.name}"
    the_user.subscription_type = the_subscription_type
    the_user.save

    redirect_to(:action => :index)
  end


  def set_subscription_type
    # puts "*** admin_controller.set_subscription_type ****"
    # puts "*** params: "
    # params.keys.each do |key|
    #  puts "         param: '#{key.to_s}' => #{params[key].to_s} "
    # end

    subscription_value = params["subscription"]
    the_user_id = subscription_value.to_i
    # puts "  the_user_id = #{the_user_id}"

    commma_index = subscription_value.index(',') + 1
    the_subscription_type = subscription_value[commma_index..-1]
    # puts "  the_subscription_type = #{the_subscription_type}"
    
    the_user = User.find :first, :conditions => ["id = ?", the_user_id]
    # puts "  the_user.name = #{the_user.name}"
    the_user.subscription_type = the_subscription_type
    the_user.save
    
    redirect_to(:action => :index)
  end
end
