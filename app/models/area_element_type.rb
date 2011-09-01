class AreaElementType < ActiveRecord::Base
  
  def AreaElementType.parse_area_element_info doc
    area_elements = doc.root.elements["area_element_types"]
    area_elements.elements.to_a.each {|ae_xml|
      name = ae_xml.attributes.get_attribute("name").value
      sight_range = ae_xml.attributes.get_attribute("sight_range").value
      income = ae_xml.attributes.get_attribute("income").value

      ae = AreaElementType.find :first, :conditions => ["name = ?", name]
      if (ae)
        ae.sight_range = sight_range
        ae.income = income
        ae.save
      else
        AreaElementType.create :name => name, :sight_range => sight_range, :income => income
      end

    }
  end
end
