/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node slack_bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');
var request = require('request');

var controller = Botkit.slackbot({
    debug: false,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

var messageArrays = {
    forumPost: {
        for: 'If you see this, it let an admin know!',
        commands: ['(.*)? (.*) #(.*)', '(.*)\n(.*)\n(.*)'],
        canUse: false
    },
    forumHelp: {
        for: 'Lists available commands',
        commands: ['Help', 'help'],
        canUse: true
    },
    forumHelp: {
        for: 'Lists forum posting templates',
        commands: ['Forum Help', 'Forum help', 'forum help', 'Forum', 'forum'],
        canUse: true
    },
    botTimeline: {
        for: 'Lists the bot\'s timeline',
        commands: ['Timeline', 'TimeLine', 'timeLine', 'timeline', 'MileStone', 'Milestone', 'mileStone', 'milestone'],
        canUse: true
    }
};

controller.hears(['Help'], 'direct_mention', function(bot, message) {

    var replyMessage = 'Here is a list of valid commands for you to give me.\n';

    replyMessage += '*Command   | Purpose*';
    replyMessage += '\n*--------------------------------*\n';
    for (command in messageArrays) {
        if (messageArrays[command].canUse == true) {
            replyMessage += messageArrays[command].commands[0];
            replyMessage += " | ";
            replyMessage += messageArrays[command].for;
            replyMessage += '\n--------------------------------\n';
        }
    }
    bot.reply(message, replyMessage);
});

controller.hears(messageArrays.forumPost.commands, 'direct_mention', function(bot, message) {
    var userMessage = message.match[0];
    var question = '';
    var body = '';
    var tagText = '';
    var tag = 0;
    if (userMessage.indexOf('\n') == -1) {
        var index1 = userMessage.indexOf('? ');
        question = userMessage.substring(0, index1 + 1);
        var index2 = userMessage.indexOf(' #');
        body = userMessage.substring(index1 + 2, index2);
        tagText = String(userMessage.substring(index2 + 2));
    } else {
        var index1 = userMessage.indexOf('\n');
        question = userMessage.substring(0, index1);
        var index2 = userMessage.lastIndexOf('\n');
        body = userMessage.substring(index1 + 1, index2);
        tagText = userMessage.substring(index2 + 1);
    }
    if (tagText == 'test' || tagText == '33') {
        tag = 33;
    }
    console.log('Question: "' + question + '"');
    console.log('Body: "' + body + '"');
    console.log('Tag: "' + tagText + '"');
    var bodyParams = 'title=' + question + '&raw=' + body + '&category=' + tag;
    console.log(bodyParams.replace(/\s+/g, '%20').replace(/([?])/g, '%3F').replace(/([?])/g, '%2D'));
    var options = {
        url: 'https://discourse.nativescript.org/posts?api_key=' + process.env.apiKey + '&api_username=nsbutler&' + bodyParams.replace(/\s+/g, '%20').replace(/([?])/g, '%3F').replace(/([?])/g, '%2D').replace(/(['])/g, '%27').replace('#', ''),
        method: 'POST'
    };
    request(options, function(err, res, body) {
        switch(res.statusCode) {
            case 200:
                bot.reply(message, 'Post published! Here is your link: ' + forumLinkMaker(JSON.parse(body)));
                break;
            case 422:
                var replyMessage = 'Error!'
                var errors = JSON.parse(body).errors;
                for (err in errors) {
                    replyMessage += '\n' + errors[err];
                }
                bot.reply(message, replyMessage);
                break;
            default:
                bot.reply(message, 'Unhandled error code: ' + res.statusCode);
                break;
        }
    });
});

controller.hears(messageArrays.forumHelp.commands, 'direct_mention', function(bot, message) {

    // bot.reply(message, 'Please use one of the following formats to post to the forum!\n1:\n```<Question>? <Body> #<Tag>```\n2:\n```<Question>\n<Body>\n<Tag>```');
    bot.reply(message, '');
});

controller.hears(messageArrays.botTimeline.commands, 'direct_mention', function(bot, message) {

    bot.reply(message, '~1: Hosted on heroku~\n2: Better help commands\n3: Forum reward tracker');
});

/*
controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'nativescript',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello. I am at your service!');
        }
    });
});

controller.hears(['vscode'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'nativescript',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });

    controller.storage.users.get(message.user, function(err, user) {
        bot.reply(message, 'Learn more about Visual Studio Code for NativeScript here: https://www.nativescript.org/nativescript-for-visual-studio-code');        
    });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});


controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.startConversation(message, function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    }, 3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});
*/

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'], 'direct_mention', function(bot, message) {

    var hostname = os.hostname();
    var uptime = formatUptime(process.uptime());

    bot.reply(message, ':robot_face: I am a bot named <@' + bot.identity.name + '>. I have been running for ' + uptime + ' on ' + hostname + '.');

});
    
controller.hears(['(.*)'], 'direct_mention', function(bot, message) {
    
    bot.reply(message, 'Unrecognized command!');
});

controller.hears(['(.*)'], 'direct_message', function(bot, message) {

    bot.reply(message, 'Please do not message me directly!');
});

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

function forumLinkMaker(body) {
    var url = 'https://discourse.nativescript.org/t/';
    url += body.topic_slug;
    url += '/';
    url += body.topic_id;
    return url;
}
