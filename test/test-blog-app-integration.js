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
    //console.info('seeding restaurant data');
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateBlogPostData());
    }
    //console.info(seedData);
    return BlogPost.insertMany(seedData);
}

function generateBlogPostData() {
    return {
        title: faker.name.title(),
        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
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

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    });

    describe('GET endpoint', function () {
        it('should return all existing blog posts', function () {
            let res;
            return chai.request(app)
                .get('/posts')
                .then(function (_res) {
                    res = _res;
                    //console.log(res.body);
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.length.of.at.least(1);
                    return BlogPost.count();
                })
                .then(function (count) {
                    expect(res.body).to.have.length.of(count);
                });
        });
        it('should return blog posts with the right fields', function () {
            let resBlogPost;
            return chai.request(app)
                .get('/posts')
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.length.of.at.least(1);

                    res.body.forEach(function (blogpost) {
                        console.log(blogpost);
                        expect(blogpost).to.be.a('object');
                        expect(blogpost).to.include.keys(
                            'id', 'title', 'author', 'content', 'created');
                    });
                    resBlogPost = res.body[0];
                    return BlogPost.findById(resBlogPost.id);
                })
                .then(function (blogpost) {
                    expect(resBlogPost.id).to.equal(blogpost.id);
                    expect(resBlogPost.title).to.equal(blogpost.title);
                    expect(resBlogPost.author).to.equal(blogpost.author);
                    expect(resBlogPost.content).to.equal(blogpost.content);
                    expect(resBlogPost.created).to.equal(blogpost.created);

                });
        });
    });
});
