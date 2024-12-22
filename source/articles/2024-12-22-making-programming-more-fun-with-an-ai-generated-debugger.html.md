---

title: AI-generated debug views make coding more fun
date: 2024-12-22 14:05 UTC
tags: 

---

Recently, I was hacking on a Prolog interpreter as a learning project. [Prolog](https://en.wikipedia.org/wiki/Prolog) is a logic language that lets you define facts and rules, and then answer queries about those facts. And a basic interpreter for this language turns out to be an elegant little program with surprising power. Exactly the kind of thing that's fun to hack on!

The trouble is: it's also a bit finicky to get right. Early on, I encountered some bugs in my implementation of a key step called [_unification_](https://en.wikipedia.org/wiki/Unification_(computer_science))—solving symbolic equations—which was leading to weird behavior downstream. My learning project was becoming less fun; motivation was fading ☹️.

I decided what I needed was a tool that would help me understand what was actually going on in my interpreter—something that would give me *better visibility*. **So I used [Claude Artifacts](https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them) to quickly whip up a custom debugger UI which would visualize execution traces of my interpreter running on a sample program:**

<video autoplay loop controls="controls" preload="auto" muted="muted" data-video="0" type="video/mp4" src="/images/article_images/debugger/demo.mp4" width="100%"></video>

In this UI, I can step through an execution and see a nice visualization of my interpreter's internal state: how it has broken down goals, which rule it's currently evaluating, how it has assigned variables, and when it's found a solution. And don't forget the most important feature: a black-and-green hacker design 😎.

With this debug view in hand, progress on my code became smoother. Instead of poring over terminal output, I could enjoy a custom-made visualization. I caught a couple bugs immediately just by being able to see variable assignments more clearly. A repeating pattern of solutions in the timeline view led me to discover an infinite loop bug.

**Above all: I started having fun again!** I was still getting stuck, but it felt like I was getting stuck in *interesting* ways on essential issues, and not in dumb ways due to lack of visibility. And the visual aesthetic of the debugger made debugging feel like a puzzle game rather than a depressing slog. Maybe if this had been a Serious Work Project that wouldn't have made a big difference, but when hacking on a learning project in the evening after a long day, motivation is critical.

In this post I'll briefly share how the tool came together and evolved, how it made me think differently about custom dev tools, and how you might apply this pattern in your own programming work.

## Reflecting

### Malleable Software
- Evolutionary development process:
  - Started with basic visualization
  - Added layout improvements for substitution findings
  - Implemented commenting features
  - Developed timeline view with navigation
- Adapting tools at the speed of thought
- Zero friction between need and implementation
- [Link: Malleable Software essay]
- link: translator app
- AI advantage: Custom tool creation from simple examples
  - Created debugger from single trace sample
  - Interpreter-specific customization

#### Other examples

- Synctex debugger: https://x.com/geoffreylitt/status/1821666220644683950
- ambient visibility: https://x.com/geoffreylitt/status/1455915933940260871
- todo debug: https://x.com/geoffreylitt/status/1260641012415946754

### Single-Player to Collaborative
- Need for persistence and sharing
- Moving beyond Claude Artifacts
- Implementation in Patchwork runtime (Ink & Switch)
- Benefits of lightweight infrastructure
  - Trace sharing with colleagues
  - Note-taking capabilities
  - Bug documentation storage



### Making Development More Enjoyable
- Countering the "AI will take the fun parts" narrative
- Learning exercise - deliberately keeping core implementation human-made
- Using AI to enhance the development experience
- Value beyond pure utility - making short projects more engaging
- Moldable viewers / Smalltalk heritage => the "right way" to do this
- There is a twinge of regret that I didn't get to shave the yak, but it's ok, time is limited.



## Conclusion
AI as an enabler for custom tooling that enhances our development process


## cutting room

```prolog
// Define some facts
parent(alice, bob) // Alice is bob's parent
parent(bob, carol) // bob is carol's parent
parent(carol, dan) // carol is dan's parent

// Define a rule
// X is Y's grandparent if: X is parent of some Z, and that Z is the parent of Y
grandparent(X, Y) :- parent(X, Z), parent(Z, Y)

// Run a query: who is who's grandparent?
?- grandparent(X, Y)

// X = alice, Y = carol
```