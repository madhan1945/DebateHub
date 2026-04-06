const Debate   = require('../models/Debate');
const Argument = require('../models/Argument');
const User     = require('../models/User');

/**
 * Close all debates whose endTime has passed.
 * Updates winner, awards reputation to winning-side creators.
 * Called once on server start and then every 5 minutes.
 */
async function closeExpiredDebates() {
  try {
    const expired = await Debate.find({
      status: 'active',
      endTime: { $lt: new Date() },
    });

    if (expired.length === 0) return;

    for (const debate of expired) {
      // Determine winner
      let winner = 'tie';
      if (debate.supportCount > debate.opposeCount) winner = 'support';
      else if (debate.opposeCount > debate.supportCount) winner = 'oppose';

      debate.status = 'closed';
      debate.winner = winner;
      await debate.save();

      // Award 10 rep to winning-side argument authors
      if (winner !== 'tie') {
        const winningArgs = await Argument.find({
          debate: debate._id,
          side: winner,
          isDeleted: false,
        }).distinct('author');

        if (winningArgs.length > 0) {
          await User.updateMany(
            { _id: { $in: winningArgs } },
            { $inc: { reputationPoints: 10, debateWins: 1 } }
          );
        }
      }

      console.log(`🔒 Closed debate "${debate.title.slice(0, 40)}..." — winner: ${winner}`);
    }
  } catch (err) {
    console.error('Cron error (closeExpiredDebates):', err.message);
  }
}

function startCronJobs() {
  // Run immediately on start
  closeExpiredDebates();
  // Then every 5 minutes
  setInterval(closeExpiredDebates, 5 * 60 * 1000);
  console.log('⏰ Cron jobs started (debate auto-close every 5 min)');
}

module.exports = { startCronJobs, closeExpiredDebates };
