---
title: "Software Design Patterns (State)"
date: 2020-07-25T14:30:16-07:00
archives: "2020"
tags: [design patterns, software patterns, best practices, state]
author: Fernando Castellanos
draft: true
---

This is the fourth part of the Software Design Patterns blog post series, in this post I'm going to talk about the State Pattern or the State Machine Pattern, which is a pattern that defines a way to transition between the state of a process and allows you to define the rules of the transition.

I'll explain it with an analogy of the state of a computer.

```python
class ComputerState(object):
    name    = "state"
    allowed = []

    def switch(self, state):
        # Switch to new state
        if state.name in self.allowed:
            print("Current:", self, " => switched to new state", state.name)
            self.__class__ = state
        else:
            print("Current:", self, " => switching to", state.name, "not possible.")
    
    def __str__(self):
        return self.name

class Off(ComputerState):
    name = "off"
    allowed = ['on']

class On(ComputerState):
    # State of being powered on and working
    name = "on"
    allowed = ['off', 'suspend', 'hibernate']

class Suspend(ComputerState):
    # State of being in suspended mode after switched on
    name = "suspend"
    allowed = ['on']

class Hibernate(ComputerState):
    # State of being in hibernation after powered on
    name = "hibernate"
    allowed = ['on']

class Computer(object):
    #  A class representing a computer

    def __init__(self, model='HP'):
        self.model = model
        # State on the computer - default is off.
        self.state = Off()
    
    def change(self, state):
        # Change state
        self.state.switch(state)
```

There's a lot going on here so let me break it down. First we see the `ComputerState` class which is the one that will orchestrate the switching of the state by checking if we're allowed to change the state of the process or not, in this case it's doing the checking/switching via the `switch` function. 

Then we also have the `Off`, `On`, `Suspend` and `Hibernate` classes which inherits from the `ComputerState` class, each of those state classes have their own `name` and `allowed` properties, the `name` property is self explanatory but the `allowed` property is a list of allowed states to switch from the current state of the state machine. 

Finally we have the `Computer` class which have two properties, `model` that specifies the model of the computer, and `state` that indicates the state of the computer via a state machine, at the beginning the computer's state will be `Off`, the `Computer` class also defines the `change` function which takes the state that we want to switch to. If we look closer to the `change` function in the `Computer` class it's calling the `switch` function in the current state instance, now going back to the `ComputerState` class we can see that the `switch` function checks if the state that we want to switch to is in the `allowed` list, if it is in the allowed list we switch to that state if it isn't we print out that switching to that state it's not possible.

This pattern might take a bit of upfront work to fully define the states and the rules but once you define them it's going to make your life easier and it will also avoid having a bunch of if statements checking rules and states.

As always if you have any comments or questions feel free to reach out on twitter at [@fcastellanos](https://twitter.com/fcastellanos).