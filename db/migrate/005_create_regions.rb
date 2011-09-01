class CreateRegions < ActiveRecord::Migration
  def self.up
    create_table :regions do |t|
      t.column :name, :string, :default => ""
      t.column :w_hex_map, :integer, :default => 0
      t.column :h_hex_map, :integer, :default => 0
      t.column :hex_indexs, :string, :default => "" # "32, 42, 12"
      t.column :publish, :boolean, :default=>false

      t.column :parent_id, :integer
      t.column :access_region_id, :integer # The id of the region which the player needs to own
                                           # to get access to this region.
      
      t.column :description, :text
    end
  end

  def self.down
    drop_table :regions
  end
end
