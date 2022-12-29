---

title: "Dynamic documents // LLMs + end-user programming"
date: 2022-11-23 15:55 UTC
tags:
summary: "Dynamic documents as personal software, and reflections on the role of AI in end-user programming..."
starred: false

---

_A brief note: This is a mirror of an email newsletter I sent out in November 2023, originally hosted [here](https://buttondown.email/geoffreylitt/archive/dynamic-documents-llms-end-user-programming/). I'm experimenting with cross-publishing to my personal site and through my email newsletter service, so that the long-term archive can be hosted here._

---

# Potluck: Dynamic documents as personal software

We recently published an essay about [Potluck](https://www.inkandswitch.com/potluck/), a research project I worked on together with [Max Schoening](https://twitter.com/mschoening), [Paul Shen](https://bypaulshen.com/), and [Paul Sonnentag](http://paulsonnentag.com/) at [Ink & Switch](https://www.inkandswitch.com/).

You can read the essay here:

[Potluck: Dynamic Documents as Personal Software](https://www.inkandswitch.com/potluck/)

Potluck originated from a desire to make it easier for people to build little pieces of personal software. We ended up building a prototype that enables people to gradually enrich text notes into interactive tools by extracting structured data from freeform text, running computations on that data, and then injecting the results back into the text as annotations.

![](article_images/potluck.png)

You can use it to do all sorts of things, including scale recipe ingredients, keep track of household chores, or manage a meeting—lots more examples and details in the essay. We found that starting with familiar text notes seems to make it easier to think of places to use computation; instead of thinking "what app should I make?" you can just notice places in your notes app where you'd like a small extra bit of functionality.

I also talked about the project on two podcasts. Both were conversations with friends who are deeply thoughtful about end-user programming, which was a ton of fun:

- [Metamuse, Episode 67](https://museapp.com/podcast/67-dynamic-documents/), with [Max Schoening](https://twitter.com/mschoening) and [Adam Wiggins](https://adamwiggins.com/)
- [Building Software Quickly, Episode 1](https://overcast.fm/+9UfGKgvkQ/), a new podcast by [Mary Rose Cook](https://maryrosecook.com/)

There's also a [live demo](https://www.inkandswitch.com/potluck/demo/) where you can play with Potluck. Expect prototype quality, but there is a tutorial and we were able to get quite far using the tool ourselves.

Also, since the essay release a couple people have been [building their own](https://twitter.com/akkartik/status/1589011612408897537) implementations of Potluck, which has been neat to see.

We're not planning on developing this particular prototype any further, or turning it into a product or anything. But we do plan to carry the lessons we learned from this prototype into future computing environments we're thinking about at Ink & Switch. (One main reason for this approach is that Potluck really works better as an OS feature more than an isolated app.)

Anyway, if you have thoughts or feedback on this work, just reply here—even a single sentence or few bullet points is appreciated! I'd love to try to spark more conversations over email with these newsletters.

# LLMs + end-user programming

2022 has been the year of large language models. I think the hype is justified; the tech is already good enough to do lots of useful stuff and the rate of progress is astounding. I'm trying my best to keep up with all the changes and think about how AI might fit in for end-user programming. Here are some messy reflections.

In my daily programming work, I use GitHub Copilot every day, and it's almost weird to program without it now. I also regularly ask GPT-3 more open-ended questions about programming and other subjects and find it more useful than Google / Stack Overflow in many cases. Three years ago I was confident that it'd take a very long time for language models to become useful for programming, and I expected traditional program synthesis methods to preserve their edge for a while. I've now learned my [Bitter Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html).

If you haven't been following along with the progress, I recommend getting some intuition by skimming [Riley Woodside's Twitter feed](https://twitter.com/goodside) and then replicating some of his examples on the free [GPT-3 Playground](https://beta.openai.com/playground). The latest GPT-3 model is remarkably good—if, big if!—you know how to talk to it properly. It really does resemble soft human reasoning, although there are still glaring and sometimes hilarious flaws to watch out for.

There are clearly some massive opportunities for AI to help out with supporting non-programmers in building and tailoring software. One of the biggest barriers to making computers do stuff is learning to write code in traditional programming languages, with their rigid reasoning and delicate syntax. People have been thinking for a long time about ways to get around this. For many decades people have been chasing the dream of having the user just demonstrate some examples, and automatically creating the program:

> The motivation behind Programming by Demonstration is simple and compelling: if a user knows how to perform a task on the computer, that should be sufficient to create a program to perform the task. It should not be necessary to learn a programming language like C or BASIC. Instead, the user should be able to instruct the computer to "Watch what I do", and the computer should create the program that corresponds to the user's actions.

-Allen Cypher in [Watch What I Do: Programming by Demonstration](http://acypher.com/wwid/FrontMatter/index.html#Introduction), published in 1993 (!)

Progress on this had been quite slow, though—it turns out that generalizing well from examples is a really hard problem. [FlashFill](https://support.microsoft.com/en-us/office/using-flash-fill-in-excel-3f9bcf1e-db93-4890-94a0-1578341f73f7) in Microsoft Excel was a major breakthrough for the program synthesis field—a big commercial deployment of programming-by-example!—but was still limited to quite small problems.

With AI on the scene, there's been sudden progress. In particular, natural language is now viable as a specification language, and even providing examples is optional in some cases! But there are still tricky questions to answer about how the tech best fits in.

## Tools vs machines

I think there's a blurry but useful distinction to be drawn between "tools" and "machines":

https://twitter.com/geoffreylitt/status/1216750194886422531

When it comes to AI, I'm much more interested in using AI to amplify human capabilities than I am in cheaply automating tasks that humans were already able to do. In their essay [Using Artificial Intelligence to Augment Human Intelligence](https://distill.pub/2017/aia/), Shan Carter and Michael Nielsen call this idea "Artificial Intelligence Augmentation", or AIA. I think it's a nice phrase to describe the goal. (Another good read on this topic: [How To Become A Centaur](https://jods.mitpress.mit.edu/pub/issue3-case/release/6), by Nicky Case)

The general vibe of AIA is: human in the driver seat, precisely wielding a tool, but supported by AI capabilities. For example, Carter and Nielsen use the example of moving a slider to change the boldness of a font, where "boldness" is a dimension that a machine learning model learned from looking at many existing fonts. Notably, the user interaction is fast and direct-manipulation; not at all like "talking to a human over a chatbot."

[Linus](https://thesephist.com/) recently posted some demos of dragging a slider to change the length or emotional tone of a text summary, which I think has a similar sense of "tool" rather than "machine":

https://twitter.com/thesephist/status/1587929014848540673

We didn't use LLMs in Potluck, but it'd be a natural extension, as we discuss briefly in the [Future Work](https://www.inkandswitch.com/potluck/#future-work). There, the AI could help with extracting structured data from messy raw text data, but still leave the user in control of deciding what kinds of computations to run over that structured data. I think this is a nice split because it lets AI do the thing that traditional code is terrible at, but doesn't try to automate away the entire process. It's also exactly the split that Nardi, Miller and Wright envisioned when they [invented data detectors](https://artifex.org/~bonnie/pdf/Nardi_program_agents.pdf) at Apple:

> We tried to find a middle ground by using explicit representations of user-relevant information as a means of identifying actions users might wish to take but to leave the choice of these actions to users.

But! I think it can be subtle sometimes to tell the difference between tool and machine. Recently I've been using a wonderful video editing app called [Descript](https://www.descript.com/) which lets you edit a video by editing the text transcript. This is clearly a tool that amplifies my abilities; I'm an order of magnitude faster at editing talks when I'm using this software, and it enables [entirely new kinds of workflows](https://twitter.com/geoffreylitt/status/1572736140154933253). But it's also built on top of a capability that seems quite machine-y: automatically transcribing a video into text, a task which used to require lots of human effort.

Maybe the Descript example suggests "automating away the tedious part" is a reliable recipe for making tools that support human abilities, but it's not obvious to me what counts as the tedious part. If I write a one sentence summary that gets auto-expanded into a whole blog post, is that a tool or a machine? I have instinctive opinions on these things, but I worry about trusting those instincts too much; I don't want to be an old guy arguing against calculators in math classes.

## Interpreter vs compiler

It seems like there's two main ways to use an LLM:

- "AI as fuzzy interpreter": Give instructions, just have the AI directly do stuff for you
- "AI as compiler": Have the AI spit out code in Python, JavaScript, or whatever language, that you can run

There are serious tradeoffs here. The AI can do soft reasoning that's basically impossible to do in traditional code. No need to deal with pesky programming, just write instructions and let 'er run. On the other hand, it's harder to rely on the AI—what will happen when you give it new inputs, or when the model changes?  It's also (for now) slower and more expensive to run AI inference than to run traditional code. (Andrej Karpathy's [Software 2.0](https://karpathy.medium.com/software-2-0-a64152b37c35) blog post covers some of these tradeoffs in more depth.)

Here's a great example of the "just use the AI" approach: entering GPT prompts directly as "formulas" into Google Sheets. Works great, looks like magic:

https://twitter.com/shubroski/status/1587136794797244417

But also, a bunch of the results were wrong 🙃:

https://twitter.com/danielxli/status/1587198402181599232

I'm very curious where we'll see each of these two techniques used, and what hybrids will emerge.

I expect reliability to improve dramatically over the coming years as models and prompting techniques get more mature, but the last 5-10% will be really hard. Any place where 90% accuracy is good enough will be fair game for directly running AI (notably, this probably means replacing any workflow where human error was already expected and accounted for), but 99%+ accuracy will probably benefit from code generation for a while. I suspect this means that in any domain where code is *already being used* today, code will remain dominant for a while, even if it's increasingly AI-generated.

Reliability aside, it also seems like there's a lot of benefit in having code as a clearly structured artifact that human and AI can iterate on together. If people aren't writing code manually as much, that means that programming languages could evolve towards being easier to read and edit than write from scratch.

One of my favorite interaction ideas in this area comes from a traditional synthesis paper, [User Interaction Models for Disambiguation in Programming by Example](https://www.microsoft.com/en-us/research/wp-content/uploads/2015/11/uist15.pdf). The idea is that the AI generates a program based on user specification, and then shows the user a description of the program written in natural language syntax. It also shows alternative code that it *could have written* within various parts of the program, and lets the user directly choose between the options:

![](article_images/uist15.png)

I like how this engages the human in reasoning clearly and directly about the desired behavior, while still getting a lot of help from fuzzy reasoning. It'll be interesting to see how programming languages evolve to support easier reading, editing, and verification, as opposed to always writing from scratch...

Alright, I'm out of time for now. I'm thinking a lot about this topic these days so I'll plan to share more soon, and would love to hear from you if you have thoughts on any of this.