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
        title: faker.lorem.words(),
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

                    res.body.forEach(function (body) {
                        //console.log(body);
                        expect(body).to.be.a('object');
                        expect(body).to.include.keys(
                            'id', 'title', 'author', 'content', 'created');
                    });
                    console.log(res.body[0])
                    resBlogPost = res.body[0];
                    return BlogPost.findById(resBlogPost.id);
                })
                .then(function (body) {
                    console.log("resBlogPost.author is " + resBlogPost.author);
                    console.log("body.author is " + body.author);
                    expect(resBlogPost.id).to.equal(body.id);
                    expect(resBlogPost.title).to.equal(body.title);
                    // need to fix author part
                    //                    expect(resBlogPost.author).to.equal(body.author);
                    expect(resBlogPost.content).to.equal(body.content);
                    //                    expect(resBlogPost.created).to.equal(body.created);

                });
        });
    });

    describe('POST endpoint', function () {
        it('should add a new blog post', function () {
            const newBlogPost = generateBlogPostData();

            return chai.request(app)
                .post('/posts')
                .send(newBlogPost)
                .then(function (res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.keys(
                        'id', 'title', 'author', 'content', 'created');
                    expect(res.body.id).to.not.be.null;
                    expect(res.body.title).to.equal(newBlogPost.title);
                    expect(res.body.content).to.equal(newBlogPost.content);
                    //                    expect(res.body.author).to.equal(newBlogPost.author);
                    return BlogPost.findById(res.body.id);
                })
                .then(function (blogPost) {
                    expect(blogPost.title).to.equal(newBlogPost.title);
                    expect(blogPost.content).to.equal(newBlogPost.content);
                    //                    expect(blogPost.author).to.equal(newBlogPost.author);
                });

        });
    });

    describe('PUT enpooint', function () {
        it('should update fields you send over', function () {
            const updateData = {
                title: 'New Title',
                content: 'changed content'
            };

            return BlogPost
                .findOne()
                .then(function (blogPost) {
                    updateData.id = blogPost.id;

                    return chai.request(app)
                        .put(`/posts/${blogPost.id}`)
                        .send(updateData);
                })
                .then(function (res) {
                    expect(res).to.have.status(204);

                    return BlogPost.findById(updateData.id);
                })
                .then(function (blogPost) {
                    expect(blogPost.title).to.equal(updateData.title);
                    expect(blogPost.content).to.equal(updateData.content);
                });

        });
    });

    describe('DELETE endpoing', function() {
        let blogPost;
        return BlogPost
        .findOne()
        .then(function(_blogPost) {
            blogPost = _blogPost;
            return chai.request(app).delete(`/posts/${blogPost.id}`);
        })
        .then(function(res){
            expect(res).to.have.status(204);
            return BlogPost.findById(blogPost.id);
        })
        .then(function(_restaurant) {
            expect(_restaurant).to.be.null
        });
    });
});
