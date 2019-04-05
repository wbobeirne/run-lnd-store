# RUN LND Shirt Sale

This is a small side project to sell a limited edition run of some dope shirts.

![]()

This project makes no attempt to be reusable as an eCommerce platform, nor as a
gold standard of code quality. It was purely made for fun, and to potentially
be used by others as an example of some interactions with an LND node on a
production site.

## Development

You need to have `node >= 8` installed, an LND node with the GRPC API enabled
and exposed, and a PostgreSQL database running.

* Run `yarn` to install dependencies
* Run `cp .env.example .env` and configure the environemnt variables
* Run `yarn dev` to have nodemon run and watch for changes

Changes to `.ts` files will automatically restart your server.

## Deployment

This repo was intended to run on Heroku, but could be run anywhere.

* Run `yarn build` to build compiled production code & assets
* Run `yarn start` to run said code

## FAQ

### Why use message signatures for proof-of-node and not invoices?

A signed message not only proves that you're running you're node, but that
you're running LND. At the time of writing, LND is the only node implementation
with message signing, so it was a good proxy for ensuring that the node was an
LND node, and not another implementation. And if you're gonna be repping a RUN
LND shirt, you'd best be running LND.

### Why not use the admin macaroon?

In case the server were compromied, the worst someone could do without the
admin macaroon is DDOS your node, or generate an annoyingly large number of
invoices. It's great that LND allows for you to have a site like this that
only needs to accept money without exposing your funds.


## Shoutouts

* To [Lightning Labs](https://github.com/lightninglabs) and all of the contributors on LND, it's a mighty fine piece of software
* To the folks at [Radar ION](https://ion.radar.tech) for writing a [damn good typed RPC library](https://github.com/RadarTech/lnrpc) for LND
* To [@jamesob](https://github.com/jamesob) and [@mikeob](https://github.com/mikeob) for helping test and catching some bugs