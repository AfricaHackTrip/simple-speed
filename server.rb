require 'sinatra'
require 'rack/cors'

use Rack::Cors do
  allow do
    origins '*'
    resource '*', :headers => :any, :methods => [:get, :post]
  end
end

get '/download' do
  #TODO Deliver test file
  "Hello World!"
end

post '/upload' do
  "Too fast, man"
end
