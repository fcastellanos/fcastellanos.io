---
title: "Refactor a Never Ending 'if' Statements Into a Rule System"
date: 2020-07-26T13:31:27-07:00
archives: "2020"
tags: []
author: Fernando Castellanos
draft: false
---

This comes from a personal experience while working on a big refactor of an Ad Server, in an ad serving system you have creatives, campaigns, ad units, templates, etc. On the client side, meaning the website that will server the Ad it serves the creative code that will ultimately calls the Ad Server requesting an Ad by sending the Creative ID, along with the client information coming from the HTTP request. What can be really messy and complicated is that whenever you request an Ad to an Ad Server is that the request goes through what some call a Campaign and a Creative auction to determine which Ad to serve, these auctions checks for a matching campaign meaning that you cannot serve any Ad to any request, it needs to match certain campaigns requirements and after matching a campaign it needs to match a creative requirements, the amount of requirements can vary or each of them. 

For the Campaign Auction that I was rewriting for the Ad Server there were around 27 rules, there were rules to check if the requested Creative existed, GeoIP related rules, Language rules, among a bunch of other rules, in order to find a marching Campaign for that request, all 27 rules had to apply. To make this a bit more complicated the order of some of those rules did matter and it was not rare if we had to add or remove some of those rules. Now the reason why we had the need to rewrite this part of the Ad Server it was because the way that this was written in the first place, I'll try to illustrate this without showing the actual code.

```python
if client['creative_id'] in campaign['creatives']:
    if client['country'] in campaign['countries']:
        if client['region'] in campaign['regions']:
            if client['city'] in campaign['cities']:
                if client['language'] in campaign['languages']:
                    if client['param_1'] == campaign['param_1']:
                        if client['param_2'] == campaign['param_2']:
                            if client['param_3'] == campaign['param_3']:
                                if client['param_4'] == campaign['param_4']:
                                    if client['param_5'] == campaign['param_5']:
                                        if client['param_6'] == campaign['param_6']:
                                            if client['param_7'] == campaign['param_7']:
                                                if client['param_8'] == campaign['param_8']:
                                                    if client['param_9'] == campaign['param_9']:
                                                        if client['param_10'] == campaign['param_10']:
                                                            if client['param_11'] == campaign['param_11']:
                                                                if client['param_12'] == campaign['param_12']:
                                                                    if client['param_13'] == campaign['param_13']:
                                                                        if client['param_14'] == campaign['param_14']:
                                                                            if client['param_15'] == campaign['param_15']:
                                                                                if client['param_16'] == campaign['param_16']:
                                                                                    if client['param_17'] == campaign['param_17']:
                                                                                        if client['param_18'] == campaign['param_18']:
                                                                                            if client['param_19'] == campaign['param_19']:
                                                                                                if client['param_20'] == campaign['param_20']:
                                                                                                    if client['param_21'] == campaign['param_21']:
                                                                                                        if client['param_22'] == campaign['param_22']:
                                                                                                            # Finally found a matching campaign
```

No joke this was exactly how it was built but in PHP, the cherry on top was that this code had no tests at all, no wonder why programmers hate PHP but don't blame PHP, it's the lack of programming principles.

Each rule was not as simple as it's portrayed here, some had multiple conditions, some of those multiple conditions called other functions, if there was something to rescue from this was that each condition had a comment explaining briefly what it was evaluating.

The first thing that I thought that I should do to refactor this mess was to have some test coverage as a safety net to make sure I was going in the right path, but by looking at the amount of nested conditions it was going to be a nightmare to create the different test scenarios to try and reach the maximum test coverage, next thing that I thought that would help was to give each condition a name and by that I mean to use the "extract method" pattern to extract each condition into its own boolean function, that would give a meaningful name to each condition in order to start giving it some shape and form. But definitely my best move was to ask my coworkers for suggestions, one suggested to build an array of functions and loop through each function and the moment that one function returned false we could break out of the loop because all conditions must meet in order to proceed, that suggestion was clever because it prevented the need to have nested if statements and reduced the code and the complexity by leaps and bounds, my other co-worker suggested to take a peak at an Avdi Grimm post called ["Your business rules are objects too"](https://www.rubytapas.com/2018/07/03/rule-object/) which is a great article that helped take my solution an even greater form. 

Now, there's a twist to this story, the logical or conceptual Campaign Auction code was inside a a file that was around 2000 lines of code within a function that was probably 300 lines give or take, first thing was to extract the Campaign Auction code into a `CampaignAuction` class that would only do the Campaign Auction and nothing else long live SRP (Single Responsibility Principle). Once I managed to logically constrain the Campaign Auction code, it was time to get working on the refactor, I started by also extracting each condition into its own rule class that followed a simple interface with an `applies` boolean function, this means that I ended up with 27 rule classes all following the same interface.

```python
class CreativeExistRule:
    def __init__(self, campaign, client_data):
        self.client_data = client_data
    
    def applies(self):
        return self.client_data['creative_id'] in campaign['creatives']

class CountryRule:
    def __init__(self, campaign, client_data):
        self.client_data = client_data
    
    def applies(self):
        return self.client_data['country'] in campaign['countries']

class RegionRule:
    def __init__(self, campaign, client_data):
        self.client_data = client_data
    
    def applies(self):
        return self.client_data['region'] in campaign['regions']

class CityRule:
    def __init__(self, campaign, client_data):
        self.client_data = client_data
    
    def applies(self):
        return self.client_data['city'] in campaign['cities']
```

This separation of concerns is great because it makes the code really testable by being able to test each rule in isolation.

Let's see how the Campaign Auction class looks like after separating the logic from the 2000+ lines of code file.

```python
class CampaignAuction:    
    rules = [
        'CreativeExistRule',
        'CountryRule',
        'RegionRule',
        'CityRule',
    ]

    def __init__(self, campaign, client_data):
        self.campaign = campaign
        self.client_data = client_data

    def perform(self):
        meets_all = True
        for rule in rules:
            rule_constant = globals()[rule]
            rule_instance = rule_constant(self.campaign, self.client_data)
            if not rule_instance.applies():
                meets_all = False
                break
        return meets_all
```

It's really easy to see how this is much better than having all those nested if conditions that are virtually impossible to test under the current conditions. Now allow me to explain how this rule system works.

First thing to notice is the `rules` property in the `CampaignAuction` class, this is a list of the string representation of the class names of each rule class, we should be able to easily add and remove rules. Next is the `__init__` function that takes the `campaign` data that we're currently evaluating, we'll be instantiating a new auction for each campaign that we want to check against, we're also passing the `client_data` that will hold data coming from the request. Lastly we see the `perform` function that performs the actual auction. The "magic" happens by looping through each rule and finding the rule constant/class in the Python globals `globals()[rule]` and then we create an instance of that rule with `rule_constant(self.campaign, self.client_data)`, after we have the instance we call the `applies()` function if any of the rules return false we break out of the loop and return `False` to the `perform` function, if none of the rules return false then we'll be returning `True` to the function. We are able to do this regardless of the rule that's being evaluated because **all** rules follow the same interface. 

Final thoughts for this will be that we should always be testing our code, it works as a design tool, as documentation and also to give us peace of mind before we deploy to production. Another thing to keep in mind is to never be afraid to ask your coworkers for opinions, always keep an open channel for conversation around the ideas on how to solve a problem. Lastly inform yourself about software patterns and principles that will guide you to be a better developer, read blogs, books, talk to other developers, attend meetings, join developer groups, give talks and in general be involved in the overall developer community, you'll always learn something new. 

If you have any comments or questions feel free to reach out on twitter at [@fcastellanos](https://twitter.com/fcastellanos).