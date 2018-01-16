---
title: "Adding tail call optimization to a Lisp interpreter with just a few lines of code"
date: 2018-01-15 12:16 UTC
tags:
---

I spent the past week doing a programming retreat at the [Recurse Center](https://www.recurse.com/) in New York City.
As one of my projects I wrote a basic Lisp interpreter in Ruby, following the excellent [make-a-lisp](https://github.com/kanaka/mal/blob/master/process/guide.md)
tutorial.

One of the more educational steps was adding support for **tail call optimization**.
I had used tail call optimization before and had a vague sense of how
it worked, but it always sounded complicated. It turned out that implementing it in an interpreter was a great way to learn
that the core idea is actually very simple!

In this post, I'll show you why we need tail call optimization, and
exactly how I implemented it in an interpreter with a surprisingly small set of changes to the code.

READMORE

### Blowing out the stack

To start off, a quick tour of a few constructs our little Lisp interpreter supports:

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

Using these building blocks we can define a recursive function which sums all the
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

The relevant part of the code is the `EVAL` function in our Ruby code.
It takes as input an abstract syntax tree (AST) of tokens and an environment of
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

### The solution

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

It turns out Ruby doesn't actually have gotos (well...[mostly](http://patshaughnessy.net/2012/2/29/the-joke-is-on-us-how-ruby-1-9-supports-the-goto-statement)). But there's a sipmle hack to get equivalent behavior: we can wrap all of `EVAL` in an infinite loop and then call `next` when we want to
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

We can then apply a similar process to other language constructs.
Things get a bit more complicated especially when applying this approach to
user-defined functions, but the principle is exactly the same. If you're curious about the details
check out the [full code diff](https://github.com/geoffreylitt/mal/commit/56fe63351435e8031a18b92baaecf8dc07abf7e7)
or the [make-a-lisp guide](https://github.com/kanaka/mal/blob/master/process/guide.md#step-5-tail-call-optimization).

Now we can re-run the same code as before...

```clojure
(sum-to 10000 0)
50005000
```

Voila, we now have a tail call optimized interpreter!


