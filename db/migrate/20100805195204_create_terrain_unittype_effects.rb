class CreateTerrainUnittypeEffects < ActiveRecord::Migration
  def self.up        
    create_table :terrain_unittype_effects do |t|
      t.column :movement_cost, :integer, :default => 1
      t.column :combat_bonus, :integer, :default => 0
      t.column :terrain_id, :integer
      t.column :unit_type_id, :integer
    end

    remove_column :unit_types, :sea
    remove_column :unit_types, :mountains
    remove_column :unit_types, :grassland
    remove_column :unit_types, :swamp
    remove_column :unit_types, :hills
    remove_column :unit_types, :forest
    remove_column :unit_types, :combat_sea
    remove_column :unit_types, :combat_mountains
    remove_column :unit_types, :combat_grassland
    remove_column :unit_types, :combat_swamp
    remove_column :unit_types, :combat_hills
    remove_column :unit_types, :combat_forest
   end

  def self.down

    drop_table :terrain_unittype_effects

    add_column :unit_types, :sea, :integer
    add_column :unit_types, :mountains, :integer
    add_column :unit_types, :grassland, :integer
    add_column :unit_types, :swamp, :integer
    add_column :unit_types, :hills, :integer
    add_column :unit_types, :forest, :integer
    add_column :unit_types, :combat_sea, :integer
    add_column :unit_types, :combat_mountains, :integer
    add_column :unit_types, :combat_grassland, :integer
    add_column :unit_types, :combat_swamp, :integer
    add_column :unit_types, :combat_hills, :integer
    add_column :unit_types, :combat_forest, :integer

  end

end
