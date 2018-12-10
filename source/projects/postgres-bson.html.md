---
layout: simple
---

# Postgres BSON

In a databases class at Yale with Prof. Daniel Abadi, as a final project together with two other students, I modified the PostgreSQL database to support a binary encoding storage format for JSON documents, replacing the text storage format that was the only option at the time.

We experimentally demonstrated up to 8x speedups for queries on JSON documents, and the PostgreSQL team later adopted a similar binary encoding into the official project.

![](images/project_images/postgres-bson/results.png)

## Abstract

NoSQL database systems have recently been gaining in popularity. These databases provide schema flexibility compared to traditional relational databases like PostgreSQL, but consequently give up certain desirable features such as ACID guarantees.

One compromise is to store schemaless documents within a relational database architecture which PostgreSQL has recently made possible by adding native support for JSON (JavaScript Object Notation), a common format for multi-level key-value documents.

Currently, PostgreSQL provides validation of JSON documents upon input and native operators for querying operators within a JSON document. However, it stores JSON documents internally as text, which is inefficient for many use cases. In this paper, we implement support for BSON (Binary JSON), a lightweight binary encoding format for JSON-like documents which enables fast traversals. We observe that using BSON to store documents increases performance by two to eight times when querying keys within documents, without compromising document insertion times.

## Full paper

For more details, see the [PDF writeup](/resources/Postgres-BSON.pdf).
