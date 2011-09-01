class CreateAreaElementUnitTypeEffects < ActiveRecord::Migration
  def self.up
    create_table :area_element_unit_type_effects do |t|
      t.column :combat_bonus, :integer, :default => 0
      t.column :unit_type_id, :integer
      t.column :area_element_type_id, :integer

    end

    remove_column :unit_types, :combat_city

  end

  def self.down
    drop_table :area_element_unit_type_effects

    add_column :unit_types, :combat_city, :integer
  end
end
