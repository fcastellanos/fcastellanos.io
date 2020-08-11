---
title: "Software Design Patterns (Builder)"
date: 2020-08-11T10:30:04-07:00
tags: [design patterns, software patterns, best practices, builder, python, software development]
author: Fernando Castellanos
draft: false
---

The seventh and last blog post in the series of Software Design Patterns it's an interesting one, it's the Builder Pattern. The builder patter is a unique pattern that allows us to create complex objects out of several simple and independent objects. A key advantage of this pattern is that it creates a clear separation of concerns and a better control over the object that we're creating.

Here's an example built in Python:

```python
class Director:
    __builder = None

    def setBuilder(self, builder):
        self.__builder = builder
    
    def getCar(self):
        car = Car()

        # First goes the body
        body = self.__builder.getBody()
        car.setBody(body)

        # Then engine
        engine = self.__builder.getEngine()
        car.setEngine(engine)

        i = 0
        while i < 4:
            wheel = self.__builder.getWheel()
            car.attachWheel(wheel)
            i += 1
        
        return car

# The whole product 
class Car:
    def __init__(self):
        self.__wheels = list()
        self.__engine = None
        self.__body = None
    
    def setBody(self, body):
        self.__body = body
    
    def attachWheel(self, wheel):
        self.__wheels.append(wheel)

    def setEngine(self, engine):
        self.__engine = engine
    
    def specification(self):
        print("body: %s" % self.__body.shape)
        print("engine horsepower: %d" % self.__engine.horsepower)
        print("tire size: %d\'" % self.__wheels[0].size)

class Builder:
    def getWheel(self): pass
    def getEngine(self): pass
    def getBody(self): pass

class JeepBuilder(Builder):
    def getWheel(self):
        wheel = Wheel()
        wheel.size = 22
        return wheel
    
    def getEngine(self):
        engine = Engine()
        engine.horsepower = 400
        return engine
    
    def getBody(self):
        body = Body()
        body.shape = "SUV"
        return body

# Car parts
class Wheel:
    size = None

class Engine:
    horsepower = None

class Body:
    shape = None
```

There's a lot of thing happening here so let's break it apart. First we see the `Director` class which is sort of the director of an orchestra orchestrating the building of a car by setting the different properties of the car like the body, the engine and the wheels. Then we have the `Car` class which is basically a shell that receives the different parts of the car with the help of the `Director`. Down the code we see the `Builder` class which acts more like an interface defining the basic methods for building a car. The `JeepBuilder` class inherits from the `Builder` class and define the specifics for building a Jeep car by defining the size of the wheels, the horsepower and the shape of a Jeep car, we can create multiple builder classes for different brands of cars. Lastly we have the "placeholder" classes `Wheel`, `Engine` and `Body` we can use for every type of car.

Here's how we to tie everything together:


```python
jeepBuilder = JeepBuilder() # initializing the class
director    = Director()

# Build Jeep
director.setBuilder(jeepBuilder)
jeep = director.getCar()
jeep.specification()
```

Now on this part we instantiate a `JeepBuilder` instance and a `Director` instance separately and then we set the jeep builder to the director because builder is the one that provides the car parts to the director so it can "attach" them to the `car` object when calling the `getCar()` method. Lastly we call the `specification()` method on the `jeep` instance which displays the car properties showing that everything's working properly.

This might take a bit of time to get used to but it's a very powerful pattern that allows you to have everything separated and just build complex objects like if they were LEGO blocks.

As always if you have any comments or questions feel free to reach out on twitter at [@fcastellanos](https://twitter.com/fcastellanos).