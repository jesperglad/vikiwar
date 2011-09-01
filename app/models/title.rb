require "rexml/document"
include REXML    # so that we don't have to prefix everything with REXML::...

class Title < ActiveRecord::Base
  def Title.parse_title_info doc
    titles = doc.root.elements["titles"]
    if titles
      titles.elements.each do |title|
        if title.name == "title"
          t = Title.create(
            :rank => title.attributes.get_attribute("rank").value,
            :name => title.attributes.get_attribute("name").value,
            :battles => title.attributes.get_attribute("battles").value,
            :min_subscription_type => title.attributes.get_attribute("min_subscription_type").value)

          if !t
            raise "It was not possible to create the title #{title.attributes.get_attribute("name").value}"
          end
        else
          raise "Child of titles is not a title"
        end
      end
    else
      raise "Try to parse titles in document without titles"
    end

    return true
  end

  def Title.get_title a_user
    titles = Title.find :all, :order => "rank DESC"
    titles.each do |title|
      # puts "title.rank: #{title.rank}, title.name: #{title.name}, title.battles: #{title.battles}, title.min_subscription_type: #{title.min_subscription_type}"
      if (title.rank != 0 &&
          a_user.is_subscription_type_at_least(title.min_subscription_type) &&
         title.battles <= a_user.num_of_games)
        return title.name
      end
    end
    
    return nil
  end
end
