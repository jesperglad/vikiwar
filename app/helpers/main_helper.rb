module MainHelper
  def game_nav_bar_id panel_name
    if panel_name == controller.action_name
      return "game_nav_bar1"
    else
      return "game_nav_bar2"
    end
  end
end
