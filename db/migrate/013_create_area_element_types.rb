class CreateAreaElementTypes < ActiveRecord::Migration
  def self.up
    create_table :area_element_types do |t|
      t.column :name, :string
      t.column :sight_range, :integer
      t.column :possible_orders, :string, :default => ""
      t.column :income, :integer, :default => 0
      
    end
  end

  def self.down
    drop_table :area_element_types
  end
end
