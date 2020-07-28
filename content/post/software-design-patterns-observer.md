---
title: "Software Design Patterns (Observer)"
date: 2020-07-25T12:15:27-07:00
archives: "2020"
tags: [design patterns, software patterns, best practices, observer]
author: Fernando Castellanos
draft: false
---

This the third part of the Software Design Patterns series, in this post I'm going to talk about the Observer Pattern. This pattern is not exactly the same as the Publisher/Subscriber pattern but is very similar in the way that we have a publisher instance that publishes messages and we also have subscribers that are subscribed to the publisher's messages.

This pattern can be really useful because we could build a workflow where we can have the Publisher publish to the subscribers that an image have been downloaded and then have the subscribers transform that image into multiple formats. This pattern also allows us to extend features via "plug n play" without the other subscribers knowing, we can also remove subscribers without affecting the whole workflow.

Here's how you'd build the Observer pattern in Python:

```python
class Subscriber:
    def __init__(self, name):
        self.name = name
    
    def update(self, message):
        print('{} got message "{}"'.format(self.name, message))

class Publisher:
    def __init__(self):
        self.subscribers = set()
    
    def register(self, who):
        self.subscribers.add(who)
    
    def unregister(self, who):
        self.subscribers.discard(who)
    
    def dispatch(self, message):
        for subscriber in self.subscribers:
            subscriber.update(message)
```

In this example you see the `Subscriber` class that have a property `name` and an `update` function that the subscriber will call whenever it publishes a message. On the other side we have the `Publisher` class that have a `subscribers` property which is going to hold a list of subscribers that it needs to send messages to, it also have a `register` and `unregister` functions to add or remove subscribers from the list. Finally the `Publisher` class also have a `dispatch` function which is the one responsible to receive a message and passing that message to all of its subscribers.

This is how you'd run this

```python
pub = Publisher()

juan = Subscriber('Juan')
julia = Subscriber('Julia')
jaime = Subscriber('Jaime')

pub.register(juan)
pub.register(julia)
pub.register(jaime)

pub.dispatch("It's lunchtime!")
```

```
Juan got message "It's lunchtime!"
Julia got message "It's lunchtime!"
Jaime got message "It's lunchtime!"
```

```python
pub.unregister(juan)

pub.dispatch("Time for dinner")
```

```
Julia got message "Time for dinner"
Jaime got message "Time for dinner"
```

This is another simple pattern that can go a long way and not difficult to understand and implement.

If you have any comments or questions feel free to reach out on twitter at [@fcastellanos](https://twitter.com/fcastellanos).

Happy Coding!