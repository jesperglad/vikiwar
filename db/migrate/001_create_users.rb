class CreateUsers < ActiveRecord::Migration
  def self.up
    create_table :users do |t|            
      # used by authlogic
      t.string :email      
      t.string :crypted_password  
      t.string :persistence_token 
      t.string :password_salt 

      # Magic columns, just like ActiveRecord's created_at and updated_at. These are automatically maintained by Authlogic if they are present.
      t.integer   :login_count,         :null => false, :default => 0 # optional, see Authlogic::Session::MagicColumns
      t.integer   :failed_login_count,  :null => false, :default => 0 # optional, see Authlogic::Session::MagicColumns
      t.datetime  :last_request_at                                    # optional, see Authlogic::Session::MagicColumns
      t.datetime  :current_login_at                                   # optional, see Authlogic::Session::MagicColumns
      t.datetime  :last_login_at                                      # optional, see Authlogic::Session::MagicColumns
      t.string    :current_login_ip                                   # optional, see Authlogic::Session::MagicColumns
      t.string    :last_login_ip                                      # optional, see Authlogic::Session::MagicColumns

      t.string :name
      t.string :in_game_name
      t.string :account_type, :default=>"user"
      # t.string :open_region_names, :default=>"" # "Bornholm,Rungholt,Mors,Gothenburg" # String with the names seperate by commas

      # Statistics
      t.integer :num_of_games, :default=>0 # Gives the total number of games the player has played
      t.integer :wins, :default=>0
      t.integer :looses, :default=>0

      t.string :subscription_type, :default => 'trial'
      t.integer :rank, :default => 100
      t.boolean :recive_email_notifications, :default => true

      t.timestamps
    end
  end

  def self.down
    drop_table :users
  end
end
