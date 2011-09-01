class TerrainUnittypeEffects < ActiveRecord::Base
  belongs_to :terrain
  belongs_to :unit_type
end
