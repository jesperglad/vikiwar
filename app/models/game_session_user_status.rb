class GameSessionUserStatus < ActiveRecord::Base
  belongs_to :user
  belongs_to :game_session

  validates_presence_of :user, :game_session

  def is_allowed_to_be_reminde
    if self.state == "active" && !self.orders_recived && !self.reminder_send && self.game_session.is_duration_between_turns_passed
      return true
    else
      return false
    end
  end

  def is_chief_killed?
    chief_ut = UnitType.find :first, :conditions => ["name = ?","chief"]
    chief = Unit.unit self.user, chief_ut, self.game_session

    if (chief) && (chief.healt < 1)
      return true
    end

    return false
  end

end
