---
title: Rebotradar
summary: Webapplication that allows users to train an ai to find relevant content from continually scraped sources such as reddit.
tags:
  - Webscraping
  - Fullstack
  - Tensorflow
  - Elasticsearcch

date: "2019-01-25T00:00:00Z"
draft: false
featured: true
# Optional external URL for project (replaces project detail page).
external_link: ""
tags:
  - Docker
  - Express
  - Elasticsearch
  - Mongodb
categories:
  - Fun
  - Coding
image:
  caption: ""
  focal_point: ""
  placement: 2
  preview_only: false

links:
url_code: ""
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

## A Detailed Look at Rebot Radar’s Technical Framework

The Rebot Radar project aims to streamline the process of content discovery through intelligent automation. This technical overview will delve into the components that facilitate this functionality and the interactions users have with the system.

### Core Technologies of Rebot Radar

The application leverages several advanced technologies to power its features:

- TensorFlow Serving: Utilized for its machine learning capabilities, TensorFlow Serving manages the embedding processes for both text and images, ensuring that the content is analyzed and matched with user preferences effectively.

- MongoDB: This database is chosen for its flexibility and performance in handling varied data types. It stores information about user-created rebots and their settings, facilitating quick data retrieval and updates necessary for a dynamic experience.

- Node.js with Express: The REST API, essential for the application's operations, is built on Express, a web application framework for Node.js. This combination provides the necessary backend support for handling requests and delivering content.

- Elasticsearch: This search engine excels in performing vector similarity searches, which is pivotal for matching content with the trained user preference models. It's responsible for the retrieval of closely aligned content suggestions.

- Ionic Frontend: The user interface of the application is developed with Ionic, which enables a consistent and intuitive experience across different devices and platforms.

### Technical User Interactions with Rebot Radar

{{< figure src="rebotradar_rebots.png" id="rebotradar_rebots" >}}

Users interact with the system in a way that trains and refines the AI models:

- Rebot Creation: Users initiate the discovery process by creating new rebots with keyword terms. These terms direct the AI to relevant content sources, like Reddit.

- Interactive Training: Users provide feedback through a swiping mechanism—right for approval and left for disapproval. This feedback fine-tunes the AI’s content selection algorithms.
  {{< figure src="rebotradar_catsrebot.png" id="rebotradar_catsrebot" >}}

- Content Curation Adaptation: The system adapts to user preferences over time, enhancing the relevance of the content it curates.

- Customization of Preferences: Users can adjust the importance of image versus text similarity in content recommendations, allowing for a tailored discovery process.
  {{< figure src="rebotradar_rebotsettings.png" id="rebotradar_rebotsettings" >}}

### Objective Overview of Rebot Radar

Rebot Radar is a tool designed to assist in the discovery of online content. It’s built with a focus on adaptability and user-driven customization, using established technologies to create a platform that learns and evolves with its users. While the project employs complex systems, it strives for a seamless and user-centric experience.

This overview provides an insight into the technical structure that underpins Rebot Radar, highlighting its function as an AI-driven content discovery tool.
