import { Client, MessageEmbed } from 'discord.js';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import * as UniqueID from './utils/uniqueid';
import * as config from './config';

const db = new JsonDB(new Config(config.database.name, true, true, '/'));

class Student {
    uid: string;
    dscid: number;
    first: string;
    last: string;
    grade: number;

    constructor(uid: string, dscid: number, first: string, last: string, grade: number) {
        this.uid = uid;
        this.dscid = dscid;
        this.first = first;
        this.last = last;
        this.grade = grade;
    }
}

const client = new Client()

client.on("ready", () => {
    console.log(`Logged in as ${client.user!.tag}. Ready to help ${client.users.cache.size} users in ${client.guilds.cache.size} servers!`);
})

client.on("message", (message) => {
    if (message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "createprofile") {
        const uid = UniqueID();
        let [first, last, grade] = args;
        if (isNaN(Number(grade)) && !grade) {
            const embed = new MessageEmbed()
                .setTitle(`❌ Incorrect Usage`)
                .setDescription(`**Example:** \`\`${config.prefix}createprofile John Doe 10\`\``)
                .setThumbnail(config.embed.logo)
                .setColor(config.embed.color)
                .setFooter(config.embed.footer)
            message.channel.send(embed)
        }
        else {
            const student = new Student(uid, Number(message.author.id), first, last, Number(grade))
            db.push('/' + message.author.id, student);

            const embed = new MessageEmbed()
                .setTitle(`✅ Student Account Created!`)
                .setDescription(`Congratulations, ${student.first} ${student.last}, your account was just created! Below is some key information you might need for your account.`)
                .addField(`First Name:`, student.first)
                .addField(`Last Name:`, student.last)
                .addField(`Grade:`, student.grade)
                .addField(`Unique ID:`, uid)
                .setThumbnail(config.embed.logo)
                .setColor(config.embed.color)
                .setFooter(config.embed.footer)
            message.channel.send(embed)
        }

    }

    if (command === 'profile') {
        try {
            var data = db.getData("/" + message.author.id)
            const embed = new MessageEmbed()
                .setTitle(data.first + " " + data.last)
                .addField(`Grade:`, data.grade)
                .addField(`Unique ID:`, data.uid)
                .setThumbnail(config.embed.logo)
                .setColor(config.embed.color)
                .setFooter(config.embed.footer)
            message.channel.send(embed)

        } catch (err) {
            const embed = new MessageEmbed()
                .setTitle(`❌ Could not find User Profile!`)
                .setDescription(`We could not find a profile under your ID \`\`${message.author.id}\`\` \nTry making a profile using ${config.prefix}createprofile`)
                .setThumbnail(config.embed.logo)
                .setColor(config.embed.color)
                .setFooter(config.embed.footer)
            message.channel.send(embed)
            console.error(err)
        }
    }
})

client.login(config.token)