#!/usr/bin/ruby

# Creates a new blog post, and opens an editor to the new file

# Lol, just join all the args into the title...
# can type ./blog.rb This is the Title
title = ARGV[0]
Dir.chdir "/Users/geoffreylitt/dev/homepage" do
  puts "Creating blog post: #{title}..."
  created = `bash -l -c "bundle exec middleman article '#{title}'"`
  puts created
  filename = created.split(" ")[1]

  # open the whole site in vscode
  `bash -l -c "code ."`

  # open the new blog post
  `bash -l -c "code #{filename}"`
end