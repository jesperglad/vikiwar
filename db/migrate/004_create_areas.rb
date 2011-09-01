class CreateAreas < ActiveRecord::Migration
  def self.up
    create_table :areas do |t|
    t.column :position_index, :integer  
    
    t.column :region_id, :integer
    t.column :terrain_id, :integer
    
    end
  end

  def self.down
    drop_table :areas
  end
end
