class CreateAreaElements < ActiveRecord::Migration
  def self.up
    create_table :area_elements do |t|
      t.column :name, :string, :default => ""
      t.column :location_hex_index, :integer
      t.column :area_element_type_id, :integer
      t.column :user_id, :integer       
      t.column :game_session_id, :integer
      t.column :level, :integer, :default => 0
      
      t.timestamps
    end
  end

  def self.down
    drop_table :area_elements
  end
end
