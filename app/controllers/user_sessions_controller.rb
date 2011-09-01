class UserSessionsController < ApplicationController
  before_filter :require_user, :except => [:new, :create, :linklogin]

  def new
    @user_session = UserSession.new
  end

  def failed_login
    @user_session = UserSession.new
  end
  
  def create
    puts "*** UserSessionController.create ****"
    puts "*** params: "
    params.keys.each do |key|
      puts "         param: '#{key.to_s}' => #{params[key].to_s} "
    end

    @user_session = UserSession.new(params[:user_session])
    if @user_session.save            
      flash[:notice] = "Successfully logged in."
      if current_user.account_type == 'admin'
        redirect_to :controller => :admin, :action => :index
      else 
        redirect_to :controller => :game_sessions, :action => :index
      end
      
    else
      render :action => 'failed_login'
    end
  end

  def destroy
    @user_session = UserSession.find
    @user_session.destroy
    flash[:notice] = "Successfully logged out."
    redirect_to :login
  end

  def reset_password
    email = params[:email]

  end

  def linklogin
    puts "*** UserSessionsController.linklogin ****"
    puts "*** params: "
    params.keys.each do |key|
      puts "         param: '#{key.to_s}' => #{params[key].to_s} "
    end

    @user_session = UserSession.new(:email => params[:email], :password => params[:password])
    if @user_session.save
      flash[:notice] = "Successfully logged in."
      redirect_to :controller => 'main', :action => "set_game_session", :id => "#{params[:gs_id]}"
    else
      render :action => 'new'      
    end

    
  end
end
