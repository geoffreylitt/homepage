---
---

# TodoMVC Vis

![](/images/project_images/todomvc-vis/timeline.gif)

This was a class project I did in Spring 2020 exploring the problem of visualizing the internal behavior of a UI at a high level of abstraction.

To gain initial traction on the problem, I tried visualizing the behavior of a TodoMVC app implemented with the Redux MVU library (similar to Elm). The key idea is that because the UI is already implemented with this architecture, it's easy to extract a "semantic" timeline view, and then augment it with little sparkline visualizations. Further, this timeline acts as a minimap for time-travel debugging.

## More info:

* [⏯ Try a live prototype](https://geoffreylitt.github.io/todomvc-vis/)
* [📄 Read a short paper about the project](/resources/todomvc-vis.pdf)

## 4 minute demo video

<div style="position: relative; padding-bottom: 74.84407484407485%; height: 0;"><iframe src="https://www.loom.com/embed/e5df0b7ba47240e3ac9f5ceb9316ec53" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>