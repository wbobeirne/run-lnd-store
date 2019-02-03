# RUN LND Shirt Sale

This is a small side project to sell a limited edition run of some dope shirts:

![]()

This project makes no attempt to be reusable as an eCommerce platform. It was
purely made for fun, and to potentially be used by others as an example of
some interactions with an LND node on a production site.

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

### Why do message signatures for node proof and not invoices?

This proves you're not only running your node, and that you're not able to
order a bunch of shirts with one node, but that you're running LND. At the
time of writing, LND is the only node implementation with message signing.
And if you're gonna be repping a RUN LND shirt, you'd best be running LND.

### Where's your sick React / Vue / Angular frontend, bruh?

I tried to KISS on this one and stick to the basics. Though honestly I regret
it a bit. But it's good to be reminded how nice those are when you have 'em.

### Why not use the admin macaroon?

In case this server were compromied, the worst someone could do is DDOS my
node, or generate an annoyingly large number of invoices. It's great that LND
allows for you to have a site like this that only needs to accept money without
exposing your funds.
