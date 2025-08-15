---
layout: simple
---

# 🐞 ladybug

![](images/project_images/ladybug/ladybug-demo.gif)

ladybug is a visual debugger for Ruby web applications that uses the excellent
Chrome Dev Tools as a user interface. It aims to provide a rich web backend debugging experience in a UI that many
people are already familiar with for debugging their frontend Javascript.

To implement Ladybug, I wrote a custom debugger for Ruby
that uses the Ruby Tracepoint API to hook into the code execution,
and communicates with the browser dev tools using the [Devtools remote
debugging protocol](https://chromedevtools.github.io/devtools-protocol/) over Web Sockets.

It supports things like setting breakpoints, stepping through code,
and inspecting state. DevTools is designed only for debugging Javascript so not everything
translates perfectly to Ruby, but I did my best to map the concepts.

[See the project on Github >](https://github.com/geoffreylitt/ladybug)
