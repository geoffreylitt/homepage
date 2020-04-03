---
layout: simple
---

# JSON Sheets

In fall 2019 I made some prototypes of a live programming environment
called JSON Sheets. At this point it's still just an 🚧 early draft 🚧, but I plan to
return to it at some point to develop it further.

You can see the (very prototype-y) [ code on Github](https://github.com/geoffreylitt/json-sheets).

## v1: jq-sheets

Often, programming requires tedious manipulation of data structures, like "loop over each element in this list, and extract this deeply nested key."

Language features can help here, especially idioms from functional programming. But I think another part of the solution is having an environment where you can _see_ the data as you transform it, so you're not working blindfolded.

The original idea for this project was to make a live programming environment around [jq](https://stedolan.github.io/jq/manual/), which is a nice language for manipulating JSON data.

In the demo video below, I'm taking a list of git commits from the Github API, getting the author for each commit, getting the API endpoint for querying their followers, issuing web requests to those URLs to fetch the list of followers, and then getting the usernames of the author's followers.

<video playsinline controls="controls" src="/images/project_images/json-sheets/jq-sheets.mp4"></video>

Each column contains an array of JSON data. At the top of the column, the user can enter a formula that transforms the previous column's data. Just like in a spreadsheet, you can see each intermediate stage of your data transformation in a separate column.

There are two options for the formula language:

1. jq, a concise DSL for manipulating JSON collections. The expression operates on the entire JSON collection all at once.
2. Javascript, for general-purpose programming. Currently, the runtime iterates over the top-level array and runs the provided code snippet once per element. This makes it easy to run code once per object, eg in the demo, doing an HTTP request for each URL, without needing to write your own map function.

There's so much more that could be done on top of this starting point; a few ideas:

* There should be autocomplete for field names in the formula editor, and the ability to directly click on fields in the data to use them in a formula, like clicking on cells in a spreadsheet
* Currently the formula editor just errors out on partial formulas that aren't syntactically valid. This needs to be improved for a smoother live programming experience, to guide users towards a correct full formula
* Because there are no grid rows, it's a bit hard to tell which objects on the left correspond to which objects in the downstream output on the right. This could be solved with better visual cues.
* jq is nice, but I want to try designing a language that can take better advantage of the visual environment (just as a spreadsheet formula language is co-designed with the spreadsheet editor)

## v2: GUI-Sheets

Eventually the project <del>spiraled out of control</del> morphed into something quite different: a live programming environment for building GUI applications in a pure functional style.

Here's a 10 minute demo of TodoMVC built in this environment:

<div style="position: relative; padding-bottom: 55.13016845329249%; height: 0;"><iframe src="https://www.loom.com/embed/5833f7006f30495ea83584aa3c57c435" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

The main ideas:

* Make your UI a pure function of your data
* Use a spreadsheet-style reactive interface to build up the function `data -> UI`. The "formula" for each cell is written in Javascript, and can output either data (as vanilla JS data) or UI (using JSX templating). Cells can reference other cells and updates propagate automatically.
* To handle state updates, there's one special spreadsheet cell that exposes an append-only event stream of all the DOM events happening in the UI. All other cells derive their state from this cell. (Related to the Elm architecture / event sourcing. Also thanks to Steve Krouse for inspiration here.)

Some future areas of work:

* Visualizing event stream manipulations: Those complicated reduce functions in Javascript aren’t easy to write or read. I think 1) a cleaner DSL that can pattern match on event types, 2) more visualization of what the reduce is doing to the stream would help.
* Visualizing dependencies: In a normal spreadsheet, you can see much of the data you care about all at once. But in JSON Sheets, there’s so much nested data that most of it is hidden from you. I find that this makes it difficult to intuit how dependencies are working (eg “when I update this cell, what else is updating?”) Since we have the explicit dependency graph available, I’d like to explore lots of options for surfacing the dependencies. A couple basic ideas:
  * When a cell updates, its child cells briefly flash to indicate they updated
  * When editing a cell, the right-hand cell list prioritizes showing you the parents and children of the cell you’re editing
* Performance: Currently the implementation is incredibly naive. At the least it needs to use the classic spreadsheet dependency update algorithm to work faster. Also probably need to compact the event stream? Most likely can't keep reducing over the whole stream forever.

## v3 and beyond?

At this point, jq-sheets and GUI-sheets are basically independent ideas.

I think GUI-sheets seems more interesting to explore further --
pure data transformation pipelines are well-trodden ground, but
building interactive UIs in a spreadsheet is murkier territory.

[Let me know](mailto:gklitt@gmail.com) if you have ideas about this.
