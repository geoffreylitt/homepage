module SiteHelpers

  def page_title
    title = "Geoffrey Litt"
    if current_page.data.title
      title << " | " + current_page.data.title
    end
    title
  end

  def page_description
    if current_page.data.description
      description = current_page.data.description
    else
      description = "Geoffrey Litt is a programmer and designer."
    end
    description
  end

  def article_has_summary(article)
    Nokogiri::HTML(article.summary).text.strip != Nokogiri::HTML(article.body).text.strip
  end

end
