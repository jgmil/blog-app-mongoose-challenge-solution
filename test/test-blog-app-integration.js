const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {
    BlogPost
} = require('../models');
const {
    app,
    runServer,
    closeServer
} = require('../server')
const {
    TEST_DATABASE_URL
} = require('../config');

chai.use(chaiHttp);

function seedBlogPostData() {
    console.info('seeding restaurant data');
    const seedData = [];

    for (let i = 1; i <= 10, i++) {
        seedData.push(generateBlogPostData());
    }
    return BlogPost.insertMany(seedData);
}

function generateBlogPostData() {
    return {
        title: faker.name.title(),
        author: {
            firstName: faker.name.firstName,
            lastName: fake.name.lastName,
        },
        content: faker.lorem.paragraph(),
    };
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Blog Post API resource', function () {
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return seedBlogPostData();
    });

    afterEach(fucntion() {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    });

});
