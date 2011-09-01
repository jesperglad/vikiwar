class ImController < ApplicationController
private
  def set_im_variables gs
    if gs
      @user_colors = gs.get_user_colors
      @user_ims = InstanceMessage.get_user_messages gs
      @the_users_name = gs.get_users_name
    else
      @user_colors = nil
      @user_ims = InstanceMessage.get_user_messages nil
      @the_users_name = User.get_names_of_users_online
    end

  end

public
  def im_push_messages
    from_user = User.find :first, :conditions => ["id = ?",current_user.id]
    @im_push = true

    if session[:game_session_id]
      gs = GameSession.find :first, :conditions => ["id = ?",session[:game_session_id]]
      InstanceMessage.create(:message => CGI::escapeHTML(params[:im_text_input][:im_text]),  :game_session => gs, :from => from_user, :to => nil)
    else
      InstanceMessage.create(:message => CGI::escapeHTML(params[:im_text_input][:im_text]),  :game_session => nil, :from => from_user, :to => nil)
    end
       
    set_im_variables gs

    render :partial => 'shared/im_room', :layout => false
  end

public
  def im_pull_messages
    # puts "*** im_pull_messages ****\n"
    # puts "*** params: \n"
    # params.keys.each do |key|
    # puts "         param: '#{key.to_s}' => #{params[key].to_s} \n"
    # end

    gs = GameSession.find :first, :conditions => ["id = ?",session[:game_session_id]]
    @im_push = false

    set_im_variables gs

    render :partial => 'shared/im_room', :layout => false
  end
end