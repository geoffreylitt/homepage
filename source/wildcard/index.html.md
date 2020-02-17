---
layout: simple
---

# Wildcard

Wildcard is a research project as part of my PhD at MIT, with my advisor Daniel Jackson.

For more details, see the [paper](/wildcard/salon2020) being presented at Convivial Computing Salon 2020.

We plan to start inviting beta users in the next couple months. To get notified when the beta opens, [sign up for the mailing list](https://docs.google.com/forms/d/e/1FAIpQLSf8nJZ5hY0ZTB0g3WmHEpvP-p8keRzWbWRltEidTK8awsfBEw/viewform?usp=sf_link).

## The problem
Browser extensions and user scripts have shown that there are lots of useful ways to modify websites, ranging from blocking ads to adding entire new features to Gmail.

Many people have their own new ideas for modifying websites to meet their needs, but today, implementing these modifications requires programming in Javascript. If someone can't program, they have no choice but to accept the way the software was built. What if things were different?

## The Wildcard platform
Wildcard is a platform that empowers anyone to build browser extensions and modify websites to meet their own specific needs.

Wildcard shows a simplified view of the data in a web page as a familiar table view. People can directly manipulate the table to sort/filter content, add annotations, and even use spreadsheet-style formulas to pull in data from other websites. The key idea is that a table view is simple and easy to work with, but surprisingly powerful in the range of modifications it can support.

Eventually we envision a new web ecosystem where website developers expose more structured data in web clients, to support easier modification by end users. But Wildcard is also pragmatically designed to work with the existing websites of today, using adapters that map between the website and the table view.

## Demo

The video below demonstrates adding "sort by price" and Walkscore data to the Airbnb website using an early prototype of Wildcard.

<div style="position: relative; padding-bottom: 62.5%; height: 0;"><iframe src="https://www.loom.com/embed/cab62c8172404c39bebc4c511a60a389" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

Here's another demo of hiding already-read articles on Hacker News:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">new little demo of end user software customization:<br><br>- sort Hacker News by total points descending, for a more stable ranking<br>- remove the articles I&#39;ve already read <a href="https://t.co/88efJxDjDw">pic.twitter.com/88efJxDjDw</a></p>&mdash; Geoffrey Litt (@geoffreylitt) <a href="https://twitter.com/geoffreylitt/status/1229251217118892032?ref_src=twsrc%5Etfw">February 17, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

[The paper](https://www.geoffreylitt.com/wildcard/salon2020/#sec:demos) has more examples of using Wildcard to add new features and inject custom UI elements into web apps.

## More details

**Paper**: For more demos and details, read the [paper](/wildcard/salon2020) being presented at the Convivial Computing Salon 2020.

**Sign up**: We plan to start inviting beta users in the next couple months. To get notified when the beta opens, [sign up for the mailing list](https://docs.google.com/forms/d/e/1FAIpQLSf8nJZ5hY0ZTB0g3WmHEpvP-p8keRzWbWRltEidTK8awsfBEw/viewform?usp=sf_link).
