---
title: "Software Design Patterns (Singleton)"
date: 2020-07-24T16:40:28-07:00
archives: "2020"
tags: [design patterns, software patterns, best practices, singleton]
author: Fernando Castellanos
draft: false
---

Software patterns for me is one of the most exciting practices in software engineering, it encapsulate best practices that have been been "discovered" and/or created along the years of people writing software, this is going to be the start of a series of posts where I'm going to talk about some of the patterns that I find very useful.

## Singleton
This defines a pattern for when you only need to create a **single** instance of a class for example let's say you have a class that is heavy on the initialization or that the class belongs to a service that you are creating that you need to maintain either state or share the state between other sections of your app, it could even be a class that calls a third party service that you don't want to be initializing every time that you need to call some function on it. In those cases a singleton class or pattern would be a good fit because you only initialize the class once and you can keep calling functions on it. Here's an example using Python:

```python
class Singleton:
    __instance = None

    @staticmethod
    def getInstance():
        if Singleton.__instance == None:
            Singleton()
        return Singleton.__instance
    
    def __init__(self):
        if Singleton.__instance != None:
            raise Exception("You cannot create multiple instances")
        else:
            Singleton.__instance = self
```

And here's an example of how you would use it

```
>>> from singleton import Singleton
>>> s = Singleton()
>>> print(s)
<singleton.Singleton object at 0x105e76fd0>
>>> s = Singleton.getInstance()
>>> print(s)
<singleton.Singleton object at 0x105e76fd0>
>>> s = Singleton()
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/Users/fcastellanos/Projects/python/software-patterns/singleton.py", line 12, in __init__
    raise Exception("You cannot create multiple instances")
Exception: You cannot create multiple instances
```

You can see that the two times that we print the singleton instance we get the same object `0x105e76fd0` but at the time that we try to instantiate a new instance of the Singleton class an exception is raised because the pattern prohibits the creation of multiple instances of the class.

That's it, let me know what you think.

If you have any comments or questions feel free to reach out on twitter at [@fcastellanos](https://twitter.com/fcastellanos).

Happy Coding!

