module SiteHelpers

  def page_title
    title = "Geoffrey Litt"
    if current_page.data.title
      title = current_page.data.title
    end
    title
  end

  def page_description
    description = "Geoffrey Litt is a programmer and designer."
    if current_page.data.description
      description = current_page.data.description
    end
    description
  end

  def page_image
    url = "/images/headshot.jpg"
    if current_page.data.image_url
      url = current_page.data.image_url
    end
    "https://geoffreylitt.com" + url
  end

  def article_has_summary(article)
    Nokogiri::HTML(article.summary).text.strip != Nokogiri::HTML(article.body).text.strip
  end

end
