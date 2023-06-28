# Welcome to the collab.io server project 👋

**To learn more about the collab.io make sure to check out
[its documentation](https://github.com/MaxSquared-WebCraft/collab.io) first!**

This repository contains the server part of our collab.io project.

## Providing a backend for collab.io 🤝

This server is the backend for the collab.io project. It provides some endpoints for user
management, room CRUD and also web socket connections. It is the central communication hub
for all in and outgoing websocket connections. It also makes sure that all websocket
connections are authorized. The main feat of this server is that it can divide different
websocket connections into multiple rooms so multiple sessions can go on at once without
interfering.

## Technology ⚙️

In order to try out nodejs as a decent server solution we opted to try typedi which is a
dependency injection solution. The main technology inspiration was provided by typestack
which makes writing a server feel a lot like writing a webserver in C#/Java but with
JavaScript/Typescript.

To easily being able to write controllers we opted for the package routing-controllers
which lets you write controllers via annotations. This is also included in the typestack
technology stack. Again, this makes it feel a lot like writing a Java Spring server for
example. It's a great convenience layer.

As a database we simply chose to use mysql and for the websocket solution we used
socket.io for simplicity reasons. The main focus was to focus on the frontend and on how
the realtime data streams are processed and handled on the frontend.

If you want to read the full writeup paper of our submission you can do that
[here](https://github.com/MaxSquared-WebCraft/collab.io/blob/main/docs/collab-io-documentation.pdf).
