---
title: "Software Design Patterns (Factory)"
date: 2020-07-25T10:14:52-07:00
archives: "2020"
tags: [design patterns, software patterns, best practices, factory]
author: Fernando Castellanos
draft: true
---

In this next post from the Software Design Patterns I'll talk about one of my favorite patterns which is the Factory pattern, this pattern allows you to create objects without exposing the class directly or its functionality and you interact with the object through a common behavior called an interface.

This pattern is great because it reduces complexity when you need to instantiate objects which have the same behavior so you can focus the business side of the application.

Here's an example.

```python
class Animal(object):
    html = ""
    def make_sound(self):
        return self.html

class Cat(Animal):
    html = "meow meow"

class Dog(Animal):
    html = "woof woof"

class Lion(Animal):
    html = "roaaaaar"

class AnimalFactory():
    def create_animal(self, typ):
        targetclass = typ.capitalize()
        return globals()[targetclass]()
```

The `Animal` class will act as the interface or the behavior for the `Cat`, `Dog` and `Lion` classes which are technically inheriting the behavior from `Animal`, in this case all classes inheriting from  `Animal` all will have the `make_sound` function. Now for the good stuff, the `AnimalFactory` class will be the one responsible for instantiating the `Cat`, `Dog` and `Lion` classes.

```python
animal_factory = AnimalFactory()
animals = ['cat', 'dog', 'lion']
for a in animals:
    animal_instance = animal_factory.create_animal(a)
    print(animal_instance.make_sound())
```

And the result should be this

```
meow meow
woof woof
roaaaaar
```

If you see you don't really know what class the `animal_instance` belongs to, you just know that it should have a `make_sound` function. 

And that's it, this is a simple but a very powerful pattern that it does not take a lot of effort to start using it.

If you have any comments or questions feel free to reach out on twitter at [@fcastellanos](https://twitter.com/fcastellanos).

Happy Coding!