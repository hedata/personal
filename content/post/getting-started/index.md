---
title: Backtesting Day Trading strategies with QuantConnect Lean CLI
subtitle: Having some holiday time taking the new QuantConnect Lean CLI for a
  spin and see how easy it is to get it up and running and backtest an easy day trading
  strategy.
date: 2021-07-13T00:09:04.225Z
summary: Having some holiday time taking the new QuantConnect Lean CLI for a
  spin and see how easy it is to get it up and running and backtest an easy day trading
  strategy.
draft: true
featured: false
authors:
  - admin
lastmod: 2021-07-13T00:00:00Z
tags:
  - Algorithmic Trading
  - Python
  - QuantConnect
categories:
  - Fun
  - Coding
projects: []
image:
  caption: ""
  focal_point: ""
  placement: 2
  preview_only: false
---

## QuantConnect Lean CLI
Recently i read a lot about trading and day trading in particular.
To test wether any of the strategies advertised on youtube is any good i will 
implement and backtest a strategy advertised in [this video](https://www.youtube.com/watch?v=eynxyoKgpng&list=WL&index=4).

For strategy implementation and backtesting i will use [The Lean CLI](https://github.com/QuantConnect/lean-cli).
[The Lean CLI](https://github.com/QuantConnect/lean-cli) is a cross-platform CLI aimed at making it easier to develop with the LEAN engine locally and in the cloud.


Ok now onto the creation of the strategy. 
Basically all strategies have the following steps

* Universe Selection - Select your assets.
* Alpha Creation - Generate trading signals.
* Portfolio Construction - Determine position size targets.
* Execution - Place trades to reach your position sizes.
* Risk Management - Manage the market risks.

Now onto watching the [video](https://www.youtube.com/watch?v=eynxyoKgpng&list=WL&index=4) and extracting rules for the different steps.

Content of the video: 
* candlestick charts
  * high low / open close
* trending markets
  * uptrend: chart continually making higher highs and higher lows
  * downtrend: chart continually making lower lows and lower highs
  * TASK: classify up and downtrend
    * [may be a help](https://www.investopedia.com/articles/active-trading/041814/four-most-commonlyused-indicators-trend-trading.asp)
* support & resistance
  * areas where the market is likely to react on (psychologically)
  * in uptrend:
    * support - price will bounce up
      * previous highest high from the uptrend
    * resistance
      * current highest high from the uptrend
  * for example in a trade
    * upward trend:
      * market comes to previous support level (you buy)
      * you want your stop loss below the support level
      * you want your take profit on the current highest high
* indicators
  * atr (average true range) - last 14 candles - calculates the pips (changes in price ) [how to calc pip in quantconnect](https://www.quantconnect.com/forum/discussion/1658/profit-in-pips/p1) maybe a pip is 1/10000
    * in a trade
      * target 2 times atr in pips
      * loss 1 times atr
      * 2:1 risk ratio
  * moving average 
    * lookback periods how many averages are taken m(20) -> 20 lookback
      * 20 trend (can also be used as trailing stop - do not take targets but follow the stoploss)
      * 50 support and resistance
      * 200 support and resistance
    * use to define trend
    * if price trading above m(20) -> up
    * if price below m(20) -> down
  * rsi
    * trying to trade reversals (it is a momentum indicator - price moving into certain direction for a longer amount of time)
    * price is below 30 -> time to buy for a reversal to the upside
    * price is above 70 -> its time to sell for a reversal to the downside
* candlestick patterns (how to enter into the markets)
  * 38,2% candle
    * 
  * Engulfing candle
  * Close above/below candle
* chart patterns
* breakout patterns


I already got some sample strategies in the cloud so lets log into lean
and get my projects from the cloud
```bash
lean login
lean cloud pull
```
