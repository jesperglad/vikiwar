require 'csv'

class CreateUnitTypes < ActiveRecord::Migration
  def self.up    
    create_table :unit_types do |t|
    t.column :name, :string
    t.column :attack_strength, :integer
    t.column :attack_range_min, :integer
    t.column :attack_range_max, :integer
    t.column :defensive_strength, :integer
    t.column :randomness, :integer
    t.column :initiative, :integer
    t.column :action_points, :integer
    t.column :sight_range, :integer
    t.column :resource_cost, :integer
    t.column :maintenance_cost, :integer
    t.column :description, :string
    t.column :sea, :integer
    t.column :mountains, :integer
    t.column :grassland, :integer
    t.column :swamp, :integer
    t.column :hills, :integer
    t.column :forest, :integer
    t.column :combat_sea, :integer
    t.column :combat_mountains, :integer
    t.column :combat_grassland, :integer
    t.column :combat_swamp, :integer
    t.column :combat_hills, :integer
    t.column :combat_forest, :integer    
    t.column :combat_swordsmen, :integer
    t.column :combat_axemen, :integer
    t.column :combat_pikemen, :integer
    t.column :combat_berserker, :integer
    t.column :combat_horsemen, :integer
    t.column :combat_archers, :integer    
    t.column :combat_scouts, :integer    
    t.column :combat_city, :integer
    t.column :level, :integer, :default => 0
    t.column :possible_orders, :string, :default => ""
    t.column :can_build, :string, :default => ""
    t.column :cargo_size, :integer, :default => 0

    end       
  end

  def self.down
    drop_table :unit_types
  end
end
