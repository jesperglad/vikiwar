class UnitTypeUnitTypeEffects < ActiveRecord::Base
  belongs_to :att_unit_type, :class_name => "UnitType"
  belongs_to :def_unit_type, :class_name => "UnitType"

  validates_presence_of :att_unit_type, :def_unit_type
end
