---
title: OCaml vs Ruby for implementing a programming language
date: 2020-08-28 18:46 UTC
tags:
---

- Languages have their strong applications. OCaml is known for being awesome to build PLs. but why? What's the fuss? I'm going to show you via concrete code examples.
  - Original Rust compiler
  - Full-stack tools: Hazel, Dark
- I've built the MAL lisp in Ruby (see the TCO post) and now doing it in OCaml.
  - Like the TodoMVC of language implementations
- Ruby isn't bad but it's no OCaml for this purpose.
  - dynamic OO(ish) lang with lots of mutation
  - vs. static functional lang with mostly immutable.

Little notes:

- Link to Jon Edwards post?
- Note ReasonML is a potential for full stack envs too.
- Note the "Sweet spot", Matt Might

# Why it's great

## Static typing

- so many bugs fixed
- tagged unions
- ad hoc nil checks in ruby are covered in ocaml
- no annotations needed due to inference
  - maybe we'll cover how this works sometime soon. OCaml is a great lang for implementing type inference.
- can be a little annoying sometimes that it's hard to get the program to run
  - I wish there were "type warnings" as Yegge said in his compilers essay, or Typescript has.
  - tricks:
    - fill in bogus code that passes type checking
    - adding type annotations to guide type inference

## Pattern matching

- tagged unions + destructuring, amazing
- show some examples of where pattern matching rules
- exhaustiveness checking catches weird cases

## Immutable (mostly)

- contrast environment mutation
- note how ref makes it easy to still manage limited mutable state
- reasoning about env state in ruby isn't as easy

# Why it's not

- ugh, tooling (link to Paul Biggar's post)
- Makefile, library linking, etc
- some exciting news on this front from the OCaml platform keynote
