require 'sinatra'
require 'sinatra/cross_origin'

configure do
  enable :cross_origin
end

get '/download' do
  sample_string 10000000
end

post '/upload' do
  "Too fast, man"
end

options '/upload' do
  ""
end

def sample_string(length)
  str = ''
  length = length / 10
  length.times { str << '1234567890' }
  str
end
