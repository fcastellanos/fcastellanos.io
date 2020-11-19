---
title: "Minitest Custom Assertions"
date: 2020-11-19T10:17:33-08:00
archives: "2020"
tags: [ruby, rails, testing, minitest, tdd]
author: Fernando Castellanos
draft: false
---

Since I discovered the world of testing and TDD I've loved the philosophy behind it and the safety net that it brings. My first interaction with testing was with Ruby on Rails specifically with RSpec, but I'll admit it, understanding and getting used to testing is not easy but RSpec did a very good job at making it easier and in combination with shoulda matchers makes tests wonderfully easy to read. On the frontend we have Cucumber which is like reading a story but can can take a lot of time and effort to build and maintain, which is one of the reasons why the Steak testing framework was built because it was just ruby, and with this idea I am writing this blog post to talk about why I'm starting to love minitest.

Minitest is a small, simple and fast testing framework that not only facilitates testing, TDD, etc, but also provides mocking and benchmarking, and on the comparison before between Cucumber and Steak, RSpec is a DSL while Minitest is just Ruby which not only will it be faster but also you can customize however you want. 

Minitest is also part of the standard library meaning that you don't have to add external libraries which also means that it's available for you to use in Rails which is what I want to show. Here's a brief example. 

Let's imagine we have an `ActiveRecord` model like this...

```ruby
class Airline < ApplicationRecord
    validates :name, presence: true
    validates :image_url, presence: true

    has_many :reviews
end
```

You might want to validate that the `name` and `image_url` are present and it's a very simple assertion, you might create an `airline` with `name` and `image_url` and if you're going to test the `name` validation you set it to `nil` assert that the model is not valid and might also check the errors collection and repeat for the `image_url`, simple, right?

Now what about the reviews association? we have several options, one is to check if the `airline` model includes the `reviews` method via `respond_to?` but that's not accurate because we could have a `def reviews; nil end` method defined which will give a false positive, same if we assert that `reviews` returns a collection or a number of items if we have a method like this `def reviews; [1,2,3] end` it's still a false positive. 

A good thing that I liked about minitest was that there is no out of the box way for you to check for `ActiveRecord` associations like what you can do with RSpec/Shoulda, you need to dig a bit into how ActiveRecord handles and reports associations which is good because you get to know `ActiveRecord` a bit better.

Now `ActiveRecord` has a class method `reflections` that you can use in your models which returns associations and aggregations of Active Record models and classes, we can take advantage of that to make sure that we have an actual association instead of a method getting rid of a false positive.

```
2.7.1 :001 > Airline.reflections
 => {"reviews"=>#<ActiveRecord::Reflection::HasManyReflection:0x00007ffc1a28d6d8 @name=:reviews, @scope=nil, @options={}, @active_record=Airline (call 'Airline.connection' to establish a connection), @klass=nil, @plural_name="reviews", @type=nil, @foreign_type=nil, @constructable=true, @association_scope_cache=#<Concurrent::Map:0x00007ffc1a28c3f0 entries=0 default_proc=nil>>} 
```

With this knowledge we can create a custom assertion or a helper method inside our Rails `test_helper.rb` 

```ruby
# Add more helper methods to be used by all tests here...
def assert_association(model, association, association_type)
    assert_includes model.reflections, association.to_s

    assert_equal association_type, model.reflections[association.to_s].macro
end
```

Now in `airline_test.rb` we can have this test

```ruby
test 'has_many reviews' do
    assert_association Airline, :reviews, :has_many
end
```

Or we can make it a bit more readable by adding two more helper methods inside `test_helper.rb`

```ruby
def assert_has_many(model, association)
    assert_association model, association, :has_many
end

def assert_belongs_to(model, association)
    assert_association model, association, :belongs_to
end
```

So we could have...

```ruby
test 'has_many reviews' do
    assert_has_many Airline, :reviews
end
```

and in `review_test.rb`

```ruby
test 'belongs_to airline' do
    assert_belongs_to Review, :airline
end
```

See? minispec can be very easy to write and to extend to meet your needs.

If you have any comments or questions feel free to reach out on twitter at [@fcastellanos](https://twitter.com/fcastellanos).