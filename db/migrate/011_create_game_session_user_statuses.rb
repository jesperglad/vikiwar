class CreateGameSessionUserStatuses < ActiveRecord::Migration
  def self.up
    create_table :game_session_user_statuses do |t|
      t.column :state, :string
      t.column :user_color, :string
      t.column :orders_recived, :boolean, :default=>false
      t.column :orders_result_text, :text
      t.column :resources, :integer
      t.column :income, :integer, :default => 0
      t.column :expenses, :integer, :default => 0
      t.column :ask_for_peace, :boolean, :default => false
      t.column :removed, :boolean, :default=>false
      t.column :game_data_turn, :integer
      t.column :game_data_json, :text      
      t.column :hist_game_data_json, :text

      t.column :reminder_send, :boolean, :default => false
      t.column :last_turn_order_recived, :integer, :default => 1

      t.column :game_session_id, :integer
      t.column :user_id, :integer
    end
  end

  def self.down
    drop_table :game_session_user_statuses
  end
end
