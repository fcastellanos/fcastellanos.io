---
title: "Software Design Patterns (Adapter)"
date: 2020-07-25T18:05:12-07:00
archives: "2020"
tags: [design patterns, software patterns, best practices, adapter]
author: Fernando Castellanos
draft: true
---

In this fifth part of the Software Design Patterns blog series I'll talk about a pattern that probably most of us have heard of or even used before but that we haven't had the opportunity to build, I'm talking about the Adapter Pattern.

The Adapter pattern acts as a bridge between two incompatible classes by "adapting" the functionality of one class into the other via an interface. One of the most popular examples of the Adapter Pattern is how different programming languages uses Adapter classes to access a database, it's very common to se `MySqlDataAdapter`, `PgSqlDataAdapter`, etc, what these adapters are doing is creating a bridge or "adapting" into the specificities of each database engine so you don't have to worry about those minor details or worse having to create your own adapters.

Now let's look at an example with an electrical socket analogy.

```python
class EuropeanSocketInterface:
    def voltage(self): pass
    def live(self): pass
    def neutral(self): pass
    def earth(self): pass

# Adaptee
class Socket(EuropeanSocketInterface):
    def voltage(self):
        return 230
    
    def live(self):
        return 1
    
    def neutral(self):
        return -1
    
    def earth(self):
        return 0
    
# Target interface
class USASocketInterface:
    def voltage(self): pass
    def live(self): pass
    def neutral(self): pass

# The Adapter
class Adapter(USASocketInterface):
    __socket = None

    def __init__(self, socket):
        self.__socket = socket
    
    def voltage(self):
        return 110
    
    def live(self):
        return self.__socket.live()
    
    def neutral(self):
        return self.__socket.neutral()

# Client
class ElectricKettle:
    __power = None

    def __init__(self, power):
        self.__power = power
    
    def boil(self):
        if self.__power.voltage() > 110:
            print("Halt and catch fire!")
        else:
            if self.__power.live() == 1 and self.__power.neutral() == -1:
                print("Coffee time!")
            else: 
                print("No power.")
```

In this example we have a socket which is European type (`EuropeanSocketInterface`) and we have a Kettle which have an electrical plug of the type we use in the US (`USASocketInterface`), now in order for us to be able to plug the Kettle in the European style socket we need to use an adapter (`Adapter`) that will use the `USASocketInterface`, if you check both socket interfaces the European and the USA we see that both have similar interface (`voltage`, `live`, `neutral`). 

Now let's see the example.

```python
socket = Socket()
adapter = Adapter(socket)
kettle = ElectricKettle(adapter)

kettle.boil()
```

The output being

```
Coffee time!
```

Here you can see the `ElectricKettle` class using the adapter (`Adapter`) to adapt to the European style socket. And if you check the `Adapter` we can see that we're really only overriding the value of `voltage` with `110` which is what the `ElectricKettle` use, in the case that it's higher than `110` it will `"Halt and catch fire!"`, on the other hand if everything else is correct it's going to be `"Coffee time!"` or `"No power."`.

And this is it for the Adapter pattern hope it's clear enough, if you have any comments or questions feel free to reach out on twitter at [@fcastellanos](https://twitter.com/fcastellanos).