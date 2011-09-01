class UserController < ApplicationController
  before_filter :require_user, :except => [:new, :create, :ranking]

  def new
    @user = User.new
    @the_action = "create"
  end
  
  def create
    puts "*** UserController.create ****"
    puts "*** params: "
    params.keys.each do |key|
      puts "         param: '#{key.to_s}' => #{params[key].to_s} "
    end

    @user = User.new(params[:user])
    if (params[:user][:recive_email_notifications] == "yes")
      @user.recive_email_notifications = true
    end
    if @user.save
      @user.add_open_regions(Region.get_regions_from_names(["Bornholm","Rungholt","Mors","Gothenburg"]))

      flash[:notice] = "Registration successful."
      redirect_to :controller => :game_sessions, :action => :index
    else
      render :action => 'new'
    end
  end

  def edit
    @user = current_user
    @the_action = "update"
  end

  def update
    @the_action = "update"
    @user = current_user
    user_hash = params[:user]

    if (user_hash[:recive_email_notifications] == "yes")
      @user.recive_email_notifications = true
    else
      @user.recive_email_notifications = false
    end

    did_update = @user.update_attributes(
      :name => CGI::escapeHTML(user_hash[:name]),
      :password => user_hash[:password],
      :password_confirmation => user_hash[:password_confirmation],
      :email => CGI::escapeHTML(user_hash[:email]),
      :in_game_name => CGI::escapeHTML(user_hash[:in_game_name]) #,
      # :recive_email_notifications => user_hash[:recive_email_notifications]
    )

    if did_update
      flash[:notice] = "Successfully updated profile."
      redirect_to :action => :index, :controller => :game_sessions
    else
      render :action => 'edit'
    end
  end

  def notify_online
    # puts "notify_online" 
        current_user.updated_at = Time.now
        current_user.save
        
        render :nothing => true
  end

  def notify_online_and_retive_users_online
    # puts "notify_online"
        current_user.updated_at = Time.now
        current_user.save

        htmlTxt = "<ul>"
        User.get_names_of_users_online.each { |key, value|
          htmlTxt +="<li>#{value}</li>"
        }
        htmlTxt += "</ul>"
        render :text => htmlTxt
  end

  def ranking
    rankings = User.ranking
    return render(:text => rankings.to_json);
  end
end
