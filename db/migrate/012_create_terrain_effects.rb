class CreateTerrainEffects < ActiveRecord::Migration
  def self.up
    create_table :terrain_effects do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :terrain_effects
  end
end
