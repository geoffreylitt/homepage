---
layout: simple
---

# Efficiently scanning an object with a low-cost laser ranger

As my senior thesis with Prof. Roman Kuc at Yale, I wrote an algorithm for efficiently using a laser scanner to determine the position and orientation of an object with a known shape.

The key insight was that if we already know the shape of an object and just need to figure out its orientation (e.g. for manipulating a box on an assembly line), we can determine orientation with an order of magnitude fewer scan points than a brute force approach. This could make it possible to use low-cost, relatively slow laser scanners for these tasks, rather than more expensive LIDAR sensors.

My algorithm took a two-stage approach, starting with a broad scan of an object to determine its rough position, followed by more detailed scans along the edges and corners to increase precision.

This image compares the brute force result (which scanned 625 points) to the result using my algorithm, which required only 47:

![](images/project_images/laser-scanner/comparison.gif)

The sensing hardware, a low-cost laser ranger mounted on a pan-tilt mechanism:

![](images/project_images/laser-scanner/hardware.jpg)
