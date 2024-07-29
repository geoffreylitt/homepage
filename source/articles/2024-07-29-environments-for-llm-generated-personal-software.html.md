---

title: Environments for LLM-generated personal software
date: 2024-07-29 14:32 UTC
tags:

---


# Draft 0

### Christensen’s Disruption Theory Applied to AI Coding Environments

#### Disruption for Coding Environments
- **Glitch, Replit, Dark, Val…**
  - All playful and limited in capability
  - Almost like Scratch in a way. Creative coding.

#### And Now Artifacts!
- Arguably undercutting all of them with an even simpler approach
- **Websim, Windows 9X, ValAI, my stuff…** is going up the curve from that starting point. Replit’s AI stuff too.
- But I wonder if we need to push even further into the simple UI?
  - To some extent it’s a bet on capabilities
  - I’m skeptical on large-scale software engineering and bullish on small-scale situated software (This rhymes with Antirez’s nuanced post)

#### LLM-generated Apps Need Infra
- They will grow to need the full infra stack.

#### Local-first is Similarly Disruptive
- Low capability right now but simpler
- Has some key adoption characteristics…

### Huge Interaction Design Questions
- What does it look like to do both directions of the feedback loop without code?
  - Up from the chatbot.
  - Link to Lude?
  - The gold standard: demos with a PM.

#### How Does Glide Fit In?
- Unclear how fast and how far this will go.

## Post Draft

### Preamble
- PDD is blowing up for small ephemeral tools.

### Thesis
- Prompt-driven development could be the start of disrupting coding. What will it take to go the distance?

### PDD = Artifacts, Websim, my stuff
- Show some demos. People are using it for end-user programming. Now you can share and remix too.

### Reminiscent of Scratch but with Very Different Goals

#### What Else is Needed to Keep Going?
- **Interaction Models**
  - Dig back to the synthesis literature, Mayer, Wrex, Smyth, Hazel
- **Infrastructure**
  - Storage, multiplayer, etc. This raises complexity in many ways - need approaches that cut through. (Local first FTW)
- **Obvious**
  - Model capabilities and context windows


---


# Draft 1

### Introduction
- Summary of the meetup organized last week.
- Focus on pushing the frontiers of AI-generated software to improve environments and interaction models.

## AI-Generated Software

### Casual and Lightweight Approach
- AI-generated software isn't confined to traditional, formal environments.
- Demos showcased user-friendly, well-situated software.
- Example: Flawed artifacts used for thinking through simulations on the fly.

### Differences from Traditional Software Engineering
- Unlike formal tools like DevIn, this new style aligns with current model capabilities.
- Example: Cloud 3.5 Sonnet can output a few hundred lines of React code with smaller context windows and simpler use cases.
- Shared past examples:
  - Translator app
  - Podcasting app made with Dan Schicker
  - Ethan’s work from MIT showcasing artifacts
- Link to Redis creator’s blog post on current model capabilities: good for scripting, poor for systems programming.

### Need for Sophistication in Infrastructure
- Importance of gradually adding sophistication to the infrastructure.
- WebSim as an example of a simulated browser for playful end-user programming.
- Valtown as another example with a playful, community-inclined vibe.
- Local-first stack benefits:
  - Easy AI app building
  - Supports collaboration with minimal fuss
  - Similar to YBB's Tailwind for styling

### Existing Apps and Data
- Starting from existing apps and tweaking them instead of building new tools from scratch.
- Example: Patchwork’s approach.

### Overall Point
- Current capabilities are limited, often seen as toys.
- Disruption argument: Models and environments will grow, potentially replacing traditional software with on-the-fly software.
- Counterpoint: Demos are simple; easier to do open-ended things than specific tasks.

## Interaction Models

### Baseline Interaction: Text Chat
- Text chat is the baseline but has limitations.
- Issues: Understanding possibility spaces and efficient communication of intent.

### Interesting Ideas
- Sigma tone dial
- Minuses using latent model features
- Tyler’s branching exploration of alternatives
- Demo of branching and speculation
- Lou’s observations on visual prompting for UI and behavior
- Mention Lou’s whiteboard demo as a different context for creating software

### Conclusion
- Potential disruption with evolving AI capabilities.
- Traditional software might be replaced by more adaptable, on-the-fly solutions.
- Highlight the importance of demos and experiments in showcasing these new possibilities.

# Previous notes on Cloud SaaS


## intro

previous post, laid out theory of AI-powered Malleable Software. basic idea: AI code gen -> everyone's a personal dev.

(i've also covered one example of what this might look like: crafting a bespoke gui app)

general theory raises more questions than answers. if we get AI personal devs, what kinds of platforms will be best positioned to take advantage? and what new platforms will win? in a sense, the Q is: what would it look like to design an OS platform around the idea that AI can generate code for anybody?

will argue that **Cloud SaaS (the dominant paradigm of our time for most sofwtare)——is a bad fit for this future!**

2 reasons:

- centralized data
- centralized code

## the history

- From Midas chapter: software went from all bespoke to standardized software packages
- part of what drove this: cost of dev was so high!
- so we got desktop software in a box...
- ...fast forward to modern day:
- these days: biz software is increasingly cloud saas
- nice things: collaborative web apps, pay as a service, no ops

## what's changing

- AI personal dev
- make new tools that work with your existing data
- tweak / extend existing tools

(maybe i need a good simple motivating example here)

why cloud saas fails:

## centralized code

- we wanna tweak the UI and add some stuff
  - luckily, web is a very open client platform
    - browser extensions are great! (link to past work)
      - a subtle thing about them: they usually "rebase" automatically
    - this is a bright spot
  - but there's a problem.... we can't change the backend.
    - this is a big problem. most serious features require new backend features, or worse, edits.
    - now you're stuck, do you:
      - mirror all the data to a new backend and add logic there
      - can't suppress existing logic
      - can't add new data validations / other features which rely on backend logic
    - if you're lucky they might provide webhooks / extension points... but that's rare.
  - even if we got access to the repo this wouldn't work -- all customers running the same shared backend! that's the fundamental problem
  - we basically want to fork a custom backend just for us, with its own minor tweaks / data schema changes

another problem: backend-frontend split makes things complicated, and complicated is hard to edit.

## centralized data

- let's say you wanna make a lil new app that can edit your existing data...
  - like an alternate project mgmt tool for github issues customized to your org

- data is siloed away
- hard to make new tools that reuse data from existing cloud apps
  - possible to schlep it with APIs, but APIs don't always exist, and are gross in any case

It woudl be SO much easier if you just owned your own single-tenant database / FS!!!

- btw: what if you wanna add a column to the data?
  - you can't, it's a multitenant system, one does not simply fork the schema
  - i guess you could store your own data...?


## what's needed

this problem analysis points out a lot of what you want/need:

- you own a copy of the data, the schema, and the code
- you can edit any at any time (at individual, team, or company scale)
- but you want to keep bringing in upstream changes too...

this suggests to me... local-first data layer with versioning

more speculatively:
