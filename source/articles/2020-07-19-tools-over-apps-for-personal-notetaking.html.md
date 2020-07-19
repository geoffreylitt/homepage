---
title: "Foam: Software as Curation"
date: 2020-07-19 15:55 UTC
tags:
summary: We tend to think of software in terms of monolithic "apps." But what if we thought about software design as a process of curating existing parts into a holistic user experience?
---

So there's a standard way that many note taking apps work these days. You choose an _app_, which includes a UI to read/write your notes, and cloud sync so you can work on your computer or your phone. Maybe you get decent offline support if you're lucky. When it inevitably comes time to move on to the next app, you have to adapt to a whole new interface. And hopefully you can export your notes and port them over in some reasonable format.

There is an enlightened crowd of Emacs users who have done everything in plaintext for decades and rave about it on Hacker News. Parts of this philosophy are appealing to me: it would be nice to just use one editor for everything, and to have notes stored in an open portable format.

But I've never been able to really get into it. I don't want to spend my whole day in an ugly terminal, and I definitely don't want to spend hours fiddling with settings. I want a well designed product with a thoughtful out-of-the-box experience and a beautiful GUI. I currently use Notion, an elegant product with great design.

When openness and design are in tension, I choose design. I'm a Mac person, not a Linux on the Desktop person. But I wish I could have both.

## Mostly air

That's why I was excited to come across this tool called [Foam](https://github.com/foambubble/foam), a Markdown note taking tool inspired by the latest darling app of the note taking world, [Roam Research](https://roamresearch.com/).

It's kind of hard to describe what Foam is. Foam definitely isn't an app. It's barely even...anything? Here's how Foam's creator describes it:

<blockquote class="quoteback" darkmode="" data-title="Foam" data-author="" cite="https://foambubble.github.io/foam/">
<p>Like the soapy suds it’s named after, <strong>Foam</strong> is mostly air.</p>

<ol>
  <li>The editing experience of <strong>Foam</strong> is powered by VS Code, enhanced by workspace settings that glue together [<a href="https://foambubble.github.io/foam/recommended-extensions" title="Recommended Extensions" target="_blank" rel="noopener">Recommended Extensions</a>] and preferences optimised for writing and navigating information.</li>
  <li>To back up, collaborate on and share your content between devices, Foam pairs well with <a href="http://github.com/" target="_blank" rel="noopener">GitHub</a>.</li>
  <li>To publish your content, you can set it up to publish to <a href="https://pages.github.com/" target="_blank" rel="noopener">GitHub Pages</a> with zero code and zero config, or to any website hosting platform like <a href="http://netlify.com/" target="_blank" rel="noopener">Netlify</a> or <a href="https://vercel.com/" target="_blank" rel="noopener">Vercel</a>.</li></ol>
<footer><cite> <a href="https://foambubble.github.io/foam/">https://foambubble.github.io/foam/</a></cite></footer>
</blockquote><script note="" src="https://cdn.jsdelivr.net/gh/Blogger-Peer-Review/quotebacks@1/quoteback.js"></script>

The install process is easy. You just create a git repo from a template, open it in VS Code, and then your VS Code essentially transforms into a new piece of software, with different visual design and all sorts of new features!

![](article_images/foam-navigation-demo.gif)

This all piggybacks on a couple key features of the VS Code text editor:

- a well-designed extension architecture and thriving ecosystem of extensions
- the ability to specify a set of recommended extensions to install via a file
- deeply customizing a ton of editor settings via a `settings.json` file

While Foam does install its own extension, most of the value comes from installing [other existing extensions](https://foambubble.github.io/foam/recommended-extensions) and choosing good default settings. For example, it installs a few extensions that provide a nicer Markdown writing experience, and that tweak lots of things about how Markdown docs link to each other. And it picks a color theme well suited to writing Markdown. I would have never come across this whole configuration on my own, but I'm glad that someone else figured it out for me.

The user experience still isn't nearly as polished as a highly integrated tool like Notion. But it's clear that someone at least thought about how all the pieces fit together into a cohesive whole. It feels closer to a product than a random bag of parts.

I think this is a neat way of creating value in software. **The essential value of Foam isn't code—it's the opinionated curation of existing building blocks.**

## Software as curation

I've previously pointed out that with a powerful enough extension system, end users can kind of start building their own software:

<blockquote class="quoteback" darkmode="" data-title="Browser%20extensions%20are%20underrated%3A%20the%20promise%20of%20hackable%20software" data-author="Geoffrey Litt" cite="https://www.geoffreylitt.com/2019/07/29/browser-extensions.html">
By installing four different Gmail extensions that modify everything from the visual design to the core functionality, in some sense, I’ve put together my own email client. <strong>Instead of being a passive user of pre-built applications, I can start assembling my own personalized way of using my computer.</strong>
<footer>Geoffrey Litt<cite> <a href="https://www.geoffreylitt.com/2019/07/29/browser-extensions.html">https://www.geoffreylitt.com/2019/07/29/browser-extensions.html</a></cite></footer>
</blockquote><script note="" src="https://cdn.jsdelivr.net/gh/Blogger-Peer-Review/quotebacks@1/quoteback.js"></script>

The trouble is, this is a lot of work, and the type of thing that many users (including myself!) try to avoid. Saving people the initial effort and giving them a starting point can be really helpful.

Maybe one view on this is that most software is like a restaurant: you pay for the final end product. **But Foam is more like a recipe than a final dish.** A recipe tells you a good combination of ingredients, and you get to make the food yourself, substituting ingredients to your liking along the way. We all realize recipes are valuable. It's easier to cook from a recipe than to make up a dish from scratch, even if you end up making tweaks.

Also, there's a role in the world for both restaurants and home cooking! I'm not saying that all restaurants are bad or that all software needs to be built like this. Just that it's nice to have some software where the end user plays a larger role in the final assembly:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">2/ Yes, the restaurant food is truly &quot;better&quot; in many ways, and there&#39;s a role for restaurants in society...<br><br>But I wouldn&#39;t want to live in a world where no one cooks, and food is something we can only choose off a menu.<br><br>Software is increasingly heading to that place.</p>&mdash; Geoffrey Litt (@geoffreylitt) <a href="https://twitter.com/geoffreylitt/status/1177607450863767553?ref_src=twsrc%5Etfw">September 27, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

By the way, one funny thing is that a lot of software is actually built like this under the hood. Engineers don't make things from scratch these days, they find libraries and assemble them into products where the seams are hidden from the user. In the Foam model, the modules are exposed—giving me the power to open the hood and disable or replace individual parts.

## Tools, not apps

I don't know yet if I'm going to actually move my note taking into Foam, but I'm giving it a shot. It has a lot going for it:

1. **Generic editor**: I get to use VSCode, which is my main text editor for coding. I can reap investment from learning that generic tool, rather than needing to use yet another text editing UI. The consistency matters for muscle memory.
2. **Customizable**: Even though the tool comes with curated extensions and settings, I can still change things. I changed the default typeface, and I removed the graph viewing extension because I didn't feel the need for it. So many note taking apps would be better if you could remove features... (looking at you, Evernote!)
3. **Local data storage**: It's so nice to be confident in offline mode. Every cloud notes app I've used has lost data at some point when I came back online.
4. **Open format**: Foam seems to try very hard to store everything in vanilla Markdown with minimal extensions, which feels like a solid foundation for a long term notes collection. I'm confident I could move to another tool and actually preserve the structure of my notes.

## Challenges and questions...

**Lowest common denominator formats**: The fundamental bargain of open formats is that you gain interop and portability, and you lose the ability to innovate. This is why note taking tools often offer limited _one-time export_ into other formats, but usually have their own proprietary format as a source of truth. Is there any way around this dilemma?

This summer I'm working with Ink and Switch on [a project about decentralized schema evolution](https://inkandswitch.github.io/cambria/) that hopes to make some headway on allowing tools to collaborate with each other, even if they use different data formats.

**Multi-device / collaborative editing**: One of the main barriers to a "tools, not apps" approach right now is that files are a bad abstraction for editing across multiple devices, especially collaborative realtime editing. It makes sense that services like Notion build their own collaborative text editing tech and clearly can't rely on the filesystem. If we had [better infrastructure for local-first software](https://www.inkandswitch.com/local-first.html), perhaps it could help usher in a new world of open tools, built on a more modern abstraction than files?

**Beyond text editing?**: Text editing seems like the ideal use case for this whole philosophy of generic open tools. Text is one of the more portable formats out there. Text files are small and can easily be stored on your computer. What are other domains where we could use more generic tools?

**Business model:** Foam is a free product. If I was willing to pay for Foam, I'd want to pay the creators of the open source extensions behind it, not just the person who combined them into a product. And yet, I think the curation step is creating a lot of the value here too, and don't want to undervalue it.

This seems like the deepest problem to solve in this area. It's hard to sell a product that's "mostly air." If we want more software like this, we probably need to figure out how people can be compensated for their curation work.

## Related reading

From me:

- [Wildcard: Spreadsheet-Driven Customization of Web Applications](https://www.geoffreylitt.com/wildcard/)
- [Browser extensions are underrated: the promise of hackable software](/2019/07/29/browser-extensions.html)

From others:

- [The future of software, the end of apps, and why UX designers should care about type theory](https://pchiusano.github.io/2013-05-22/future-of-software.html): a wonderful take by Paul Chiusano on moving beyond apps
- [User-Tailorable Systems: Pressing the Issues with Buttons](https://www.researchgate.net/publication/221515740_User-tailorable_systems_Pressing_the_issues_with_buttons/link/5721020f08ae5454b230fbec/download): one of my favorite reads on end-user customization of software (from 1990!), describes the role of a "handyman" who helps people customize software; perhaps similarly to this "curator" role
