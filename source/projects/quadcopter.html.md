---
layout: simple
---

# Autonomous Quadcopter

As an independent research project together with another student advised by Prof. Roman Kuc at Yale, I built a wall-following system for a quadcopter drone. The project involved mounting a lightweight rotating sonar and enabling it to wirelessly communicate with a computer running realtime algorithms that interpreted the raw sensor data and controlled the drone.

The drone was able to successfully fly at a close distance along a wall without colliding with it, demonstrating the viability of sonar as a sensing platform for a drone.

![](/images/project_images/quadcopter/device.jpg)

**Hardware**: We mounted a sonar sensor actuated by a servo, an Arduino microcontroller, and an Xbee wireless communciations device onto an off-the-shelf Parrot quadcopter.

**Software**: We used the rotating sonar to gather distance measurements from around the quadcopter and sent them wirelessly to a laptop. We wrote control algorithms running on the laptop which processed the distance measurements and sent back control data to the drone.

We were able to get the quadcopter flying alongside the wall fairly reliably.
With more time, we would have liked to explore more advanced
obstacle avoidance tasks, as well as computer vision-based approaches.

For more details, see the [PDF writeup](/resources/quadcopter-report.pdf).
