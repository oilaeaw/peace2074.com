#!/usr/bin/env ruby

require 'xcodeproj'

project_path = File.expand_path('../ios/App/App.xcodeproj', __dir__)
project = Xcodeproj::Project.open(project_path)

puts "Current targets:"
project.targets.each { |t| puts "  - #{t.name}" }

# Find and remove the peace2074 target
target = project.targets.find { |t| t.name == 'peace2074' }

if target
  puts "\nRemoving target: #{target.name}"
  target.remove_from_project
  
  # Also remove the peace2074 scheme if it exists
  scheme_path = File.join(project_path, 'xcshareddata', 'xcschemes', 'peace2074.xcscheme')
  if File.exist?(scheme_path)
    File.delete(scheme_path)
    puts "Removed scheme: peace2074.xcscheme"
  end
  
  project.save
  puts "\n✓ Successfully removed peace2074 target"
  puts "\nRemaining targets:"
  project.targets.each { |t| puts "  - #{t.name}" }
else
  puts "\nTarget 'peace2074' not found"
end
