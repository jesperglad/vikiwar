class CombatSystemVikiwar
public
  def initialize theLogger
    @logger = theLogger
    
    @@ALFA = 2.0
    @@BETA_A = -20
    @@BETA_B = 40

    @@MOVE_PENALTY = 0.8

    @@NORMAL_DISTRIBUTION_MEAN = 5.0
    @@NORMAL_DISTRIBUTION_STANDARD_DEVIATION = 1.6
    
    @@NORMAL_DISTRIBUTION = Array.new

    # puts "*** CombatSystemVikiwar.initialize: Creating normal distribution"
    c1 = 1/(@@NORMAL_DISTRIBUTION_STANDARD_DEVIATION*Math.sqrt(2*Math::PI))
    c2 = 2.0 * @@NORMAL_DISTRIBUTION_STANDARD_DEVIATION**2
    for i in 0..10
      x = Float(i)
      v1 = (x-@@NORMAL_DISTRIBUTION_MEAN)**2      
      
      @@NORMAL_DISTRIBUTION[i] = c1 * Math.exp(-v1/c2)
      if i > 0
        @@NORMAL_DISTRIBUTION[i] += @@NORMAL_DISTRIBUTION[i-1]
      end
      # puts "\tc1 = #{c1},\tc2 = #{c2},\tv1 = #{v1},\t@@NORMAL_DISTRIBUTION[#{i}] = #{@@NORMAL_DISTRIBUTION[i]}"
    end
  end
  
public
  def combat_close att_unit, def_unit, current_turn
    # puts "*** CombatSystemVikiwar.combat_close"
    
    is_def_unit_moving = def_unit.do_have_move_order current_turn
    # puts "\tis_def_unit_moving = #{is_def_unit_moving}"
    
    a1 =  @@BETA_A * log2(combat_ration(att_unit, def_unit, is_def_unit_moving))
    # puts "\ta1 = #{a1}"

    def_survies = (@@ALFA * combat_random_factor + a1 + @@BETA_B)/100.0
    # puts "\tdef_survies = #{def_survies}"

    def_unit.healt = healt_after_combat def_unit, def_survies
    # puts "\tdef_unit.healt = #{def_unit.healt}"

    # puts "\t!is_missil_attack(att_unit, def_unit) = #{!is_missil_attack(att_unit, def_unit)}"
    if !is_missil_attack(att_unit, def_unit)
      att_survies = (100.0 - (@@ALFA * combat_random_factor + a1 + @@BETA_B))/100.0
      # puts "\tatt_survies = #{att_survies}"
      
      att_unit.healt = healt_after_combat att_unit, att_survies
      # puts "\tatt_unit.healt = #{att_unit.healt}"
    end    
  end

private
  def log2 numeric
    return Math.log(numeric)/Math.log(2)
  end
  
private
  def is_missil_attack att_unit, def_unit
    area_indexes = att_unit.game_session.region.areas_next_to_area(att_unit.location_hex_index)
    return (area_indexes.include?(def_unit.location_hex_index) == false)
  end

private
  def combat_ration att_unit, def_unit, is_def_unit_moving
    def_combat_bonus = 0

    att_ut = att_unit.unit_type
    def_ut = def_unit.unit_type

    att_str = att_unit.healt*att_ut.attack_strength*(1.0 + att_unit.terrain_combat_bonus/10.0 + att_unit.experience/5.0)
    # puts "\t\tatt_str = #{att_str}"

    # Get deferenders combat_bonus, depending on if there is an AreaElement in the hex
    area_element_in_hex = AreaElement.get_area_element_at_index def_unit.location_hex_index, def_unit.game_session
    if (area_element_in_hex)
      # Area element in defending hex
      def_combat_bonus = def_unit.area_element_combat_bonus      
    else
      # NO area element in defending hex
      def_combat_bonus = def_unit.terrain_combat_bonus
    end

    def_str = def_unit.healt*def_ut.defensive_strength*(1.0 + def_combat_bonus/10.0 + def_unit.experience/5.0)
    
    if is_def_unit_moving
      def_str *= @@MOVE_PENALTY
      # puts "\t\tdef_str*@@MOVE_PENALTY = #{def_str}"
    end

    # puts "\t\tatt_str/def_str = #{att_str/def_str}"
    return (att_str/def_str)
  end

private
  def combat_random_factor
    # puts "\t*** CombatSystemVikiwar.combat_random_factor"
    
    r = rand
    # puts "\t\tr = #{r}"

    i = 0
    while (i < 11) && (r > @@NORMAL_DISTRIBUTION[i])
      i += 1
    end

    if i > 10
      i = 10
    end
    # puts "\t\ti = #{i}"

    return i
  end

private
  def healt_after_combat the_unit, survies
    return Integer(Float(the_unit.healt)*survies)
  end
end