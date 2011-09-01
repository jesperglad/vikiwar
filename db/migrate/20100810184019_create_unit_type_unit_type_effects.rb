class CreateUnitTypeUnitTypeEffects < ActiveRecord::Migration
  def self.up
    create_table :unit_type_unit_type_effects do |t|
      t.column :combat_bonus, :integer, :default => 0
      t.column :att_unit_type_id, :integer
      t.column :def_unit_type_id, :integer

    end

    remove_column :unit_types, :combat_swordsmen
    remove_column :unit_types, :combat_axemen
    remove_column :unit_types, :combat_pikemen
    remove_column :unit_types, :combat_berserker
    remove_column :unit_types, :combat_horsemen
    remove_column :unit_types, :combat_archers
    remove_column :unit_types, :combat_scouts

   end

  def self.down
    drop_table :unit_type_unit_type_effects

    add_column :unit_types, :combat_swordsmen, :integer
    add_column :unit_types, :combat_axemen, :integer
    add_column :unit_types, :combat_pikemen, :integer
    add_column :unit_types, :combat_berserker, :integer
    add_column :unit_types, :combat_horsemen, :integer
    add_column :unit_types, :combat_archers, :integer
    add_column :unit_types, :combat_scouts, :integer
  end

end
