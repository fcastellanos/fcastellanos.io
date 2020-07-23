---
title: "Unit Testing with phpunit"
date: 2020-06-09T19:55:52-07:00
archives: "2020"
tags: [php, phpunit, testing]
author: Fernando Castellanos
draft: false
---

In this post I'm going to explain and walk you through how to write unit tests with PHP using phpunit.

First step is to add php unit as a requirement in your `composer.json` file. You can do that by running the following command.

```
composer require --dev phpunit/phpunit
```

Let's also go ahead and add an autoload entry to the composer file to make things easier, this is what the composer file should look like.

```json
{
    "autoload": {
        "classmap": [
            "src/"
        ]
    },
    "require-dev": {
        "phpunit/phpunit": "^9.2"
    }
}
```

We also need to create two folders `src/` and `tests/` in the root directory where the `composer.json` file is.

Go ahead and create a file named `PersonTest.php` inside the `tests/` directory.

```php
<?php

use PHPUnit\Framework\TestCase;

class PersonTest extends TestCase {
    public function testConstruct(): void {
        $person = new Person();
    }
}
```

And another file named `Person.php` inside the `src/` directory.
```php
<?php

class Person {

}
```

Now let's try to run the tests to check that the setup is working 

```
./vendor/bin/phpunit tests
```

If you get an error like
```
There was 1 error:

1) PersonTest::testConstruct
Error: Class 'Person' not found
```
Then you may need to run this command.

```
composer dump-autoload 
```

And try running the tests again, now you should see something like

```
There was 1 risky test:

1) PersonTest::testConstruct
This test did not perform any assertions
```

Congrats! the tests are working now.

Now let's go ahead and test something for real.

Add two assertions to the test that we have so it looks like this...

```php
<?php

use PHPUnit\Framework\TestCase;

class PersonTest extends TestCase {
    public function testConstruct() {
        $person = new Person('Fernando', 'Castellanos');

        $this->assertEquals('Fernando', $person->firstName);
        $this->assertEquals('Castellanos', $person->lastName);
    }
}
```
What we're doing here is adding a name and a last name to the Person's construct and afterwards expecting that the person instance should have a `firstName` property with `'Fernando'` as the value and a `lastName` property with `'Castellanos'` as the value. What we're really testing here is two things, one is that those two properties exist but also that their values are properly assigned at initialization.

Let's get down to business and try running this test.

```
./vendor/bin/phpunit tests
```

The test should fail and we should see this error

```
1) PersonTest::testConstruct
Failed asserting that null matches expected 'Fernando'.
```

Well that seems obvious because we haven yet implemented anything and the `Person` class is empty. Let's go ahead and create the `__construct` function.

```php
<?php

class Person {
    public function __construct($firstName, $lastName) {
        $this->firstName = $firstName;
        $this->lastName = $lastName;
    }
}
```

Run the tests again...

```
PHPUnit 9.2.2 by Sebastian Bergmann and contributors.

.                                                                   1 / 1 (100%)

Time: 00:00.004, Memory: 4.00 MB

OK (1 test, 2 assertions)
```

Success!!! 🎉🎉🎉

Now in this example we used `assertEquals` from `PHPUnit\Framework\TestCase` there are several types of assertions that we can use, you can check them in the readthedocs page for phpunit [here](https://phpunit.readthedocs.io/en/9.0/assertions.html), but I'm still going to show you a few here.

Let's say that we add two new properties to the `Person` class one named `$dob` for date of birth and another one `$isProgrammer`, for the `$isProgrammer` we're going to assing it with `true` at class initialization.
```php
<?php

class Person {
    public $dob;
    
    public function __construct($firstName, $lastName) {
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->isProgrammer = true;
    }
}
```

Since we're not assigning anything to `$dob` we should expect the property to be `null` while the `$isProgrammer` property to be `true`, let's see how we would go about asserting those two new properties.

```php
<?php

use PHPUnit\Framework\TestCase;

class PersonTest extends TestCase {
    public function testConstruct() {
        $person = new Person('Fernando', 'Castellanos');

        $this->assertEquals('Fernando', $person->firstName);
        $this->assertEquals('Castellanos', $person->lastName);
        $this->assertNull($person->dob);
        $this->assertTrue($person->isProgrammer);
    }
}
```

And that's it! it's pretty self-explanatory, `assertNull` asserts that the value that we are evaluating should be `null` and `assertTrue` asserts that the value that we're evaluating should be `true`. With this you should be able to check the read the docs and be able to combile these and new assertions to make sure that your code is as bug free as possible.

If you have any comments or questions feel free to reach out on twitter at [@fcastellanos](https://twitter.com/fcastellanos).

Happy Coding!