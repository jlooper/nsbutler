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

require('daemon')();

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}
    
var Botkit = require('./lib/Botkit.js');
var os = require('os')
var request = require('request');
var request = require('request');
    
var controller = Botkit.slackbot({
    debug: false,
    json_file_store: './database'
});
    
var bot = controller.spawn({
    token: process.env.token
}).startRTM();
    
var categoryTypes = [];
    
var messageArrays = {
    postMessage: {
        for: 'If you see this, it let an admin know!',
        commands: ['message (.*) <@(.*)> <#(.*)>'],
        canUse: false
    },
    forumPost: {
        for: 'If you see this, it let an admin know!',
        commands: ['(.*)? (.*) #(.*)', '(.*)\n(.*)\n(.*)'],
        canUse: false
    },
    identify: {
        for: 'If you see this, it let an admin know!',
        commands: ['uptime', 'identify yourself', 'who are you', 'what is your name'],
        canUse: false
    },
    here: {
        for: 'If you see this, it let an admin know!',
        commands: ['Here', 'here', 'Online', 'online'],
        canUse: false
    },
    taco: {
        for: 'If you see this, it let an admin know!',
        commands: [':taco:'],
        canUse: false
    },
    adminList: {
        for: 'Lists all NSButler admin!',
        commands: ['Admin'],
        canUse: true
    },
    discourseUsernameSet: {
        for: 'If you see this, it let an admin know!',
        commands: ['DiscourseUser <@(.*)> -(.*)'],
        canUse: false
    },
    adminChange: {
        for: 'If you see this, it let an admin know!',
        commands: ['Admin <@(.*)>'],
        canUse: false
    },
    userCreate: {
        for: 'If you see this, it let an admin know!',
        commands: ['UserProfile <@(.*)> (.*)'],
        canUse: false
    },
    checkUserID: {
        for: 'If you see this, it let an admin know!',
        commands: ['UserID'],
        canUse: false
    },
    forumHelp: {
        for: 'Lists available commands',
        commands: ['Help'],
        canUse: true
    },
    forumHelp: {
        for: 'Lists forum posting templates',
        commands: ['Forum Help', 'Forum'],
        canUse: true
    },
    botTimeline: {
        for: 'Lists the bot\'s timeline',
        commands: ['Timeline', 'Milestone'],
        canUse: true
    },
    updateCategories: {
        for: 'Updates forum category list',
        commands: ['Update', 'Update Categories'],
        canUse: true
    },
    categoryList: {
        for: 'Lists forum categories',
        commands: ['Categories', 'Category', 'Category List'],
        canUse: true
    }
};
    
controller.hears(messageArrays.forumPost.commands, 'direct_mention', function(bot, message) {

    var userMessage = message.match[0];
    var question = '';
    var body = '';
    var categoryText = '';
    var category = 0;
    if (userMessage.indexOf('\n') == -1) {
        var index1 = userMessage.indexOf('? ');
        question = userMessage.substring(0, index1 + 1);
        var index2 = userMessage.indexOf(' #');
        body = userMessage.substring(index1 + 2, index2);
        categoryText = String(userMessage.substring(index2 + 2));
    } else {
        var index1 = userMessage.indexOf('\n');
        question = userMessage.substring(0, index1);
        var index2 = userMessage.lastIndexOf('\n');
        body = userMessage.substring(index1 + 1, index2);
        categoryText = userMessage.substring(index2 + 1);
    }
    if (categoryTypes.length == 0) {
        getCategories(bot, message, false);
    }
    category = categoryChecker(categoryText);
    if (category == -1) {
        bot.reply(message, 'Invalid category!');
        return;
    }
    var bodyParams = 'title=' + question + '&raw=' + body + '&category=' + category;
    var discourseUser = 'nsbutler';
    var userStorage = getUserStorage(message.user);
    if (userStorage != undefined) {
        discourseUser = userStorage.discourseID;
    }
    var options = {
        url: 'https://discourse.nativescript.org/posts?api_key=' + process.env.apiKey + '&api_username=' + discourseID + '&' + bodyParams.replace(/\s+/g, '%20').replace(/([?])/g, '%3F').replace(/([?])/g, '%2D').replace(/(['])/g, '%27').replace('#', ''),
        method: 'POST'
    };
    request(options, function(err, res, body) {
        switch(res.statusCode) {
            case 200:
                bot.reply(message, 'Posted successfully! Here is your link: ' + forumLinkMaker(JSON.parse(body)));
                break;
            case 422:
                var replyMessage = 'Error posting! Error:'
                var errors = JSON.parse(body).errors;
                for (err in errors) {
                    replyMessage += '\n' + errors[err];
                }
                bot.reply(message, replyMessage);
                break;
            case 429:
                var error = JSON.parse(body).error_type;
                bot.reply(message, 'Error posting! Error:\n' + error);
                break;
            default:
                bot.reply(message, 'Unhandled error code: ' + res.statusCode);
                console.log(body);
                break;
        }
    });
});
    
controller.hears(['Help'], 'direct_mention', function(bot, message) {
    
    var replyMessage = 'Here is a list of valid commands for you to give me.\n';
    
    replyMessage += '*Command | Purpose*';
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
    
controller.hears(messageArrays.categoryList.commands, 'direct_mention', function(bot, message) {
    
    var replyMessage = 'Here is a list of valid forum categories:';
    for (category in categoryTypes) {
        replyMessage += "\n";
        replyMessage += categoryTypes[category].name;
    }
    bot.reply(message, replyMessage);
});
    
controller.hears(messageArrays.forumHelp.commands, 'direct_mention', function(bot, message) {
    
    bot.reply(message, 'Please use one of the following formats to post to the forum!\n1:\n```<Question - min 15 chars>? <Body - min 20 chars> #<Category - valid from list (@nsbutler category)>```\n2:\n```<Question - min 15 chars>\n<Body - min 20 chars>\n<Category - valid from list (@nsbutler category)>```');
});
    
controller.hears(messageArrays.botTimeline.commands, 'direct_mention', function(bot, message) {
    
    bot.reply(message, '~1: Hosted on a server~\n2: Better help commands\n3: Forum reward tracker');
});
    
controller.hears(messageArrays.updateCategories.commands, 'direct_mention', function(bot, message) {
    
    getCategories(bot, message, true);
});

controller.hears(messageArrays.identify.commands, 'direct_mention', function(bot, message) {
    
    var hostname = os.hostname();
    var uptime = formatUptime(process.uptime());
    bot.reply(message, ':robot_face: I am a bot named <@' + bot.identity.name + '>. I have been running for ' + uptime + ' on ' + hostname + '.');
});
    
controller.hears(messageArrays.here.commands, 'direct_mention', function(bot, message) {
    
    bot.reply(message, 'I am online and in the <#' + message.channel + '> channel!');
});
    
controller.hears(messageArrays.taco.commands, 'direct_mention', function(bot, message) {
    
    bot.reply(message, 'As much as I appreciate your generosity, please do not send me tacos as i cannot receive them!');
});
    
controller.hears(['(.*)'], 'direct_mention', function(bot, message) {
    
    console.log(message);
    bot.reply(message, 'Unrecognized command!');
});

controller.hears(messageArrays.userCreate.commands, 'direct_message', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user_data) {
        if (user_data != undefined) {
            if(user_data.isAdmin == true) {
                var startUserTag = message.match[0].indexOf('<@');
                var endUserTag = message.match[0].indexOf('> ');
                var split = message.match[0].indexOf(' | ');
                var user = message.match[0].substring(startUserTag + 2, endUserTag)
                var discourseID = message.match[0].substring(endUserTag + 2, split);
                var isAdmin = Boolean(message.match[0].substring(split + 3));
                console.log(Boolean(message.match[0].substring(split + 3)))
                user_data = getUserStorage(user);
                if (user_data != undefined) {
                    user_data.discourseID = discourseID;
                    controller.storage.users.save(user_data, function(err) {
                        if (err == null || err == undefined) {
                            bot.reply(message, 'User storage created!');
                        } else {
                            bot.reply(message, 'Error!\n' + err);
                        }
                    });
                } else {
                    controller.storage.users.save({id: user, discourseID: discourseID, isAdmin: isAdmin}, function(err) {
                        if (err == null || err == undefined) {
                            bot.reply(message, 'User storage created!');
                        } else {
                            bot.reply(message, 'Error!\n' + err);
                        }
                    });
                }
            } else {
                bot.reply(message, 'Please do not message me directly!');
            }
        } else {
            bot.reply(message, 'Please do not message me directly!');
        }
    });
});

controller.hears(messageArrays.discourseUsernameSet.commands, 'direct_message', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user_data) {
        if (user_data != undefined) {
            if (user_data.isAdmin == true) {
                var error;
                user_data = getUserStorage(message.match[1]);
                if (user_data != undefined) {
                    user_data.discourseID = message.match[2];
                    controller.storage.users.save(user_data, function(err) {
                        if (err == null || err == undefined) {
                            bot.reply(message, 'User <@' + message.match[1] + '>\'s DiscourseID set to ' + message.match[2]);
                        } else {
                            bot.reply(message, 'Error!\n' + err);
                        }
                    });
                } else {
                    controller.storage.users.save({id: message.match[1], discourseID: message.match[2], isAdmin: false}, function(err) {
                        if (err == null || err == undefined) {
                            bot.reply(message, 'User <@' + message.match[1] + '>\'s DiscourseID set to ' + message.match[2]);
                        } else {
                            bot.reply(message, 'Error!\n' + err);
                        }
                    });
                }
            } else {
                bot.reply(message, 'Please do not message me directly!');
            }
        } else {
            bot.reply(message, 'Please do not message me directly!');
        }
    });
});

controller.hears(messageArrays.adminChange.commands, 'direct_message', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user_data) {
        if (user_data != undefined) {
            if (user_data.isAdmin == true) {
                var error;
                user_data = getUserStorage(message.match[1]);
                if (user_data != undefined) {
                    user_data.isAdmin = true;
                    controller.storage.users.save(user_data, function(err) {
                        if (err == null || err == undefined) {
                            bot.reply(message, 'User <@' + message.match[1] + '> was successfully granted Admin permissions!');
                        } else {
                            bot.reply(message, 'Error!\n' + err);
                        }
                    });
                } else {
                    controller.storage.users.save({id: message.match[1], discourseID: '', isAdmin: true}, function(err) {
                        if (err == null || err == undefined) {
                            bot.reply(message, 'User <@' + message.match[1] + '> was successfully granted Admin permissions!');
                        } else {
                            bot.reply(message, 'Error!\n' + err);
                        }
                    });
                }
            } else {
                bot.reply(message, 'Please do not message me directly!');
            }
        } else {
            bot.reply(message, 'Please do not message me directly!');
        }
    });
});

controller.hears(messageArrays.checkUserID.commands, 'direct_message', function(bot, message) {
    
    bot.reply(message, 'Your user ID for Slack is: ' + message.user);
});

controller.hears(['(.*)'], 'direct_message', function(bot, message) {
    
    controller.storage.users.get(message.user, function(err, user_data) {
        if (user_data != undefined) {
            if (user_data.isAdmin == true) {
                bot.reply(message, 'Hello Admin! How can I help?');
            } else {
                bot.reply(message, 'Please do not message me directly!');
            }
        } else {
            bot.reply(message, 'Please do not message me directly!');
        }
    });
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
};
    
function forumLinkMaker(body) {
    var url = 'https://discourse.nativescript.org/t/';
    url += body.topic_slug;
    url += '/';
    url += body.topic_id;
    return url;
};
    
function categoryChecker(categoryText) {
    if (categoryText.substr(0, 1) == '#') {
        categoryText = categoryText.substring(1)
    }
    for (category in categoryTypes) {
        if (categoryText == categoryTypes[category].name || categoryText == categoryTypes[category].id) {
            return categoryTypes[category].id;
        }
    }
    return -1;
};

function getCategories(bot, message, updateOnly) {
    
    var options = {
        url: 'https://discourse.nativescript.org/categories.json?api_key=' + process.env.apiKey + '&api_username=nsbutler',
        method: 'GET'
    };
    request(options, function(err, res, body) {
        switch(res.statusCode) {
            case 200:
                if (updateCategoryArray(JSON.parse(body).category_list.categories) == true && updateOnly == true) {
                    bot.reply(message, 'Updated!');
                }
                break;
            default:
                if(updateOnly == true) {
                    bot.reply(message, 'Unhandled error code: ' + res.statusCode);
                } else {
                    bot.reply(message, 'Error while getting category list: ' + res.statusCode);
                }
                break;
        }
    });
};
    
function updateCategoryArray(newList) {
    categoryList = [];
    for (category in newList) {
        if (newList[category].read_restricted == false) {
            var value = {id: newList[category].id, name: newList[category].name, slug: newList[category].slug};
            categoryTypes.push(value);
        }
    };
    return true;
};

function getUserStorage(userID) {
    controller.storage.users.get(userID, function(err, user_data) {
        return user_data;
    });
};

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
};
*/
