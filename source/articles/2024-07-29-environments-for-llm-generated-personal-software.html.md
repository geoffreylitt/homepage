---

title: "Malleable software in the age of LLMs, Part 2: Shared Data"
date: 2024-07-29 14:32 UTC
summary: "What structural changes will software undergo as LLMs make coding accessible to more people? I think we'll see a stronger incentive towards <b>shared data layers</b> across apps."
tags:

---

![](/images/article_images/llm-eup-2/filing-cabinet.webp)

One of the neatest things about LLMs is their ability to write code. It's clear how this capability can help working programmers—I use tools like [GitHub Copilot](https://github.com/features/copilot) [Cursor](https://www.cursor.com/) constantly when I'm coding now. But I think **it's even more interesting to consider what LLM coding will do for people who *aren't* programmers**.

Much as the invention of spreadsheets enabled financial analysts to build their own modeling tools without needing to program in traditional languages, it seems likely that the ability to turn language into code will unlock new kinds of creation for people who previously haven't been able to write software at all.

In my previous post [Malleable software in the age of LLMs](/2023/03/25/llm-end-user-programming.html), I outlined a theory for some things we might expect to see as this shift plays out:

> I think it's likely that soon all computer users will have the ability to develop small software tools from scratch, and to describe modifications they'd like made to software they're already using. In other words, LLMs will represent a step change in tool support for [*end-user programming*](https://www.inkandswitch.com/end-user-programming/): the ability of normal people to fully harness the  general power of computers without resorting to the complexity of normal programming. Until now, that vision has been bottlenecked on turning fuzzy informal intent into formal, executable code; now that bottleneck is rapidly opening up thanks to LLMs.

Since that post, there's been some exciting progress!

First, model capabilities have advanced substantially since GPT-4. In particular, Claude 3.5 Sonnet has [set new benchmarks](https://www.anthropic.com/news/claude-3-5-sonnet) for coding—in my anecdotal experience, it seems to have taken a qualitative leap forward in developing simple UIs using common web development frameworks like React and Tailwind.

And perhaps more intriguingly, new product interfaces like [Claude Artifacts](https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them) and [Websim](https://websim.ai/) have made this capability much more accessible to a broader audience, triggering a *ton* of fun exploration. People are using using these tools to make all kinds of little [simulations](https://x.com/emollick/status/1810791731438465094) and [games](https://x.com/Mappletons/status/1819760681274806652), [small productivity tools](https://x.com/alexalbert__/status/1817996841923104908), and more.

All this progress is exciting, and there seems to be growing awareness of the potential unlocked by having LLMs quickly and scrappily write code for us. But it also raises new questions: where is this momentum taking us? **How will the creation and distribution of software shift as more people are able to create small tools for their own needs?**

One of the most intriguing possibilities I see ahead is a shift in the way that we store our data in our applications. **I think LLM-generated personal software may nudge us towards a shared data layer across applications**—a kind of modern "filesystem" for our data that serves as a foundation for extending with new mall tools.

This isn't a new idea–it's been tried many times and hasn't caught on widely for now. But I think that AI-generated software might shake up the picture.

In this post, I'll start by briefly describing the old dream of shared data. Then I'll explain how AI-generated tools might represent an opportunity for a fresh start on data architecture, with new incentives that tilt towards a world of open shared data.

## The dream of shared data...

Before speculating about the future, let's return to the past.

**The desktop filesystem provides a lot of value because it stores all your data.** It's nice for users because you can have a folder for a project with all kinds of files stored within. You can manage things like backup and sync horizontally across all your data. And—crucially—you can access the same file from multiple applications, enabling workflows like editing a Markdown file in iA Writer, Obsidian, or any editor of your choosing. (I've written before about how nice it is to [Bring Your Own Client](/2021/03/05/bring-your-own-client.html))

todo: image

These benefits extend to application developers too. When you build a desktop application, you don't need to build your own persistence layer from scratch—you can just save to the filesystem and let the operating system handle your app's data.

These days, though, new software often gets built for cloud and mobile platforms, which have a very different feel. In cloud apps, **data gets stored in an app-specific silo, not by some underlying general platform.** Apps can't access each others' data. Alex Komoroske calls this the ["same-origin paradigm"](https://docs.google.com/document/d/1ptHfoKWn0xbNSJgdkH8_3z4PHLC_f36MutFTTRf14I0/edit#heading=h.11wb2r78fdjn).

todo: image

On the bright side, the shift to modern data storage has enabled some powerful new collaboration patterns, most notably replacing the dreaded "email around a file" workflow with the Google Docs style "collaborate on a live URL" workflow. And it also makes security simpler when each app can only access its own data.

And yet, **the loss of the generic filesystem layer has cost us a lot.** It's difficult to switch to a new client for collaborating on your existing data because you're locked into a specific vertical stack—if you're using Google Docs or Figma or Notion, you can't simply switch editors. You might be able to do a one-time data export, or access your own data through an API, but often these capabilities aren't powerful enough to truly extend your software with new tools.

**It's enticing to imagine a best-of-both-worlds alternative: a modern collaborative data platform where you store all your data in one place**, and can bring various software tools to edit that data in different ways. 

Many people have envisioned such a thing. The [SOLID](https://solidproject.org/about) project championed by Tim Berners-Lee is one example; SOLID developer Ruben Verborgh writes about a world where [apps become views](https://ruben.verborgh.org/blog/2017/12/20/paradigm-shifts-for-the-decentralized-web/#apps-become-views):

> Instead of maintaining credentials with each app, you log in through your data pod and give apps permission to read or write specific parts of your data. The Web’s ecosystem thereby evolves from bundled data+service packages into applications as interchangeable views...

The vision of [local-first software](https://www.inkandswitch.com/local-first/) put forward by Ink & Switch (where I work) also has a lot to do with this philosophy. If you control your data and it lives on your device, that gives you more power to choose your own tools, or even build custom ones.

In theory, easier data access across tools could not only promote choosing among existing editors, but also enable on-the-fly customization and creation of *new tools* that operate on your existing data. One of my favorite projects in this vein is [Webstrates](https://webstrates.net/) by Clemens Klokmose and collaborators, which imagines a *malleable substrate* where data is shared among various tools, so that users can do things like live-edit the same shared data from different editors, or even add new features on the fly from within the editor.

### The dream hasn't worked out yet

At the moment, silos seem to be winning. The typical cloud and mobile patterns seem to be going strong, and the desktop filesystem is definitely losing momentum among end-users. I've even heard stories of college students being unfamiliar with the very concept of files.

**I think the main reason that a shared data layer hasn't caught on is structural inertia**: it's difficult to innovate on data storage, because it's a platform primitive that no individual app can easily change. I agree with [Adam Wiggins's analysis](https://adamwiggins.com/making-computers-better/storage) on this problem:

> Unfortunately, [data storage and collaboration] is a difficult area to innovate on. Data storage reaches deep into the internals of a given platform (unix, the web, iOS, etc) creating a status quo that is hard to change.

It also doesn't help that cloud siloes provide a form of lock-in for apps...but I hesitate to jump to this as the primary explanation. Even apps that want to provide open data [face a difficult choice](https://x.com/geoffreylitt/status/1374144532976168967) between using the traditional open filesystem and providing a nice modern collaboration experience, because we don't yet have a widespread open data layer that provides the things users expect these days.

## Rebuilding from scratch

Phew, untangling decades of data platform inertia is exhausting, huh?

Let's try a fresh start.

Instead of starting from existing "serious software", let's start from examining the little toy experiments that people are making using AI, and extrapolate forwards from there.

### Level 1: UI Only

Starting off super simple: **We can use AI to generate just a UI—with no persistent storage and no options for collaboration.**

![](/images/article_images/llm-eup-2/just-ui.png)

This pattern describes a lot of the Claude Artifacts / Websim tools people are building right now, as well as many of my past experiments building software tools w/ AI.

**It's possible to build a lot of surprisingly useful tools even within this narrow paradigm.** Simple single-player games and simulations can work fine. Small productivity tools can work great as long as data can be transferred in/out of the tool using copy-paste or file uploads;  this was the pattern I used when building my AI-generated [Japanese text message translator app with formality slider](/2023/07/25/building-personal-tools-on-the-fly-with-llms), which supported copy-pasting text.

The simplicity of "Just a UI" is appealing on many dimensions. The lack of persistent state makes it trivial to iterate on code without worrying about past state and schema migrations. It's also relatively simple for an AI to generate frontend code without the complexity of backend server and networking logic.

"Just UI" also makes "remixing" relatively more straightforward. A key aspect of these kinds of platforms is blurring the line between being a "user" and a "programmer": if I share a Claude Artifact or a Websim app, anyone using it can trivially try adding on their own further modifications with just a text prompt. This kind of playful iteration is easy if there's no shared data and no collaboration; if you have multiple users or data from past versions, these kinds of iterations become less straightforward to manage.

Still, despite all the cool things people are managing to do within this architecture, there are some severe limitations to how far you can get with just a UI. Think of most of the apps you use today: even something as simple as a todo list requires storage at minimum, and often collaboration as well.

### Level 2: Siloed Apps

![](/images/article_images/llm-eup-2/siloed-apps.jpeg)

- level 2
	- add a DB, collaboration, "a backend"
	- eg: valtown, replit
		- show Townie
	- pros
		- you get "real apps" that can do more stuff - like a collaborative website
	- cons
		- state is complicated, ops are complicated
		- fragmented apps
		- worse than cloud saas
			- more apps! explosion of individual apps
			- AI needs shared context
	- discussion
		- i expect this will be a near-term plateau

### Level 3: Shared Data

![](/images/article_images/llm-eup-2/shared-data.jpeg)

- level 3
	- now we're back to... shared data dream!
	- common SDK for things like collaboration, history, auth
		- stop reinventing the wheel! like an FS
	- show my demo
	- self-hosting / in-place toolchain - you're editing from within the site of *use*, not from within an IDE
		- subtle, but suggests the code editor grows from an end-user  collab environment, rather than the other way around...
		- hint at "malleable software" here?
	- pros
		- local-first is
			- more local code for AI to generate
			- easier shared data across apps
		- more powerful applications
	- cons
		- harder to pull off - bigger change to the ecosystem
	- discussion
		- tweak rather than starting from scratch
		- what properties do you need from the data layer
			- what's the data shape
				- Automerge JSON
				- Riffle / LiveStorerelational
			- live reactivity!!!
				- enables rich interactions
			- version control
				- of the code
				- of the data
		- schemas / migrations
			- LLM glue can help here clearly
		- what is the SDK
		- security is tough => point to Bernie Seefeld's post


TLDR:

- easy to write off lots of the current stuff as toys/demos
- i think it's fair to be quite skeptical of generalizing to larger code
	- Link to Redis creator’s blog post on current model capabilities: good for scripting, poor for systems programming.
- but at the same time
- Disruption theory: might these apps grow more and more powerful...


Tease part 3, interactions
Newsletter subscribe

---

## meta

- [x] outline whole thing
- [x] bring in the sketchy diagrams
- [ ] prosify
	- [ ] level 1
	- [ ] level 2
	- [ ] level 3
- [ ] make better diagrams by hand
- [ ] make a call: cut interactions for later?

I made a strategic decision here:
Clarify the exact point of this note, make it smaller and sharper.


## deleted


## interactions

CUT THIS

an orthogonal axis: how do you actually get the code

- current practices: simple demos + lots of trial and error
- text chat + "don't look at code" is the current status quo
- works surprisingly well if you're in the right regime and can trivially verify
- my favorite trick: "ask me clarifying questions"
- my north star: "a good design consultancy" => show me spec docs, demos...
- playing the specification game
- other methods
	- Linus: navigating latent space, what does this look like for apps
		- tone dial
	- visual prompting, Lu
	- Tyler's branching
- lots of trad synthesis work worth looking at:
	- ReGae Glassman
	- UIST Mayer 15
- some of my ideas
	- structure the space
	- marketing webpages
	- parallel generation

## intro

- context on malleable software / end-user programming
	- history
	- Nardi EUP
	- spreadsheets are famous EUP example: unlocked financial / simple calculations / simple UI to the masses
	- but historically construction of GUIs and complex logic has been fairly bottlenecked on programming
		- no-code environments: simplified toolkits
		- research work 
			- Webstrates
			- Tchernavskij thesis
			- My own work: Wildcard, Potluck, Embark
- previous post: LLMs opening up the coding bottleneck
	- 18 months lol
	- I was busy... finished a PhD and started new job at I&S!
- Since then:
	- model capabilities advancing, lots of people using them
	- this post is_not_ about using models for heavy-duty software eng, more about lightweight tools.
		- eg: devin, copilot workspaces, even Cursor
		- i'm more interested in EUP for 2 reasons:
			- incidentally: better fit for current model capabilities
			- deeper: actually a more interesting change to the software ecosystem
- Maybe 