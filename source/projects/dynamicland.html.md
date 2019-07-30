---
layout: simple
---

# Experiments in Dynamicland

I had the opportunity to visit [Dynamicland](https://dynamicland.org/),
the lab where Bret Victor and his team are exploring a new medium for computing
that's oriented towards collaboration, physical space, and empowering
anyone to create.

At Dynamicland, rather than hunch over their own individual computers,
people gather around tables rearranging pieces of paper together in order to "program" the system.
You can find more background in [these](https://phenomenalworld.org/metaresearch/the-next-big-thing-is-a-room) [articles](https://rsnous.com/posts/notes-from-dynamicland-geokit/).

![](/images/project_images/dynamicland/space.jpg)

Over a couple days in the space, I built some small experiments exploring
possibilities for programming in this environment, focused on
empowering anybody to modify any program.

Most of the work enabling these demos,
including the OS, programming model, and hardware setup,
was done by the amazing team at Dynamicland.
I was merely exploring in the medium that they created.

## Real-object-oriented programming

Alan Kay's original vision of object-oriented programming was based on the idea
of recursively decomposing a computer into parts of equal power to the whole.
In a physical programming environment, not only can we have real world objects
that encapsulate the full spectrum of computational behavior,
we can also use spatial manipulation to affect their relationships.

I wanted to try making an object-oriented program with two properties:

* There is no centralized controller. All of the behavior of the program is
  distributed into individual objects, and the overall behavior
  emerges from their interactions.
* The physical arrangement of the objects affects the behavior of the program.
  This means there's no need for a "UI" since the user can simply manipulate
  the actual code objects running the program.

I ended up making a toy for people to explore binary numbers. Here's a quick
demo video:

<video controls="controls" preload="auto" data-video="0" src="/images/project_images/dynamicland/binary.mov"></video>

Each digit page is an object; in addition to containing the data about what
digit it is, it also contains all the behavior for connecting to other nearby
digits, chaining together a binary number to display, and converting the result
to decimal. The entire UI of the program is simply rearranging these digit
objects into different spatial configurations.

This feels quite different from a traditional visual programming approach of
connecting boxes and wires. Spatial layout goes beyond a convenience for our
understanding to being an essential part of defining the behavior.
Having behavior decentralized into independent objects creates
surprising possibilities for how objects can interact with each other.
The line between using the program and changing the program becomes blurred.

There are many open questions about how this style of programming would
work in other contexts or in scaled-up applications, but for enabling
anybody to remix a program that they're using,
I think it could be a fruitful direction to explore further.

## A primitive program visualizer

Usually when we see a program running in the world, whether an iPhone app or
the control system for our car, it's not easy to see how it's implemented.

In Dynamicland, the code for every program is literally printed out on paper,
which makes it somewhat easier to inspect how a program actually works.
Still, reading code is a pretty tedious way to understand a program.

![](/images/project_images/dynamicland/paper.jpg)

I wanted to see what it would feel like to walk around a room
with a special magnifying glass that could show you the insides of how
any program is working, live as you use it.

As a first step, I created a small tool that you could attach to any program
to graph any internal numerical variables over time.
(Many software debuggers only show you the current state of the program, but
seeing trends over time is often useful.)

Here's a demo of using that tool to see the internal state of a slider as we move it.
The slider is controlling the year value feeding into a historical data viz that somebody else made at Dynamicland.

<video controls="controls" preload="auto" data-video="0" src="/images/project_images/dynamicland/slider.mov"></video>

The physical nature of the tool made it feel more like attaching an oscilloscope
to a circuit than using a "debugger".
Even with such a simple tool, it felt a little bit magical to be able to
literally connect a visualizer to a running program.
In a future world where computation expands off of our smartphones
and into the world, I hope everyone can carry around these sorts of tools
to see inside the programs running our world.

I didn't have time to develop the idea any further, but a few ideas I had
for improvements:

* visualize the state of non-numerical variables, e.g. display a string
* physically display events being emitted and event handlers being triggered in realtime
* add a time scrubber to be able to rewind state to a previous value

