class CreateTitles < ActiveRecord::Migration
  def self.up
    create_table :titles do |t|
      t.column :rank, :integer, :default => 0
      t.column :name, :string, :default => ""
      t.column :battles, :integer, :default => 0
      t.column :min_subscription_type, :string, :default => ""
    end
  end

  def self.down
    drop_table :titles
  end
end
