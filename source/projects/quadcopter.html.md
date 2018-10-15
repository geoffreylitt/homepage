---
layout: simple
---

# Autonomous quadcopter

As an independent undergrad project in Electrical Engineering (along with one fellow EECS student), I built a quadcopter that could stably fly alongside a wall.

![](/images/project_images/quadcopter/device.jpg)

**Hardware**: We mounted a sonar sensor actuated by a servo, an Arduino microcontroller, and an Xbee wireless communciations device onto an off-the-shelf Parrot quadcopter.

**Software**: We used the rotating sonar to gather distance measurements from around the quadcopter and sent them wirelessly to a laptop. We wrote control algorithms running on the laptop which processed the distance measurements and sent back control data to the drone.

Managing the weight of the hardware was a major challenge. We used foamcore
as a mounting material to save weight.

We were able to get the quadcopter flying alongside the wall fairly reliably.
With more time, we would have liked to explore more advanced
obstacle avoidance tasks, as well as computer vision-based approaches.

For more details, see the [PDF writeup](/resources/quadcopter-report.pdf).
