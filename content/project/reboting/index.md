---
title: Reboting Open Data
summary: chatbot that makes austria's geographical opendata queryable via visualizations for human beings.
tags:
- Linked Data
- Geo Labelling
- Data Visualization
- Chatbot
- Dialogflow

date: "2018-04-27T00:00:00Z"

# Optional external URL for project (replaces project detail page).
external_link: ""

image:
  caption: ""
  focal_point: Smart

links:
url_code: "https://github.com/hedata/reboting"
url_pdf: ""
url_slides: ""
url_video: ""

# Slides (optional).
#   Associate this project with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides = "example-slides"` references `content/slides/example-slides.md`.
#   Otherwise, set `slides = ""`.
slides: ""
---

An interface that allows geo-queries for Austrian federal states and automatically generates visualization of respective open datasets. The geo-labelling of the dataset is based on a base knowledge graph of geo-entities.

Governmental Open Data portals such as the Austrian data.gv.at release local,
regional and national data to a variety of users. The data is collected as part
of census collections, infrastructure assessments or any other, secondary output
data; for instance, public transport data of cities, demographic indicators, etc.
Making this data accessible, searchable and analyzable to the public is vital to
foster an open government. However, geospatial information in Open Data –
as it is currently published – mainly still comes in semi-structured and tabular
formats, such as CSV or XLS  and geo-references in these tabular sources are
not encoded structuredly or homogeneously, but using mixes of region names,
country codes, or other implicit references. Therefore, these portals do not allow
any geo-semantic queries; in fact, the search functionalities are limited to the
metadata descriptions only, and hardly provide any visualizations to explore the
datasets. Herein, we present a framework to automatically generated visualizations of open datasets based on queries for geo-entities:

1. We integrate Linked Data repositories, geo-reference datasets, and geocode
standards in a hierarchical base geo-entities knowledge graph.

2. Using this knowledge graph, we label metadata and data of the Austrian
data portals and index all labelled datasets. We provide an API to search
over geo-entities, but also full-text search over the content.

3. The user interface at reboting.com offers showcase queries for Austrian geoentities and displays automatically generated visualizations for any input
dataset from the data portals.

## Approach

{{< figure src="reboting_approach.png" id="reboting_approach" >}}
