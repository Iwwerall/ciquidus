var request = require('request');
 
var base_url = 'https://cryptohub.online/api';
function get_summary(coin, exchange, cb) {
    var summary = {};
    request({ uri: base_url + '/market/ticker/' + coin + '/', json: true }, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else if (body.Success === true) {
            summary['bid'] = body.Data['highestBid'].toFixed(8);
            summary['ask'] = body.Data['lowestAsk'].toFixed(8);
            summary['volume'] = body.Data['baseVolume'];
            summary['high'] = body.Data['high24hr'].toFixed(8);
            summary['low'] = body.Data['low24hr'].toFixed(8);
            summary['last'] = body.Data['last'].toFixed(8);
            summary['change'] = body.Data['percentChange'];
            return cb(null, summary);
        } else {
            return cb(error, null);
        }
    });
        
}
function get_trades(coin, exchange, cb) {
    var req_url = base_url + '/market/tradinghist/BTC_' + coin;
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (body.Success == true) {
            var tTrades = body.Data;
            var trades = [];
            for (var i = 0; i < tTrades.length; i++) {
                var Trade = {
                    orderpair: coin+'/BTC',
                    ordertype: tTrades[i].type,
                    amount: parseFloat(tTrades[i].amount).toFixed(8),
                    price: parseFloat(tTrades[i].rate).toFixed(8),
                    total: parseFloat(tTrades[i].total).toFixed(8),
                    timestamp: tTrades[i].date
                }
                trades.push(Trade);
            }
            return cb(null, trades);
        } else {
            return cb(body.Message, null);
        }
    });
}

function get_orders(coin, exchange, cb) {
  /* unclear implementation */
}


module.exports = {
    get_data: function (coin, exchange, cb) {
        var error = null;
        get_orders(coin, exchange, function (err, buys, sells) {
            if (err) { error = err; }
            get_trades(coin, exchange, function (err, trades) {
                if (err) { error = err; }
                get_summary(coin, exchange, function (err, stats) {
                    if (err) { error = err; }
                    return cb(error, { buys: buys, sells: sells, chartdata: [], trades: trades, stats: stats });
                });
            });
        });
    }
};
