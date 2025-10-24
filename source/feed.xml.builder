xml.instruct!
baseurl = "https://geoffreylitt.com"
xml.feed "xmlns" => "http://www.w3.org/2005/Atom" do
  xml.title "Geoffrey Litt"
  xml.id "http://geoffreylitt.com/"
  xml.link "href" => baseurl
  xml.link "href" => baseurl + "/feed.xml", "rel" => "self"
  xml.updated blog.articles.reject{ |a| a.data[:hidden] }.first.date.to_time.iso8601
  xml.author { xml.name "Geoffrey Litt" }
  blog.articles[0..10].each do |article|
    xml.entry do
      xml.title article.title
      xml.link "rel" => "alternate", "href" => baseurl + article.url
      xml.id baseurl + article.url
      xml.published article.date.to_time.iso8601
      xml.updated article.date.to_time.iso8601
      xml.author { xml.name "Geoffrey Litt" }
      xml.summary article.summary, "type" => "html"
      xml.content article.body, "type" => "html"
    end
  end
end
