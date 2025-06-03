const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

const getContextInfo = (m) => ({
    mentionedJid: [m.sender],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363400583993139@newsletter',
        newsletterName: 'ROVER-XMD',
        serverMessageId: 143,
    },
});

const fallbackImages = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

const GroupEvents = async (conn, update) => {
    try {
        if (!isJidGroup(update.id)) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants.length;

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(update.id, 'image');
        } catch {
            ppUrl = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
        }

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString();
            const ctxInfo = getContextInfo({ sender: num });

            if (update.action === "add" && config.WELCOME === "true") {
                const text = `Hey @${userName} 👋\nWelcome to *${metadata.subject}*.\nYou are member number ${groupMembersCount} in this group. 🙏\nTime joined: *${timestamp}*\nPlease don't share links and read the group description to avoid being removed:\n${desc}\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ HACKLINK TECH.INC*`;

                try {
                    await conn.sendMessage(update.id, {
                        image: { url: ppUrl },
                        caption: text,
                        mentions: [num],
                        contextInfo: ctxInfo,
                    });
                } catch (err) {
                    console.error(`❌ Welcome message failed for ${num}:`, err.message);
                }

            } else if (update.action === "remove" && config.WELCOME === "true") {
                const text = `Goodbye @${userName}. 😔\nAnother member has left the group.\nTime left: *${timestamp}*\nThe group now has ${groupMembersCount} members. 😭\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ HACKLINK TECH.INC`;

                try {
                    await conn.sendMessage(update.id, {
                        image: { url: ppUrl },
                        caption: text,
                        mentions: [num],
                        contextInfo: ctxInfo,
                    });
                } catch (err) {
                    console.error(`❌ Goodbye message failed for ${num}:`, err.message);
                }

            } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                const promoter = update.author.split("@")[0];
                const text = `*Admin Event*\n\n@${promoter} has promoted @${userName} to admin. 🎉\nTime: ${timestamp}\n*Group:* ${metadata.subject}`;

                try {
                    await conn.sendMessage(update.id, {
                        text,
                        mentions: [update.author, num],
                        contextInfo: getContextInfo({ sender: update.author }),
                    });
                } catch (err) {
                    console.error(`❌ Promote event failed:`, err.message);
                }

            } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                const demoter = update.author.split("@")[0];
                const text = `*Admin Event*\n\n@${demoter} has demoted @${userName} from admin. 👀\nTime: ${timestamp}\n*Group:* ${metadata.subject}`;

                try {
                    await conn.sendMessage(update.id, {
                        text,
                        mentions: [update.author, num],
                        contextInfo: getContextInfo({ sender: update.author }),
                    });
                } catch (err) {
                    console.error(`❌ Demote event failed:`, err.message);
                }
            }
        }
    } catch (err) {
        console.error('❌ General group event error:', err);
    }
};

module.exports = GroupEvents;
