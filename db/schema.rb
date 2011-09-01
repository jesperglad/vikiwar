# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 99999999999903) do

  create_table "area_element_types", :force => true do |t|
    t.string  "name"
    t.integer "sight_range"
    t.string  "possible_orders", :default => ""
    t.integer "income",          :default => 0
  end

  create_table "area_element_unit_type_effects", :force => true do |t|
    t.integer "combat_bonus",         :default => 0
    t.integer "unit_type_id"
    t.integer "area_element_type_id"
  end

  create_table "area_elements", :force => true do |t|
    t.string   "name",                 :default => ""
    t.integer  "location_hex_index"
    t.integer  "area_element_type_id"
    t.integer  "user_id"
    t.integer  "game_session_id"
    t.integer  "level",                :default => 0
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "areas", :force => true do |t|
    t.integer "position_index"
    t.integer "region_id"
    t.integer "terrain_id"
  end

  create_table "game_session_user_statuses", :force => true do |t|
    t.string  "state"
    t.string  "user_color"
    t.boolean "orders_recived",          :default => false
    t.text    "orders_result_text"
    t.integer "resources"
    t.integer "income",                  :default => 0
    t.integer "expenses",                :default => 0
    t.boolean "ask_for_peace",           :default => false
    t.boolean "removed",                 :default => false
    t.integer "game_data_turn"
    t.text    "game_data_json"
    t.text    "hist_game_data_json"
    t.boolean "reminder_send",           :default => false
    t.integer "last_turn_order_recived", :default => 1
    t.integer "game_session_id"
    t.integer "user_id"
  end

  create_table "game_sessions", :force => true do |t|
    t.string   "name"
    t.string   "state"
    t.integer  "max_num_of_players",     :default => 0
    t.integer  "current_turn_number",    :default => 1
    t.integer  "duration_between_turns", :default => 0
    t.datetime "latest_turn_ended_at"
    t.boolean  "is_end_turn_recived",    :default => false
    t.integer  "starting_gold",          :default => 100
    t.integer  "level",                  :default => 0
    t.integer  "region_id"
    t.integer  "host_id"
  end

  create_table "instance_messages", :force => true do |t|
    t.string   "message"
    t.integer  "game_session_id"
    t.integer  "from_user_id"
    t.integer  "to_user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "news_items", :force => true do |t|
    t.date   "news_date"
    t.string "tag"
    t.string "title"
    t.string "content"
  end

  create_table "orders", :force => true do |t|
    t.string  "order_type",                  :default => ""
    t.integer "turn",                        :default => -1
    t.float   "initiative",                  :default => 0.0
    t.integer "from_hex_index",              :default => -1
    t.integer "dest_hex_index",              :default => -1
    t.string  "action",                      :default => ""
    t.boolean "has_been_executed",           :default => false
    t.boolean "hist_succeded",               :default => false
    t.integer "hist_executed_as_order_num",  :default => -1
    t.integer "hist_from_hex_index",         :default => -1
    t.integer "hist_my_start_healt",         :default => -1
    t.integer "hist_my_looses",              :default => -1
    t.integer "hist_other_unit_id",          :default => -1
    t.integer "hist_other_area_element_id",  :default => -1
    t.integer "hist_area_element_user_id",   :default => -1
    t.integer "hist_other_unit_start_healt", :default => -1
    t.integer "hist_other_unit_looses",      :default => -1
    t.integer "hist_user_id",                :default => -1
    t.integer "hist_unit_type_id",           :default => -1
    t.integer "area_element_id",             :default => -1
    t.integer "unit_id",                     :default => -1
  end

  create_table "regions", :force => true do |t|
    t.string  "name",             :default => ""
    t.integer "w_hex_map",        :default => 0
    t.integer "h_hex_map",        :default => 0
    t.string  "hex_indexs",       :default => ""
    t.boolean "publish",          :default => false
    t.integer "parent_id"
    t.integer "access_region_id"
    t.text    "description"
  end

  create_table "regions_users", :id => false, :force => true do |t|
    t.integer "region_id"
    t.integer "user_id"
  end

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :null => false
    t.text     "data"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "terrain_effects", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "terrain_unittype_effects", :force => true do |t|
    t.integer "movement_cost", :default => 1
    t.integer "combat_bonus",  :default => 0
    t.integer "terrain_id"
    t.integer "unit_type_id"
  end

  create_table "terrains", :force => true do |t|
    t.string  "name"
    t.string  "description"
    t.integer "healing_modifier", :default => 1
  end

  create_table "titles", :force => true do |t|
    t.integer "rank",                  :default => 0
    t.string  "name",                  :default => ""
    t.integer "battles",               :default => 0
    t.string  "min_subscription_type", :default => ""
  end

  create_table "unit_type_unit_type_effects", :force => true do |t|
    t.integer "combat_bonus",     :default => 0
    t.integer "att_unit_type_id"
    t.integer "def_unit_type_id"
  end

  create_table "unit_types", :force => true do |t|
    t.string  "name"
    t.integer "attack_strength"
    t.integer "attack_range_min"
    t.integer "attack_range_max"
    t.integer "defensive_strength"
    t.integer "randomness"
    t.integer "initiative"
    t.integer "action_points"
    t.integer "sight_range"
    t.integer "resource_cost"
    t.integer "maintenance_cost"
    t.string  "description"
    t.integer "level",              :default => 0
    t.string  "possible_orders",    :default => ""
    t.string  "can_build",          :default => ""
    t.integer "cargo_size",         :default => 0
  end

  create_table "units", :force => true do |t|
    t.integer  "location_hex_index"
    t.integer  "healt",              :default => 9
    t.integer  "died_in_turn",       :default => 0
    t.integer  "experience",         :default => 0
    t.integer  "unit_type_id"
    t.integer  "user_id"
    t.integer  "game_session_id"
    t.integer  "in_cargo_of_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", :force => true do |t|
    t.string   "email"
    t.string   "crypted_password"
    t.string   "persistence_token"
    t.string   "password_salt"
    t.integer  "login_count",                :default => 0,       :null => false
    t.integer  "failed_login_count",         :default => 0,       :null => false
    t.datetime "last_request_at"
    t.datetime "current_login_at"
    t.datetime "last_login_at"
    t.string   "current_login_ip"
    t.string   "last_login_ip"
    t.string   "name"
    t.string   "in_game_name"
    t.string   "account_type",               :default => "user"
    t.integer  "num_of_games",               :default => 0
    t.integer  "wins",                       :default => 0
    t.integer  "looses",                     :default => 0
    t.string   "subscription_type",          :default => "trial"
    t.integer  "rank",                       :default => 100
    t.boolean  "recive_email_notifications", :default => true
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
