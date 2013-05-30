module SiteHelpers

  def page_title
    title = "Geoffrey Litt"
    if data.page.title
      title << " | " + data.page.title
    end
    title
  end
  
  def page_description
    if data.page.description
      description = data.page.description
    else
      description = "Geoffrey Litt is a programmer and designer currently studying at Yale University."
    end
    description
  end

end