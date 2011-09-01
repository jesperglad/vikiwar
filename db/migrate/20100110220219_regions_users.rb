class RegionsUsers < ActiveRecord::Migration
  def self.up
    create_table :regions_users, :id => false do |t|
      t.integer :region_id
      t.integer :user_id
    end
  end

  def self.down
    drop_table :regions_users
  end
end
