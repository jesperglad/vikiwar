class LoginController < ApplicationController
  # before_filter :authorize_admin, :except => [:login, :add_user]
  layout nil  

  
  def add_user
    # @user = User.new(params[:user])

    user_hash = params[:user];
    @user = User.new(
      :name => CGI::escapeHTML(user_hash[:name]),
      :password => user_hash[:password],
      :password_confirmation => user_hash[:password_confirmation],
      :email => CGI::escapeHTML(user_hash[:email]),
      :in_game_name => CGI::escapeHTML(user_hash[:in_game_name])
    );

    @user.add_open_regions(Region.get_regions_from_names(["Bornholm","Rungholt","Mors","Gothenburg"]))

    @user.account_type = "user"
    @user.subscription_type = "trial"
    
    if  request.post? and @user.save
      flash.now[:notice] = "User #{@user.name} created"            
      user= User.authenticate(@user.name, @user.password)
      if user
        session[:user_id] = user.id
        redirect_to(:controller => "game_sessions", :action => "index")          
      end
    end    
       
  end

  def login
    session[:user_id] = nil
    if request.post?
      user= User.authenticate(params[:name], params[:password])
      if user
        session[:user_id] = user.id
        
        if (user.account_type == "admin")
          redirect_to(:action => "index")          
        else
          redirect_to(:controller => "game_sessions", :action => "index")
        end        
      else
        flash.now[:notice] = "Invalid user/password combination"
      end
    end        
  end

  def logout
    session[:user_id] = nil
    flash[:notice] = "Logged out"
    redirect_to(:action => "login")    
  end

  def delete_users
    if request.post?
      @all_users = User.find(:all)
      @all_users.each {|the_user|
        if(params['user_'+the_user.name] != nil) then
          checked = params['user_'+the_user.name][:checked_value]
          the_user.destroy        
        end
      }
    end
    redirect_to(:action => :list_users)    
  end
  
  def delete_user
    if request.post?
      user = User.find(params[:id])
      user.destroy
    end
    redirect_to(:action => :list_users)    
  end

  def list_users
     redirect_to(:action => "index")
  end

end
