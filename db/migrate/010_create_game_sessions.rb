class CreateGameSessions < ActiveRecord::Migration
  def self.up
    create_table :game_sessions do |t|
      t.column :name, :string
      t.column :state, :string
      t.column :max_num_of_players, :integer, :default => 0
      t.column :current_turn_number, :integer, :default => 1
      t.column :duration_between_turns, :integer, :default => 0
      t.column :latest_turn_ended_at, :datetime, :default => 0
      t.column :is_end_turn_recived, :boolean, :default => false
      t.column :starting_gold, :integer, :default => 100
      t.column :level, :integer, :default => 0

      t.column :region_id, :integer

      t.column :host_id, :integer
    end
  end

  def self.down
    drop_table :game_sessions
  end
end
