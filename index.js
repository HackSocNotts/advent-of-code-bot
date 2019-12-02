const Discord = require('discord.js');
const rp = require('request-promise-native');
const deepEqual = require('deep-equal');
var previousResult;

const sortLeaderboard = (members) => {
  const sorted = members.sort((member1, member2) => {
    return member2[1].local_score - member1[1].local_score
  });
  return sorted;
}

const getLeaderboard = async (embed) => {
  const leaderboard = rp.get({
    uri: process.env.LEADERBOARD,
    method: 'GET',
    headers: {
      Cookie: process.env.COOKIE,
    },
    json: true,
  });
  return leaderboard.then(response => {
    console.log(process.env.COOKIE);
    let leaderboardString = "**Leaderboard:**\n";
    const members = sortLeaderboard(Object.entries(response.members));
    let i = 1;
    let finalEmbed = embed;
    for (const member of members) {
      leaderboardString += `${i}. _${member[1].name}_: ${member[1].local_score}\n`;

      finalEmbed = finalEmbed.addField(`${i}. ${member[1].name}`, `Score of ${member[1].local_score} with ${member[1].stars} stars.`);

      i++;
    }
    return [leaderboardString, finalEmbed, response];
  });
};

sync = async (bot) => {  
  // const channel = bot.channels.get("515366371081846832") // advent-of-code
  // const channel = bot.channels.get("501071108359979020") // botspam
  const channel = bot.channels.get(process.env.CHANNEL);

  const embed = new Discord.RichEmbed()
      .setTitle("**Leaderboard**")
      .setDescription("Join our leaderboard at https://adventofcode.com/2019/leaderboard/private with code `216440-b64023a2`")
      .setFooter("The leaderboard has updated")
      .setURL("https://adventofcode.com/2019/leaderboard/private/view/216440")
      .setThumbnail("https://www.geek.com/wp-content/uploads/2017/12/advent-1-625x352.jpg")
      .setColor("#ffff66");

  const [leaderboardString, finalEmbed, raw] = await getLeaderboard(embed);
  
  if (!deepEqual(raw, previousResult, {strict: true})) {
    previousResult = raw;
    channel.setTopic(leaderboardString);
    channel.send(finalEmbed);
  }
};

const bot = new Discord.Client({ disableEveryone: true });

bot.on('ready', () => {
  console.log(`${bot.user.username} is online!`);
  bot.user.setActivity("Advent of Code", {
    url: "https://adventofcode.com/",
    type: "PLAYING",
  });
  sync(bot);
  setInterval(() => sync(bot), 300000);
});

bot.login(process.env.TOKEN);