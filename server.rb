require 'sinatra'
require 'sinatra/cross_origin'

configure do
  enable :cross_origin
end

get '/download' do
  #TODO Deliver test file
  "Hello World!"
end

post '/upload' do
  "Too fast, man"
end
