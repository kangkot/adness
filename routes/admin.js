/* jshint node: true */
'use strict';

var _ = require('lodash');
var moment = require('moment');
var config = require('../config');

exports = module.exports = function(req, res) {
  // admin check
  if (!req.user.admin) { return res.redirect(req.browsePrefix); }
  req.model.load('auctionsTimeRelative', req);
  req.model.end(function(err, models) {
    if (err) { console.log(err); }

    // flash messages 
    var infoMessage = req.flash('info');

    // open auctions sorted by start time (most recent first)
    var open = models.auctionsTimeRelative.open;
    var sortedOpen = _.sortBy(open, function(auction) {
      return auction.start;
    });

    // closed auctions sorte by start time (most recent first)
    var closed = models.auctionsTimeRelative.closed;
    var sortedClosed = _.sortBy(closed, function(auction) {
      return auction.start;
    });

    // future auctions sorte by start time (most recent first)
    var future = models.auctionsTimeRelative.future;
    var sortedFuture = _.sortBy(future, function(auction) {
      return auction.start;
    });

    // past auctions sorted by end time (most recent first)
    var past = models.auctionsTimeRelative.past;
    var sortedPast = _.sortBy(past, function(auction) {
      return -auction.end;
    });

    // update start and end times
    formatAuctionTime(sortedOpen);
    formatAuctionTime(sortedClosed);
    formatAuctionTime(sortedFuture);
    formatAuctionTime(sortedPast);

    // cull regions
    var regions = _.pluck(config.regions, 'name');

    // serverTime 
    var serverTime = moment().utc().format('YYYY MMMM D, h:mm:ss A ZZ');

    res.render('admin', {
        auctionsOpen: sortedOpen,
        auctionsClosed: sortedClosed,
        auctionsFuture: sortedFuture,
        auctionsPast: sortedPast,
        infoMessage: infoMessage,
        regions: regions,
        serverTime: serverTime,
        browsePrefix: req.browsePrefix,
        user: req.user
      }
    );
  });
};

function formatAuctionTime(auctions) {
  auctions.forEach(function(auction) {
    var startTime = moment(auction.start).utc().format('YYYY MMMM D, h:mm:ss A ZZ');
    var endTime = moment(auction.end).utc().format('YYYY MMMM D, h:mm:ss A ZZ');
    startTime += ' (' + moment(auction.start).fromNow() +')';
    endTime += ' (' + moment(auction.end).fromNow() + ')';
    auction.start = startTime;
    auction.end = endTime;
  });
}
