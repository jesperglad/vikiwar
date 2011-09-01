class CreateOrders < ActiveRecord::Migration
  def self.up
    create_table :orders do |t|
      t.column :order_type, :string, :default => ""
      t.column :turn, :integer, :default => -1
      t.column :initiative, :float, :default => 0.0
      t.column :from_hex_index, :integer, :default => -1
      t.column :dest_hex_index, :integer, :default => -1
      t.column :action, :string, :default => ""
      t.column :has_been_executed, :boolean, :default => false
      
      t.column :hist_succeded, :boolean, :default => false
      t.column :hist_executed_as_order_num, :integer, :default => -1
      t.column :hist_from_hex_index, :integer, :default => -1
      t.column :hist_my_start_healt, :integer, :default => -1
      t.column :hist_my_looses, :integer, :default => -1
      t.column :hist_other_unit_id, :integer, :default => -1
      t.column :hist_other_area_element_id, :integer, :default => -1
      t.column :hist_area_element_user_id, :integer, :default => -1
      t.column :hist_other_unit_start_healt, :integer, :default => -1
      t.column :hist_other_unit_looses, :integer, :default => -1
      t.column :hist_user_id, :integer, :default => -1
      t.column :hist_unit_type_id, :integer, :default => -1
      
      t.column :area_element_id, :integer, :default => -1
      t.column :unit_id, :integer, :default => -1     
    end
  end

  def self.down
    drop_table :orders
  end
end
