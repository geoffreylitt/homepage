---

title: Bring Your Own Client
date: 2021-03-05 02:00 UTC
tags:
summary: Just a little note about the main problem I'm pondering these days...
starred: true

---

It's delightful to have the freedom to **Bring Your Own Client (BYOC)**: to choose your favorite application to interact with some data.

For example, I can program with Sublime Text, while my teammate uses vim, and we don't need to fight to the death to pick one editor between us. There are dozens of text editors to choose from, and no lock-in from proprietary file formats.

Contrast this with Google Docs: in order to live collaborate with each other, we all need to use the same editor. For someone who spends their whole working day in Google Docs, this can be a serious limitation. I personally hate doing substantial writing in Google Docs.

In cloud apps, the live collaboration logic is usually coupled to a specific editor; even if Google wanted to expose an API for editing Google Docs in third-party editors, it would probably be very challenging. The situation is nicer with text editors and git, because editing is decoupled from collaboration logic. Our team only needs to agree on a version control solution, which exposes a simple API (local text files) that many editors can interact with.

To be fair, local vs cloud isn't the only factor here—even in local software, collaborators are often forced to converge on a single proprietary client (Microsoft Office, Adobe suite); conversely, a cloud service can support a third-party client ecosystem with the right APIs and attitude. Still, cloud apps exacerbate the problem. With local files, there's some default openness built in; even proprietary file formats can be reverse-engineered. With cloud apps, the default is a single official client, unless the service actively exposes an API (and doesn't shut it down—looking at you, Twitter).

It seems like local-first software is a good foundation for promoting Bring Your Own Client more broadly. What would it look like to have a thriving ecosystem of third-party clients for Google Docs style word processing, which can all interoperate with each other, even supporting realtime collaboration?

## Concrete examples

Some successful existing examples of client ecosystems built around open standards:

* text editors / IDE
* RSS readers
* email clients
* web browsers

Places where I want to have BYOC:

* Google Docs. I wish I could write this very doc in my preferred editor, locally, but have also support for inline comments and live collaboration. Might it be possible to build a VSCode extension that edits Google Docs live? (Tricky, because Google doesn't have a nice API to integrate with, but maybe doable)
* Google Slides
* Figma
* Notion
* Trello / Asana / shared todo lists
* multiplayer code editor: live collaboration as in repl.it

## Finer granularity

Today we generally think about BYOC at the "app" level. But can we go finer-grained than that, picking individual interface elements?

Instead of needing to pick a single email client, can I compose my favorite email client out of an inbox, a compose window, and a spam filter?

## Problems / questions

* **Schema compatibility**: do all the editors need to agree on a single rigidly specified format? If there are reconcilable differences between formats, can we build "live converters" that convert between them on every change? (Essentially, imagine collaborating between Pages and Microsoft Word, running a file export in both directions on every keystroke from either app) This problem is closely related to the problem of schema versioning within a single editor, but BYOC can complicate things much further.
* **Preserving intent**: the decoupling of git + text editors has a downside: the text format fails to capture the intent of edits, so git can't be very smart about merging conflicts. Is this something fundamental to decoupling editors from collaboration? Or are there ways to design APIs that preserve intent better, while also supporting an open client ecosystem? (It seems like deciding on how you store your data in a CRDT is the key question here?)
* **Additional editor-specific metadata**: Some editors need to store additional data that isn't part of the "core data model." Eg, Sublime Text stores my `.sublime-workspace` file alongside the code source. How does this work smoothly without polluting the data being used by other editors?
* **Code distribution**: Traditionally code distribution happens through centralized means, but could code be distributed in a decentralized way alongside documents? If we're collaborating together in a doc, can I directly share a little editor widget/tool that I'm using, without needing to send you a Github link? This might be overcomplicating things / orthogonal to the general idea here... (This idea inspired by [Webstrates](https://webstrates.net/), linked below)
* **Innovation**: Unfortunately stable open formats can limit product innovation—eg, email clients are tied down by adherence to the email standard. Can we mitigate that effect? I think web browsers have struck a good balance between progress and openness, despite frustrations in both directions.

## Addendum: FAQ

*Edited 2020-03-05: This post unexpectedly got popular on HN. As I drink my morning coffee, I'll briefly respond to a few themes from the comments here.*

**Q: Don't standards make it harder to innovate?**

A: Yes, that's a major challenge. For example, email and IRC have lagged behind Slack and Reddit, because it's hard to change standards. We discussed this problem a bit in the [Cambria paper, re: Mastodon](https://www.inkandswitch.com/cambria.html#mastodon-protocol-evolution).

I think the key is to aim for more flexible and extensible standards: a useful 80% compatibility, rather than a perfect 100%.

Of course, once you abandon an exact standard, it's easy to rack up tons of complexity. (I think the Semantic Web struggled with this problem trying to provide schema flexibility.) So we also need better tools to make partial compatibility easy to reason about, for both developers and users.

**Q: Hmm. 80% compatibility sounds like kind of a buggy mess? Word and OpenOffice don't interop very well.**

A: I think with the right foundational tech for helping devs build maximally compatible formats, we can avoid the worst problems of incorrect format conversions. In the Cambria paper we sketched [a few examples](https://www.inkandswitch.com/cambria.html#lenses-in-action) of partial compatibility, where Cambria guaranteed type safety and helped us easily avoid bugs.

That does leave a substantial design problem, though: even if everything works correctly, what do you show the _user_ when two pieces of software aren't fully compatible? How do you tell a user that their actions might show up differently for collaborators using different apps? I'm thinking a lot about these questions...

**Q: Cloud business models are so entrenched. Can this actually happen without government intervention?**

A:  It's true that business incentives are a major challenge. Maybe some form of government intervention could help, but ultimately it'll be fighting a headwind unless users and devs are excited for the change.

I think the most sustainable way to make progress is to make BYOC the most convenient option, for the typical user and the typical developer. On the desktop, it's convenient for a developer to work with the user's existing filesystem. On the web today, there's no user-controlled filesystem, so it's usually easiest to just put the data in a database, and add a ticket to the backlog for someday building a public-facing API. How would that change if we had a convenient user-controlled place to put data?

See the [local-first software](https://www.inkandswitch.com/local-first.html) article by Ink & Switch for some ideas on how new data architectures can make the right thing the easy thing, for both users and devs.

## Prior Art

* [Webstrates](https://webstrates.net/) has some great demos of this philosophy. It uses a centralized server for the live sync.
* Webstrates descends from Michel Beaudouin-Lafon's work on [instrumental interfaces](https://youtu.be/ntaudUum06E?t=727)—"polymorphic" tools that can operate in different applications. For example, a color picker that I can use in any app.
* The [SOLID](https://solidproject.org/) decentralized web project has some closely related ideas: ["apps become views"](https://ruben.verborgh.org/blog/2017/12/20/paradigm-shifts-for-the-decentralized-web/#apps-become-views), creating a competitive marketplace of clients decoupled from data silos. In turn it's heavily inspired by ideas from the Semantic Web.
* [Google Wave](https://mashable.com/2009/05/28/google-wave-guide/) had some related ideas... A platform for realtime collaboration, with a rich open [extension API](https://youtu.be/v_UyVmITiYQ?t=4207) intended for people to build various collaboration clients on top of. Seems like the common wisdom on why it failed is that it was [too complicated](https://gizmodo.com/what-in-the-hell-was-google-wave-trying-to-be-anyway-1835038967) and tried to do too much.
* [Braid](https://braid.news/) is exploring ways to extend HTTP to support collaborative editing across diverse clients.

## Related Posts

- I believe one piece of the puzzle here is declarative schema mapping, for example the [Cambria](https://www.inkandswitch.com/cambria.html) project I worked on recently.
- Granular BYOC starts to look like [software as curation](/2020/07/19/tools-over-apps-for-personal-notetaking.html): assembling software out of smaller "extensions"
- Also relates to document-centric computing ideas like OpenDoc. Some [recent notes](https://twitter.com/geoffreylitt/status/1362779218241855494) I took on why that failed...
- Part of the solution may involve extracting and synchronizing data from cloud services without going through official APIs, as demonstrated in my [Wildcard](/wildcard) project.

## I'm working on this!

I'm currently pursuing a PhD at MIT doing research on this topic. Lots of challenges and open questions ahead, but I have some ideas for how to make progress. I'm particularly excited about clever ways to incrementally nudge us from the status quo to a BYOC world, rather than reinventing everything.

If you want to follow along with future updates, you can subscribe via the links below.

And if you have ideas about this topic or want to chat, feel free to [get in touch](mailto:gklitt@gmail.com).

## PS: idea incubation

I actually wrote this note 10 months ago and had totally forgotten about it.

An hour ago, I randomly came across it and was quite amused. It includes some ideas which I _thought_ I had started thinking about only recently. But it turns out they've been incubating in my mind for a long time. Funny how that works!