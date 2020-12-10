Pimp my family

An application that makes sending family support money easier than never.

Motivation

Every inmigrant in the world use some form of remittance application, so he/she/it
can support his/her family

Features
So, why not having a blockchain-powered daepp that:

- Hold a pool of specific currency, e.g. Euro.
- Allows people to ask for additional support, e.g. 120K COP for electricity bill.
- Show holding in the recipient currency & give you alerts to exchange at a higher rate.
- Consolidate expenses so you could plan in advance following weeks, months or even the whole next year.

Use of on-chain oracle for retrieving the price of the crpyto - fiat exchange rate
Smart alert for informing when highest price is reached, so transfer might be done, for example,
here is an example with Binance API:


```sh
curl https://api.binance.com/api/v3/ticker/price\?symbol\=BTCEUR
curl https://api.binance.com/api/v3/ticker/price\?symbol\=AEBTC
```

Challenges

- A price oracle that verify ONLY prices of used currencies.
- Generate more value given the existing collateral?

Ideation

- Visualize requests on local vs. foreign currency.
- Oracle for price exchange rate.
- History of previous trxs, grouped by expenses type

Implemented

- Single interface for creating ask requests. No really working from the daepp but from http://contracts.aepps.com
- Option to fund received ask requests. The call is executed but the contract status is not updated?