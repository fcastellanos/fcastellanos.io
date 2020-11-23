---
title: "Configure Sidekiq With Rails"
date: 2020-11-23T11:29:47-08:00
archives: "2020"
tags: [ruby, background-jobs, redis]
author: Fernando Castellanos
draft: false
---

According to their website Sidekiq is an efficient background processing for Ruby. It says Ruby but you can also use it in Rails and it even has a nice web UI where you can see some stats.

This blog post will be a brief overview of how to configure Sidekiq in Rails.

The very first thing is to add the gem in the `Gemfile` like this

```ruby
gem 'sidekiq', '~> 6.1.0'
```

and run `bundle install`

Now let's assume that we're working on a Blog project where we have a `User`, `Post`, and `Comment` models like this...

```ruby
class User < ApplicationRecord
    has_many :posts
end

class Post < ApplicationRecord
  belongs_to :user
  has_many :comments
end

class Comment < ApplicationRecord
  belongs_to :post
  belongs_to :user
end
```

And for whatever reason we want to create a background job that creates a random comment on a random post... the cool thing about Rails and background jobs is that Rails has the `ActiveJob` framework that is some sort of interface for background jobs so you can switch the backend to whatever you want. 

So in order to create a background job in Rails for Sidekiq we first need to configure sidekiq and since in this case I'm just going to test it in development I'll go ahead and open `config/environments/development.rb` and add the below lines in stating that we want to use sidekiq as the backend for background jobs and the queue name prefix...


```ruby
config.active_job.queue_adapter = :sidekiq
config.active_job.queue_name_prefix = "sidekiq_example_development"
```

Next we configure an initializer for Sidekiq in `config/initializers/sidekiq.rb`

```ruby
Sidekiq.configure_server do |config|
    config.redis = { url: 'redis://localhost:6379/0' }
end
  
Sidekiq.configure_client do |config|
    config.redis = { url: 'redis://localhost:6379/0' }
end
```

Here's where we configure Sidekiq's client and server pointing to redis, in my case it's a local redis server using Redis.app


The final step in the configuration is to specify Sidekiq what queues from Redis to pick up, we do that by creating a file in `config/sidekiq.yml`

```yml
:queues:
  - sidekiq_example_development_default
  - sidekiq_example_production_default
```

And that's pretty much it on the configuration side unless you want to configure the UI which I'll show you how in `config/routes.rb`

```ruby
Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  # ...
  require 'sidekiq/web'
  mount Sidekiq::Web => '/sidekiq'
end
```

It's as simple as that not too bad, now let's go ahead and create a Sidekiq background job through Rails via `ActiveJob`, in the terminal we type...

```
$ rails g job generate_random_comment
```

This creates a file `app/jobs/generate_random_comment_job.rb`

```ruby
class GenerateRandomCommentJob < ApplicationJob
  queue_as :default

  def perform(*args)
    # Do something later
  end
end
```

Now let's do something not efficient to do in the background like creating a random comment on a random post and for that we'll use the `Faker` gem

```ruby
# Inside Gemfile

gem 'faker'
```

And now inside `app/jobs/generate_random_comment_job.rb`

```ruby
class GenerateRandomCommentJob < ApplicationJob
  queue_as :default

  def perform(*args)
    # Fetching a random user
    user = User.find(
      User.pluck(:id).sample
    )

    # Fetching a random post from user
    post = Post.find(
      user.posts.pluck(:id).sample
    )

    # Creating a random comment with Faker
    post.comments.create(
      title: Faker::Lorem.word,
      content: Faker::Lorem.sentence,
      user: user
    )
  end
end
```

Right before we run the background job we need to make sure both Redis and Sidekiq are running, in order to run Sidekiq we go to the terminal run 

```
$ sidekiq
```

And you should see this nice graphic
```
               m,
               `$b
          .ss,  $$:         .,d$
          `$$P,d$P'    .,md$P"'
           ,$$$$$b/md$$$P^'
         .d$$$$$$/$$$P'
         $$^' `"/$$$'       ____  _     _      _    _
         $:     ,$$:       / ___|(_) __| | ___| | _(_) __ _
         `b     :$$        \___ \| |/ _` |/ _ \ |/ / |/ _` |
                $$:         ___) | | (_| |  __/   <| | (_| |
                $$         |____/|_|\__,_|\___|_|\_\_|\__, |
              .d$$                                       |_|
      
```

Now let's take the background job for a spin in the rails console `$ rails c` and type this...

```
> GenerateRandomCommentJob.perform_later
Enqueued GenerateRandomCommentJob (Job ID: f2a594a9-9b9f-4900-8f32-a07d030b04e8) to Sidekiq(sidekiq_example_development_default)
 => #<GenerateRandomCommentJob:0x00007f9d88287788 @arguments=[], @job_id="f2a594a9-9b9f-4900-8f32-a07d030b04e8", @queue_name="sidekiq_example_development_default", @priority=nil, @executions=0, @exception_executions={}, @provider_job_id="8ab54cb7e77b2d218bec63e2">
```

And if you have the Rails server running `$ rails s` and go to `http://localhost:3000/sidekiq/queues` you should see something like this


![Example image](/img/configure-sidekick/image-1.png)

Awesome, this means that we have successfully ran our background job with Sidekiq through Redis inside a Rails app, now let's make things a bit more fun running the background job multiple times to see a bit better Sidekiq in action.

Let's run the background job 100 times through the Rails console

```ruby
> 100.times { GenerateRandomCommentJob.perform_later }
```

And see what happens in the web UI

![Example image](/img/configure-sidekick/image-2.png)

Awesome now we have a basic configuration for Redis + Sidekiq + Rails running locally :) 

Happy coding! if you have any questions please let me know in twitter at [@fcastellanos](https://twitter.com/fcastellanos).