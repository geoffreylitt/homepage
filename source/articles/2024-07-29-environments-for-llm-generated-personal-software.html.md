---

title: "Malleable software in the age of LLMs, Part 2: Shared Data"
date: 2024-07-29 14:32 UTC
summary: "As LLMs open up the coding bottleneck, we may see increasing incentives towards a shared data layer across applications."
tags:

---

## intro

- hook
- image!
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

## The dream of shared data across applications

History: FS, cloud silos

The dream
	- SOLID, Verborgh
	- Webstrates
	- Wildcard demo, Riffle demo => live interop

Link to BYOC

Mostly, it hasn't caught on.

- Status quo: cloud silos fragmented by media type
- Think: Figma, Google Docs, Notion, TLDraw... each their own sync stack
- APIs sometimes yes, but that's a weak abstraction. Too bespoke, too 

(Caveat: maybe in enterprise world things are better? But I kinda doubt it)

Thesis: cost of creating new tools heavily affects the benefit of shared data!

Now... let's build up to shared data from the current state of things...

## 3 levels of data infrastructure

In this section I'll present a simple framework for thinking about 

- 3 level model
	- what i view as increasingly powerful approaches to data infra for ai-generated software
	- not nec "better" / "worse", but appropriate for diff contexts... altho i'm biased, working on L3 :)

![](/images/article_images/llm-eup-2/3-levels.jpeg)

### Level 1: UI Only

![](/images/article_images/llm-eup-2/just-ui.png)

- level 1
	- make UI-only app, share and remix
	- no state or collab
	- eg:
		- claude artifacts -> mollick
		- websim -> find some examples
		- my translator app, json app, podcast app
	- pros
		- great for toys
		- easy ops
		- simple for AI to generate, all local
	- cons
		- limits to what you can do
	- discussion
		- often see people "externalizing" the state - clipboard, file import/export, etc
		- interesting phenomenon: incorporating user-specific context directly into the code. still modifiable because anyone can remix the code. kinda "currying"

### Level 2: Siloed Apps

![](/images/article_images/llm-eup-2/siloed-apps.jpeg)

- level 2
	- add a DB, collaboration, "a backend"
	- eg: valtown, replit
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
	- intro: SOLID, Verborgh post
		- maybe the time has come for this
			- we need shared data more than ever
			- the coding bottleneck is opening up "BYOC" -> lower cost to make new clients incentivizes the shared data layer
	- shared data is the dream
		- show Wildcard / Riffle demo?
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
