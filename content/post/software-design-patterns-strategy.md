---
title: "Software Design Patterns Strategy"
date: 2020-08-03T11:23:23-07:00
archives: "2020"
tags: [design patterns, software patterns, best practices, strategy, python, software development]
author: Fernando Castellanos
draft: false
---

In the sixth installment of the Software Design Patterns blog series I'll talk about the Strategy Pattern. This pattern is interesting because it allows the consumer of this code to choose what "strategy" it wants to use to do the work that needs to be done. You could have a list of different algorithms that are interchangeable and depending on the need we can choose one or the other. You can use this pattern in conjunction with the Adapter Pattern. 

Let's see an example.

```python
import types

class StrategyExample:
    def __init__(self, func = None):
        self.name = 'Strategy Example 0'

        if func is not None:
            self.execute = types.MethodType(func, self)

    def execute(self):
        print(self.name)

def execute_replacement1(self):
    print(self.name + ' from execute 1')

def execute_replacement2(self):
    print(self.name + ' from execute 2')
```

If we see the `StrategyExample` class it has an `execute` function that just prints out the `name` property, but in the initializer it can receive a `func` parameter that would be a function that replaces the `execute` function if `func` is present.

Down below we also see two functions `execute_replacement1` and `execute_replacement2` that just prints out a property `name` plus something else, the purpose of these functions is to act as replacements for the `execute` functions for the `StrategyExample` class

Now let's see how we can implement it

```python
strat0 = StrategyExample()

strat1 = StrategyExample(execute_replacement1)
strat1.name = 'Strategy Example 1'

strat2 = StrategyExample(execute_replacement2)
strat2.name = 'Strategy Example 2'

strat0.execute()
strat1.execute()
strat2.execute()
```

We create 3 instances of the `StrategyExample` class, one with no replacement and the other two with replacements for the `execute` function with `execute_replacement1` and `execute_replacement2`, after the three initializations we call `execute` on the three instances of the same class but see three different results, in this case the three implementations use the `name` property but in three different ways, this is the flexibility of the Strategy Pattern.

If you have any comments or questions feel free to reach out on twitter at [@fcastellanos](https://twitter.com/fcastellanos).