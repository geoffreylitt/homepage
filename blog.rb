title = ARGV[0]
Dir.chdir "/Users/geoffreylitt/dev/homepage" do
  puts "Creating blog post: #{title}..."
  created = `bundle exec middleman article #{title}`
  puts created
  filename = created.split(" ")[1]
  `code #{filename}`
end