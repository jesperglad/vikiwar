require 'digest/sha1'

class User < ActiveRecord::Base
  @@SUBSCRIPTION_TYPES = ["dev", "preium", "pro", "trial"]

  acts_as_authentic do |c|
    c.login_field = 'email'
  end


  # The regions to which this user have access
  has_and_belongs_to_many :regions
  
  has_many :units
  has_many :area_elements
  
  has_many :game_session_user_statuses
  has_many :game_sessions, :through => :game_session_user_statuses

  
  validates_presence_of :name
  validates_uniqueness_of :name
  validates_length_of :name, :in => 1..20

  validates_presence_of :email
  validates_uniqueness_of :email
  validates_length_of :email, :in => 1..40

  validates_presence_of :in_game_name
  validates_uniqueness_of :in_game_name
  validates_length_of :in_game_name, :in => 1..20

  def User.find_by_name theName
    return User.find :first, :conditions => ["name = ?", theName]
  end

  def User.find_all_non_proxy
    return User.find :all, :conditions => ["account_type != ?","proxy_user"]
  end

  def User.parse_user_info doc
    puts "\tRoot element: #{doc.root.name}, att(name): #{doc.root.attributes.get_attribute("name")}"

    map_region = Region.find :first, :conditions => ["name = ?", doc.root.attributes.get_attribute("name").value]
    puts "\tMap Region: #{map_region.name}"

    elements_stack = Array.new
    elements_stack.push doc.root
    while !elements_stack.empty?
      access_region = elements_stack.pop
      access_region.elements.each do |child|
        if access_region != child && child.name == "region"
          puts "\tRegions:"
          puts "\t\tAccess region: #{access_region.attributes.get_attribute("name").value}"
          puts "\t\tchild: #{child.attributes.get_attribute("name").value}"
          puts "\t\tchild hexs: #{child.attributes.get_attribute("hexs").value}"

          elements_stack.push child
          Region.set_region_info(
            child.attributes.get_attribute("name").value,
            access_region.attributes.get_attribute("name").value,
            map_region,
            child.attributes.get_attribute("hexs").value)
        end
      end
    end
  end

  def User.cdf x, mean, varianc
    if (x > 100.0)
      return 0.5*(1.0 + Math.erf( (x - mean)/(varianc * Math.sqrt(2.0)) ))
    else
      return 1.0 - 0.5*(1.0 + Math.erf( (mean - x)/(varianc * Math.sqrt(2.0)) ))
    end 
  end

  def User.ranking
    users = User.find_all_non_proxy
    users.sort! {|x,y| y.rank <=> x.rank }

    a = Array.new
    users.each do |u|      
      a.push(Array[u.in_game_name, u.rank]);
    end

    return a
  end

  def User.update_rankings winner, looser
    cdf = 0.0
    if winner.rank < looser.rank
      base_winner_rank = 100
      base_looser_rank = looser.rank + (100 - winner.rank)

      cdf = User.cdf base_looser_rank, 100.0, 50.0
    else
      base_looser_rank = 100
      base_winner_rank = winner.rank + (100 - looser.rank)

      cdf = User.cdf base_winner_rank, 100.0, 50.0
    end

    d = 10.0 * (1.0 - cdf)
    winner.rank += d
    looser.rank -= d

    winner.save
    looser.save
  end
  
  def User.do_email_exists email
    test_user = User.find :first, :conditions => ["email = ?",email]
    if test_user
      return true
    else
      return false
    end
  end

  def User.get_names_of_users_online
    users_name = Hash.new

    all_users = User.find :all
    all_users.each do |a_user|
      if User.is_user_online a_user
        users_name[a_user.id] = a_user.in_game_name
      end      
    end

    return users_name
  end

  def User.is_user_online the_user        
    dT = Time.now - the_user.updated_at.to_f
    
    if (dT.to_f > 30.0)
      # puts ("#{dT.to_f} - the_user: #{the_user.name}, false")
      return false
    else
      # puts ("#{dT.to_f} - the_user: #{the_user.name}, true")
      return true
    end
  end

  def User.create_new_password
    o =  [('a'..'z'),('A'..'Z')].map{|i| i.to_a}.flatten;
    return  (0..8).map{ o[rand(o.length)]  }.join;
  end

  def reset_password
    pw = User.create_new_password
    
    did_update = self.update_attributes(
      :password => pw,
      :password_confirmation => pw
    )

    if did_update
      return pw
    end

    return nil
  end
  
  def is_subscription_type_at_least least_sst
    @@SUBSCRIPTION_TYPES.each do |sst|
      if self.subscription_type == sst
        return true
      end

      if sst == least_sst
        return false
      end
    end

    return false
  end
  
  # def victory_points
  #  return self.wins - self.looses
  # end

  def add_open_region the_region
    r = self.regions.find :first, :conditions => ["region_id = ?", the_region.id]
    if !r
      # self.open_region_names += the_region.name + ","
      self.regions << the_region
      # puts "REGION ADDED #{the_region.name}"
      self.save
    end
  end

  def add_open_regions the_regions
    the_regions.each {|r|
      add_open_region r
    }
  end
  
  def add_accesible_regions gs
    if self.is_region_open(gs.region.name)
      gs.region.accesable_regions.each do |r|
        if !self.is_region_open(r.name)
          self.add_open_region r
        end
      end
    end    
  end

  def is_region_open the_region_name
    if (self.open_region_names.index the_region_name)
      return true
    else
      return false
    end
  end

  def open_region_names
    the_names = ""
    self.regions.each do |r|
      the_names += r.name+","
    end

    return the_names
  end
  
  def did_win gs
    self.wins += 1
    self.add_accesible_regions gs

    self.save
  end

  def did_loose
    self.looses += 1
    self.save
  end
end

