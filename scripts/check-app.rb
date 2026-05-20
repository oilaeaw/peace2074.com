require 'dotenv'
require 'spaceship'

# Load .env
Dotenv.load(File.expand_path('../../.env', __FILE__))

begin
  puts "Creating App Store Connect token..."
  token = Spaceship::ConnectAPI::Token.create(
    key_id: ENV["APP_STORE_CONNECT_API_KEY_ID"],
    issuer_id: ENV["APP_STORE_CONNECT_API_ISSUER_ID"],
    filepath: ENV["APP_STORE_CONNECT_API_KEY_FILEPATH"]
  )
  Spaceship::ConnectAPI.token = token

  puts "Fetching App info..."
  app = Spaceship::ConnectAPI::App.find("6761300696")
  if app
    puts "Found App: #{app.name} (#{app.bundle_id})"
    # Fetch app info
    app_info = app.fetch_app_info
    puts "App Info details fetched successfully."
  else
    puts "App not found."
  end
rescue => e
  puts "Error: #{e.message}"
end
