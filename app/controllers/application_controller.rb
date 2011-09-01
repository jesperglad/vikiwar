# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time
  helper_method :current_user, :game_sessions_your_move, :max_num_of_battles, :user_max_num_of_battles_reaced
  
  filter_parameter_logging :password

  # session :key => '_nextworld003_session_id'

public

  def max_num_of_battles
    if current_user.subscription_type == 'trial'
      return 5;
      
    elsif current_user.subscription_type == 'dev'
      return 100;
      
    else
      return 0;
      
    end
  end
  
  def user_max_num_of_battles_reaced
    if current_user.subscription_type == 'trial'
      gsuss = GameSessionUserStatus.find :all, :conditions => ["user_id = ? and removed = 'false'", current_user.id]
      if gsuss.size >= max_num_of_battles;
        return true;
      end 
    end
   
    return false;
  end

private
    # Authlogic
    def current_user_session
      return @current_user_session if defined?(@current_user_session)
      @current_user_session = UserSession.find
    end

    # Authlogic
    def current_user
      return @current_user if defined?(@current_user)
      @current_user = current_user_session && current_user_session.record
    end

    def set_current_game_session
      @current_game_session = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "
    end
    
    def current_game_session      
      return @current_game_session if defined?(@current_game_session)
      @current_game_session = GameSession.find :first, :conditions => "id = '#{session[:game_session_id]}' "

      return @current_game_session
    end

    def current_gsus
      return @current_gsus if defined?(@current_gsus)      
      @current_gsus = GameSessionUserStatus.find :first, :conditions => ["user_id = ? and game_session_id = ?", current_user.id, current_game_session.id]

      return @current_game_session
    end
    
    def game_sessions_your_move
      retArr = Array.new
      current_user.game_sessions.each do |gs|
        if gs.state == "ACTIVE" && current_game_session.name != gs.name
          gsus = gs.game_session_user_statuses.find :first, :conditions => ["user_id = ?",current_user.id]
          if gsus.orders_recived == false && gsus.removed == false
            retArr.push(gs)
          end
        end                      
      end   
            
      return retArr
    end
    
    # Authlogic
    def require_admin
      unless current_user && current_user.account_type == 'admin'
        store_location
        flash[:notice] = "You must be logged in as an administrator to access this page"
        redirect_to(:controller => "login", :action => "index")
        return false
      end
    end

    # Authlogic
    def require_user
      unless current_user
        store_location
        flash[:notice] = "You must be logged in to access this page"
        redirect_to(:controller => "login", :action => "index")
        return false
      end
    end

    # Authlogic
    def require_no_user
      if current_user
        store_location
        flash[:notice] = "You must be logged out to access this page"
        redirect_to account_url
        return false
      end
    end

    # Authlogic
    def store_location
      session[:return_to] = request.request_uri
    end

    # Authlogic
    def redirect_back_or_default(default)
      redirect_to(session[:return_to] || default)
      session[:return_to] = nil
    end
end
