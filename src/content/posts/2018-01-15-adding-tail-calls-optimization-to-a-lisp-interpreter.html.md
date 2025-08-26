---
title: "Adding tail call optimization to a Lisp interpreter in Ruby"
date: 2018-01-15 12:16 UTC
tags:
---

I spent the past week doing a programming retreat at the [Recurse Center](https://www.recurse.com/) in New York City.
One project I worked on was writing a simple Lisp interpreter in Ruby, following the excellent [make-a-lisp](https://github.com/kanaka/mal/blob/master/process/guide.md)
tutorial.

One of the more educational steps was adding support for **tail call optimization**.
I had used tail call optimization before and had a vague sense of how
it worked, but it always sounded complicated. Implementing it in a toy interpreter was a great way to understand it better, and it turns out that the core idea is actually very simple!

In this post, I'll show you why we need tail call optimization, and
exactly how I implemented it in an interpreter with a surprisingly small set of changes to the code.

READMORE

### Blowing out the stack

To start off, let's take a quick tour of a few constructs the Lisp interpreter supports:

```clojure
; basic math
> (+ (* 2 3) (* 4 5))
26

; variables
> (def! n 1)
> n
1

; conditionals
> (if (= n 1) "yep" "nope")
"yep"

; user-defined functions
> (def! double (fn* (x) (* x 2)))
> (double 5)
10
```

Using these building blocks, we can define a recursive function which sums all the
integers from 0 up to a given number. On each recursive call we decrement `n`
and add to our accumulator variable `acc`, until we hit the base case of `n = 0`.

```clojure
(def! sum-to
  (fn* (n acc)
    (if (= n 0)
      acc
      (sum-to (- n 1) (+ n acc)))))

; test it out:
(sum-to 3 0) ;=> 6
```

On small inputs, it works great. But with a large input, it doesn't work so well --
we get a Ruby error "stack level too deep".

```clojure
(sum-to 10000 0)
;=> /Users/glitt/personal-dev/mal/glitt/env.rb:16: stack level too deep (SystemStackError)
```

### The problem

To understand why that happened, we need to look inside our interpreter.

The relevant part of the code is the `EVAL` function, which is the heart
of the interpreter. It takes as input an abstract syntax tree (AST) of tokens and an environment of
symbol definitions, and returns a new AST representing the fully-evaluated expression.

```ruby
def EVAL(ast, env)
  # evaluate the AST passed in, return a new AST
end
```

The body of our `sum-to` function is a conditional expression, so let's zoom in on the
part of EVAL that's responsible for evaluating conditionals.

```ruby
def EVAL(ast, env)
  # ...
  case ast.first

  # If the first symbol in the AST is :if,
  # we're evaluating a conditional
  when :if
    # Destructure the arguments out of the AST
    conditional, true_branch, false_branch = ast[1..3]

    # Evaluate the conditional,
    # then evaluate the appropriate branch
    if truthy?(EVAL(conditional, env))
      return EVAL(true_branch, env)
    else
      return EVAL(false_branch, env)
    end
  # ...
end
```

**Notice that we make a function call to `EVAL` as part of evaluating a conditional.**
This allocates a new stack frame every time we evaluate a conditional...hence the stack overflow
when we recursively evaluate hundreds of them. To solve this we need to find a way
to avoid allocating a new stack frame every time we evaluate a conditional.

### The idea

Here's one potential solution. Imagine for a second that Ruby had `GOTO` statements.
First, put a `LABEL` at the top of our `EVAL` function. Then, when evaluating a
branch of the conditional, instead of making a function call, we could just set the
`ast` variable to point at the new code we want to evaluate, and then `GOTO`
the top of the `EVAL` function. Then `EVAL` would continue executing, this time
with the new code in the `ast` variable.

(If you're paying close attention you may have noticed `EVAL` also has a second
argument, but in this case it doesn't change between executions so we can just leave it unchanged.)

```ruby
def EVAL(ast, env)
  LABEL top_of_eval
  # ...
  case ast.first

  when :if
    conditional, true_branch, false_branch = ast[1..3]

    if truthy?(EVAL(conditional, env))
      ast = true_branch
      GOTO top_of_eval
    else
      ast = false_branch
      GOTO top_of_eval
    end
  # ...
end
```

It turns out Ruby doesn't actually have gotos (well...[mostly](http://patshaughnessy.net/2012/2/29/the-joke-is-on-us-how-ruby-1-9-supports-the-goto-statement)). But there's a simple hack to get equivalent behavior: we can wrap all of `EVAL` in an infinite loop and then call `next` when we want to
go back to the top of the loop.

```ruby
def EVAL(ast, env)
  loop do
    # ...
    case ast.first

    when :if
      conditional, true_branch, false_branch = ast[1..3]

      if truthy?(EVAL(conditional, env))
        ast = true_branch
        next
      else
        ast = false_branch
        next
      end
    # ...
  end
end
```

Now when our interpreter evaluates a conditional it no longer
makes a function call, and consequently no longer allocates a new stack frame.

### Extending to function calls

In order to make our `sum-to` function run successfully, we'll need to
also make function calls tail-optimized in our interpreter.

The principle is exactly the same as with conditionals, but the implementation
is a bit more involved because function calls also involve binding variables to
arguments and creating a new environment for evaluation.

Let's first look at how function definition is implemented in our
interpreter. When a function is defined by the user, we simply return a Ruby
`Proc` as our internal representation of the function. (If you're not familiar
with Ruby, this is the standard Ruby object for representing a function.)

```ruby
def EVAL(ast, env)
  loop do
    case ast.first
    # ...
    when :"fn*"
      params = ast[1]
      fn_body = ast[2]

      return -> (*args) do
        # Create a new environment:
        # inherits from current environment and
        # binds variables to passed-in arguments
        new_env = Env.new(
          outer: env,
          binds: params,
          exprs: args
        )

        # Evaluate function body in context of new environment
        EVAL(fn_body, new_env)
      end
    # ...
  end
end
```

Later on, when the user calls the function in their code, we just
call the Proc: `function.call(*args)`

When that happens, our `Proc` object makes a call to
`EVAL`, which allocates a stack frame. By now you know that this makes it
unsafe to deeply recurse using this function, so we'll need to apply
a fix similar to what we did with conditionals.

First, instead of returning a `Proc` to internally represent the
user-defined function, we just return a hash which remembers the
function's parameters and its unevaluated body.

```ruby
def EVAL(ast, env)
  loop do
    case ast.first
    # ...
    when :"fn*"
      params = ast[1]
      fn_body = ast[2]

      return {
        ast: fn_body,
        params: params,
        env: env
      }

    # ...
  end
end
```

We then need to change how we execute function calls.
Just like we did with conditionals, we reassign the `ast` variable in place.

In addition, we also have to create a new environment for execution.
We handle that similarly, by replacing `env` in place with a newly
defined environment with function inputs bound.

Then we call `next` to go back to the top of `EVAL`,
and the interpreter starts evaluating the function body.

```ruby
def EVAL(ast, env)
  loop do
    # ...

    # ---
    # function evaluation
    # ---

    ast = function[:ast]
    env = Env.new(
      outer: function[:env],
      binds: function[:params],
      exprs: args
    )

    next
  end
end
```

Now that conditionals and function calls are tail-optimized, our
`sum-to` function should be able to run an arbitrary number of times
without running out of stack space. Let's try it out:

```clojure
(sum-to 10000 0)
50005000
```

Voila, we now have a tail call optimized interpreter! To learn more, check out the [full code diff on Github](https://github.com/geoffreylitt/mal/commit/56fe63351435e8031a18b92baaecf8dc07abf7e7)
or the [make-a-lisp guide](https://github.com/kanaka/mal/blob/master/process/guide.md#step-5-tail-call-optimization).

[Discuss on Hacker News](https://news.ycombinator.com/item?id=16168191)
