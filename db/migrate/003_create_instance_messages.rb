class CreateInstanceMessages < ActiveRecord::Migration
  def self.up
    create_table :instance_messages do |t|    
      t.column :message, :string      
      t.column :game_session_id, :integer
      t.column :from_user_id, :integer
      t.column :to_user_id, :integer
      
      t.timestamps
    end
  end

  def self.down
    drop_table :instance_messages
  end
end
