class CreateTerrains < ActiveRecord::Migration
  def self.up
    create_table :terrains do |t|
      t.column :name, :string      
      t.column :description, :string
      t.column :healing_modifier, :integer, :default => 1
    end   
  end

  def self.down
    drop_table :terrains
  end
end