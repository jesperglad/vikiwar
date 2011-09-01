class CreateNewsItems < ActiveRecord::Migration
  def self.up
    create_table :news_items do |t|
      t.column :news_date, :date
      t.column :tag, :string
      t.column :title, :string
      t.column :content, :string
    end
  end

  def self.down
    drop_table :news_items
  end
end
