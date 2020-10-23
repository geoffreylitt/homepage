---
layout: simple
---

# Wildcard

Wildcard is a platform that empowers anyone to build browser extensions and modify websites to meet their own specific needs, using a familiar spreadsheet view. It's a research project as part of my PhD at MIT, with my advisor Daniel Jackson.

## The problem
Browser extensions and user scripts have shown that there are lots of useful ways to modify websites, ranging from blocking ads to adding entire new features to Gmail.

Many people have their own new ideas for modifying websites to meet their needs, but today, implementing these modifications requires programming in Javascript. If someone can't program, they have no choice but to accept the way the software was built. What if things were different?

## The Wildcard platform
Wildcard is a platform that empowers anyone to build browser extensions and modify websites to meet their own specific needs.

Wildcard shows a simplified view of the data in a web page as a familiar table view. People can directly manipulate the table to sort/filter content, add annotations, and even use spreadsheet-style formulas to pull in data from other websites. The key idea is that a table view is simple and easy to work with, but surprisingly powerful in the range of modifications it can support.

**Find out more**: For more details, see the [workshop paper](/wildcard/salon2020) being presented at Convivial Computing Salon 2020.

**Sign up for beta**: To get notified when the beta is available, [sign up for the mailing list](https://tinyletter.com/wildcard-extension).

## Video

Here's a 30 minute talk explaining the project:

<iframe src="https://player.vimeo.com/video/416346068" width="640" height="446" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
<p><a href="https://vimeo.com/416346068">Wildcard: Spreadsheet-Driven Customization of Web Applications</a> from <a href="https://vimeo.com/jonathoda">Jonathan Edwards</a> on <a href="https://vimeo.com">Vimeo</a>.</p>

## Demo

The video below demonstrates adding "sort by price" and Walkscore data to the Airbnb website using an early prototype of Wildcard.

<div style="position: relative; padding-bottom: 62.5%; height: 0;"><iframe src="https://www.loom.com/embed/cab62c8172404c39bebc4c511a60a389" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

Here's another demo of hiding already-read articles on Hacker News:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">new little demo of end user software customization:<br><br>- sort Hacker News by total points descending, for a more stable ranking<br>- remove the articles I&#39;ve already read <a href="https://t.co/88efJxDjDw">pic.twitter.com/88efJxDjDw</a></p>&mdash; Geoffrey Litt (@geoffreylitt) <a href="https://twitter.com/geoffreylitt/status/1229251217118892032?ref_src=twsrc%5Etfw">February 17, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

[The paper](https://www.geoffreylitt.com/wildcard/salon2020/#sec:demos) has more examples of using Wildcard to add new features and inject custom UI elements into web apps.

## Publications

[(html)](/wildcard/salon2020) [(pdf)](/wildcard/salon2020/paper.pdf) Geoffrey Litt and Daniel Jackson. 2020. Wildcard: Spreadsheet-Driven Customization of Web Applications. In Companion Proceedings of the 4th International Conference on the Art, Science, and Engineering of Programming, 10. https://doi.org/10.1145/3397537.3397541

[(pdf)](/wildcard/Wildcard-Onward-2020.pdf) Geoffrey Litt, Daniel Jackson, Tyler Millis, and Jessica Quaye. 2020. End-User Software Customization by Direct Manipulation of Tabular Data. In Proceedings of the 2020 ACM SIGPLAN International Symposium on New Ideas, New Paradigms, and Reflections on Programming and Software - Onward! 2020. https://doi.org/10.1145/3426428.3426914

## Get involved

**Sign up**: We plan to start inviting beta users in the next couple months. To get notified when the beta opens, [sign up for the mailing list](https://docs.google.com/forms/d/e/1FAIpQLSf8nJZ5hY0ZTB0g3WmHEpvP-p8keRzWbWRltEidTK8awsfBEw/viewform?usp=sf_link).

**Try the current version**: If you want to live on the edge, you can try installing the current dev build, although it's not totally feature-complete or stable. Here are the [installation instructions](https://geoffreylitt.github.io/wildcard/#/quickstart) and the [Github source](https://github.com/geoffreylitt/wildcard). [Let me know](mailto:glitt@mit.edu) if you run into problems or questions.