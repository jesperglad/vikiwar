class CreateUnits < ActiveRecord::Migration
  def self.up
    create_table :units do |t|   
      t.column :location_hex_index, :integer

      # the value give the healt of the unit, or if the value is negative the reason why the unit died,
      # 0    => the unit died in battle
      # -100 => the unit died from starvation
      t.column :healt, :integer, :default => 9
      t.column :died_in_turn, :integer, :default => 0 # the value give the number in which a unit dieded, if the value is 0 it is still alive
      t.column :experience, :integer, :default => 0 # value between 0 and 9
      t.column :unit_type_id, :integer      
      t.column :user_id, :integer
      t.column :game_session_id, :integer
      t.column :in_cargo_of_id, :integer
      
      t.timestamps
    end
  end

  def self.down
    drop_table :units
  end
end
