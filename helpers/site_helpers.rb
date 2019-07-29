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
    image_url = "https://www.geoffreylitt.com/images/headshot.jpg"
    if current_page.data.image_url
      image_url = current_page.data.image_url
    end
    image_url
  end

  def article_has_summary(article)
    Nokogiri::HTML(article.summary).text.strip != Nokogiri::HTML(article.body).text.strip
  end

end
