---
title: "Serverless With Serverless Framework"
date: 2020-06-15T18:26:41-07:00
archives: "2020"
tags: [serverless, api, aws, python, cloud]
author: Fernando Castellanos
draft: false
---

In this post I'm going to talk about serverless API's and services, rather than trying come up with my own description about what serverless computing is here's how Wikipedia defines it.
> Serverless computing is a cloud computing execution model in which the cloud provider runs the server, and dynamically manages the allocation of machine resources. Pricing is based on the actual amount of resources consumed by an application, rather than on pre-purchased units of capacity. It can be a form of utility computing.
This basically means that there is no need for the developer or the IT engineer to provision any resources to run your service, you don't have to manage any block storage, any processing power or memory, you also don't worry about scalability, this helps you focus on the things that matter for your business.

While it's called serverless that doesn't mean that there is no server running your code, it means that you don't have to manage any server, your code is usually run in containers that are managed and deployed automatically for you on demand.

This is a game changer and gives the developer more power to build and deploy services quickly without having to depend on an IT person to do that for you and on top manage the scalability.

While all of this is great this is no silver bullet for building web services and it comes with its disadvantages, I'll try to enumerate a few of them here.

* Having a virtually limitless scaling capabilities can be a double edge sword costwise if you don't have proper mechanisms in place.
* Serverless can also mean that there is no server whatsoever if you don't have any traffic, meaning there could be no container provisioned to run your code, while that is good because you're not incurring any cost, there will be a penalty whenever you get traffic because you'll encounter a "cold start" meaning that your code needs to be provisioned to a container and you have to wait to get a response, this might not be good for mission critical services.
* If your service handles large amounts of requests like a log processor service, ad service, etc, serverless might not be the best choice costwise.
* Setting up a good local dev environment can be difficult because there's no service to manage along with a local DB if your service uses one.
* Testing in general (unit test, integration or manual) can also be tricky to simulate a serverless environment.
* There could be a steep learning curve for developer for this change of paradigm.

Now while all of those cons are valid, there are some things that you can do to mitigate them and make them acceptable:

* As for the possible cost issues associated with high traffic first of all I'll say that this is a good issue to have, but still you can manage that a bit with caching mechanisms at the request level if you're dealing with a serverless API, or while retrieving some sort of response.
* For the "cold start" there are some mechanisms to keep at least one container running at all times to avoid the cold start, while this defeats the purpose for being completely serverless this is an acceptable technique, you get all of the other advantages and it's still cost effective.
* For a high traffic service this one's a bit harder to prove, but being serverless doesn't mean that your whole service needs to be serverless, you can have a section of the service to just handle the http requests in a serverless fashion, queue or log whatever needs to be queued or logged and delegate it to another service (serverless or not). This is the magic of cloud computing, that you can build your service with whatever service you have at your disposal that fits your needs.
* There's several tools and techniques that can help you get around this barrier, there are tools that help you mimic services like S3, DynamoDB, Kinesis, Firehose, etc in your local environment, another option that you have is that most serverless tools allows you to have different environments in the cloud, so you could have an environment for development, staging, production, etc, while this might not be super cost effective this means that you have basically the same environment as in production.
* As for testing it's always a good practice serverless or not to have a clear separation of concerns in your code, this is super beneficial when unit testing your serverless code because you can and should focus on testing your business logic and not serverless and its interactions. I'll create a following blog post to show you how you achieve that.
* Lastly there's no best way to learn than just jumping in and learn to swim.

Enough words, let's just jump in and learn about serverless, there are several tools that help you build and deploy serverless service but my tool of choice is [serverless framework](https://www.serverless.com) as per their description

>Develop, deploy, troubleshoot and secure your serverless applications with radically less overhead and cost by using the Serverless Framework. The Serverless Framework consists of an open source CLI and a hosted dashboard. Together, they provide you with full serverless application lifecycle management.

First you need to install the npm package for the serverless framework

```
npm install -g serverless
```

Next verify that you have successfully installed the serverless framework 

```
serverless --version
```

you should see something like this

```
Framework Core: 1.72.0
Plugin: 3.6.13
SDK: 2.3.1
Components: 2.30.14
```

Another great thing about the serverless framework is that it allows you to configure it to run your serverless code in several languages like Node, Python, Ruby, Java, etc, while also configure your service to run in several cloud providers as AWS, Azure, Google Could, etc.

Let's try to build our first serverless service in Python and in AWS but before we do that please make sure you have the AWS credentials properly configured, if you're unsure you can find a good guide on how to do it [here](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/), please go there and come back for the rest of the blog post :)

Now that you're done with setting up the AWS credentials, let's run a command to create our serverless project.

```
sls create --template aws-python3 --path myService
```

after running that you should see something similar to 

```
Serverless: Generating boilerplate...
Serverless: Generating boilerplate in "/Users/fcastellanos/Projects/serverless/myService"
 _______                             __
|   _   .-----.----.--.--.-----.----|  .-----.-----.-----.
|   |___|  -__|   _|  |  |  -__|   _|  |  -__|__ --|__ --|
|____   |_____|__|  \___/|_____|__| |__|_____|_____|_____|
|   |   |             The Serverless Application Framework
|       |                           serverless.com, v1.72.0
 -------'

Serverless: Successfully generated boilerplate for template: "aws-python3"
```

First thing to notice is that we can either use the `serverless` command or `sls` for short, secondly we pass in a template that we want to use, in this case we're using `aws-python3` meaning that we want to deploy to AWS and use Python 3.x as our language, lastly we pass in a path as the name of the project and folder.

As you can guess you should be able to pass in a different template to use a different cloud provider and language, these are some of the most popular ones:

* aws-nodejs
* aws-nodejs-typescript
* aws-python
* aws-python3
* aws-ruby
* aws-java-maven
* aws-java-gradle
* aws-scala-sbt
* aws-csharp
* aws-go

you can see a full list if you type

```
sls create --help
```

Now cd into our recently created project and see what files were generated...

```
cd myService && ls
```
```
handler.py     serverless.yml
```

The `serverless.yml` file is main configuration file for your serverless application, it contains a bunch of commented out code as means for documenting what you can do with this file, but after removing all the commented code you're left with something like this

```yml
service: myservice
provider:
  name: aws
  runtime: python3.8
functions:
  hello:
    handler: handler.hello
```

**service** is the name of your service, **provider** is where you configure your cloud provider and the runtime of your code, after that you see the **functions** section where you define a list of functions that your service will have, the high level keys of the **functions** collection will be the name of the functions in this case we only have one named **hello** and under that you define the **handler** which is the file name without the extension followed by a dot and then the function name to execute, in this case we have a file named `handler.py` and inside the file we have a function named `hello` that will get executed when this serverless function gets triggered.

This is the most basic that you can get when creating a serverless service with the serverless framework, now if your AWS credentials were properly configured we can go ahead and deploy our app!

Now in order to deploy our app we go back to the terminal and just type

```
sls deploy
```

If everything's properly configured you should see something like this...

```
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
........
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service myservice.zip file to S3 (34.67 MB)...
```

And if you make and update and deploy again you should see something like this

```
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service myservice.zip file to S3 (34.67 MB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
...............
Serverless: Stack update finished...
Service Information
service: myservice
stage: dev
region: us-east-1
stack: myservice-dev
resources: 6
api keys:
  None
endpoints:
  None
functions:
  hello: myservice-dev-hello
layers:
  None
  ```

That's it! we just deployed a simple but nonetheless a serverless service, there are some things to consider here that we're going to address in next blog posts like for example this is just one lambda function in the AWS stack, there is no API endpoint to run our function, also the deployed artifact is 34.67 MB which is kind of big for a simple function among other topics that I'm going to talk about, anyways this is a good start.

If you have any comments or questions feel free to reach out on twitter at [@fcastellanos](https://twitter.com/fcastellanos).

Happy Coding!

