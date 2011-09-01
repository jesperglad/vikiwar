class NextworldMailer < ActionMailer::Base
  @@EMAIL = "odin@vikiwar.com"

  def new_player_invite_mail(from_user, to_user_email, gs)
    puts "NextworldMailer.new_player_invite_mail"
    test_user = from_user
    i = 1
    while test_user
      the_new_in_game_name = to_user_email[0..(to_user_email.index('@')-1)]+i.to_s
      test_user = User.find :first, :conditions => [" in_game_name = ?", the_new_in_game_name]
      i += 1
    end
    
    rand_pw  =  User.create_new_password
    
    new_user = User.create!(:name => the_new_in_game_name, :password => rand_pw, :password_confirmation => rand_pw, :email => to_user_email, :in_game_name => the_new_in_game_name, :account_type => 'user')
    new_user.add_open_regions(Region.get_regions_from_names(["Bornholm","Rungholt","Mors","Gothenburg"]))

    gs.user_join(new_user, "invited")

    recipients to_user_email
    from ""+from_user.in_game_name+" <"+@@EMAIL+">"
    subject ""+from_user.in_game_name+" is requesting you to join the battle of ..."
    h = {
      :from_in_game_name => from_user.in_game_name,
      :from_name => from_user.in_game_name,
      :to_email => to_user_email,
      :your_in_game_name => the_new_in_game_name,
      :gs_name => gs.name,
      :gs_id => gs.id,
      :rand_pw => rand_pw
      }
    body h
    sent_on Time.now    
  end

  def reset_password_mail(to_user)
    rand_pw  =  User.create_new_password
    
    recipients to_user.email
    from ""+from_user.in_game_name+" <"+@@EMAIL+">"
    subject "Vikiwar password reset"
    h = {
      :to_user_name => to_user.name,
      :to_email => to_user.email,
      :rand_pw => rand_pw
    }
    body h
    sent_on Time.now
  end

  def existing_player_invite_mail(from_user, to_user, gs)
    puts "NextworldMailer.existing_player_invite_mail"
    if (to_user.recive_email_notifications)
      gs.user_join(to_user, "invited")
      recipients to_user.email
      from ""+from_user.in_game_name+"<"+@@EMAIL+">"
      subject ""+from_user.in_game_name+" is requesting you to join the battle of "+gs.name
      h = {
        :from_in_game_name => from_user.in_game_name,
        :from_name => from_user.name,
        :to_email => to_user.email,
        :your_in_game_name => to_user.in_game_name,
        :gs_name => gs.name,
        :gs_id => gs.id,
        }
      body h
      sent_on Time.now
    end
  end

  def next_turn_mail (to_user, battle_name, new_turn_number, next_turn_at)
    if (to_user.recive_email_notifications)
      recipients to_user.email
      from "Odin <"+@@EMAIL+">"
      subject "Update on the battle of "+battle_name
      h = { :the_user=>to_user, :the_battle=>battle_name, :the_turn=>new_turn_number, :the_next_turn=>next_turn_at }
      body  h
      sent_on Time.now
    end
  end

  def battle_started_mail(to_user, battle_name)
    if (to_user.recive_email_notifications)
      recipients to_user.email
      from "Odin <"+@@EMAIL+">"
      subject "The battle of "+battle_name+" has started"
      h = { :the_user => to_user, :the_battle => battle_name}
      body  h
      sent_on Time.now
    end
  end
  
  def battle_ended_mail(to_user, battle_name)
    if (to_user.recive_email_notifications)
      recipients to_user.email
      from "Odin <"+@@EMAIL+">"
      subject "The battle of "+battle_name+" has come to an end"
      h = { :the_user => to_user, :the_battle => battle_name}
      body  h
      sent_on Time.now    
    end
  end

  def reminder_time_is_up(to_user, from_user, gs)
    puts "**** reminder_time_is_u, to_user.email = #{to_user.email}, from_user = #{from_user.in_game_name}, gs = #{gs.name} "
    recipients to_user.email
    from "Odin <"+@@EMAIL+">"
    subject "Time is up in the battle of #{gs.name}, a reminder from #{from_user.in_game_name}"
    h = { :the_user => to_user, :the_battle => gs.name}
    body  h
    sent_on Time.now
  end
end
